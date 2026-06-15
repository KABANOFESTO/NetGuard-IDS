from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer, AdminUserCreateSerializer, InitialAdminBootstrapSerializer
from .permissions import IsAdmin, IsAdminOrInvestigator, IsAdminOrInvestigatorOrPolice, IsPolice, IsInvestigator
from AuditLog.audit_log_utils import log_action 
from devices.models import Device
from devices.serializers import DeviceSerializer
from security.models import BlockedEntity
from security.network_scope import get_client_ip, is_controlled_request
from monitoring.services import create_network_activity
import logging

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(
            self.request,
            'USER_CREATE',
            target_user=user,
            additional_data={'registration_method': 'self_registration'}
        )
        logger.info(f"New user self-registered: {user.email}")


class AdminUserCreateView(generics.CreateAPIView):
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log user creation by admin
        log_action(
            request,
            'USER_CREATE',
            target_user=user,
            additional_data={
                'registration_method': 'admin_created',
                'created_by': request.user.email,
                'role': user.role,
                'temporary_password_sent': True
            }
        )
        
        try:
            frontend_login_url = getattr(settings, 'FRONTEND_LOGIN_URL', 'http://localhost:3000/login')
            
            send_mail(
                subject="Your Account Has Been Created",
                message=f"Hello {user.username},\n\n"
                       f"An administrator has created an account for you with the following details:\n\n"
                       f"Username: {user.username}\n"
                       f"Email: {user.email}\n"
                       f"Temporary Password: {user.temporary_password}\n"
                       f"Role: {user.get_role_display()}\n\n"
                       f"Please log in at {frontend_login_url} and change your password immediately.\n\n"
                       f"If you didn't expect this email, please contact your system administrator.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"User creation email sent to {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to send user creation email to {user.email}: {str(e)}")
            
            # Log email failure
            log_action(
                request,
                'EMAIL_SEND_FAILURE',
                target_user=user,
                additional_data={
                    'email_type': 'user_creation',
                    'error': str(e)
                }
            )
           
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "message": "User created successfully but failed to send email.",
                    "user_id": user.id,
                    "email": user.email
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "User created successfully. Email with credentials sent."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class InitialAdminBootstrapView(generics.CreateAPIView):
    serializer_class = InitialAdminBootstrapSerializer
    permission_classes = [permissions.AllowAny]

    def _is_local_request(self, request):
        remote_addr = request.META.get("REMOTE_ADDR", "")
        forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
        forwarded_ip = forwarded_for.split(",")[0].strip() if forwarded_for else ""
        allowed_local_hosts = {"127.0.0.1", "::1", "localhost"}
        return remote_addr in allowed_local_hosts or forwarded_ip in allowed_local_hosts

    def create(self, request, *args, **kwargs):
        configured_secret = getattr(settings, "INITIAL_ADMIN_BOOTSTRAP_SECRET", "")
        provided_secret = request.headers.get("X-Initial-Admin-Secret") or request.data.get("bootstrap_secret")
        is_local_debug_bootstrap = settings.DEBUG and self._is_local_request(request)

        if User.objects.filter(role="Admin").exists():
            return Response(
                {"error": "An admin account already exists. Use the authenticated admin creation endpoint instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if configured_secret:
            if provided_secret != configured_secret:
                return Response(
                    {"error": "Invalid bootstrap secret."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif not is_local_debug_bootstrap:
            return Response(
                {
                    "error": (
                        "Initial admin bootstrap is only available without a secret in local DEBUG mode. "
                        "Configure INITIAL_ADMIN_BOOTSTRAP_SECRET for other environments."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        log_action(
            request,
            'USER_CREATE',
            target_user=user,
            additional_data={'registration_method': 'initial_admin_bootstrap'}
        )

        return Response(
            {
                "message": "Initial admin account created successfully.",
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyTokenObtainView(APIView):
    permission_classes = [permissions.AllowAny]

    def _extract_device_identity(self, request):
        return {
            "device_id": request.data.get("device_id"),
            "mac_address": request.data.get("mac_address"),
            "device_name": request.data.get("device_name"),
            "device_type": request.data.get("device_type"),
            "operating_system": request.data.get("operating_system"),
            "registration_notes": request.data.get("registration_notes"),
        }

    def _resolve_device(self, request):
        device_id = request.data.get("device_id")
        mac_address = request.data.get("mac_address")
        if device_id:
            return Device.objects.filter(pk=device_id).first()
        if mac_address:
            return Device.objects.filter(mac_address=mac_address).first()
        return None

    def _get_request_mac(self, request):
        return (
            request.headers.get("X-Device-Mac")
            or request.data.get("mac_address")
            or request.data.get("device_mac")
            or ""
        )

    def _ensure_device_record(self, request, user, ip_address):
        device = self._resolve_device(request)
        device_identity = self._extract_device_identity(request)

        if device is not None:
            if device.owner_id is None or device.owner_id == user.id:
                device.owner = user
                device.ip_address = ip_address
                if device_identity.get("device_name"):
                    device.device_name = device_identity["device_name"]
                if device_identity.get("device_type"):
                    device.device_type = device_identity["device_type"]
                if device_identity.get("operating_system"):
                    device.operating_system = device_identity["operating_system"]
                if device_identity.get("registration_notes"):
                    device.registration_notes = device_identity["registration_notes"]
                if device.status == "blocked":
                    device.is_registered = False
                device.save()
            return device

        if device_identity.get("mac_address"):
            return Device.objects.create(
                owner=user,
                device_name=device_identity.get("device_name") or f"{user.username}'s device",
                device_type=device_identity.get("device_type") or "other",
                ip_address=ip_address,
                mac_address=device_identity["mac_address"],
                operating_system=device_identity.get("operating_system"),
                registration_notes=device_identity.get(
                    "registration_notes",
                    "Auto-registered during login to support network access monitoring.",
                ),
                is_registered=False,
                status="unknown",
            )

        return None

    def _build_network_access_context(self, user, device):
        request_mac = getattr(self, "_current_request_mac", "")
        in_controlled_network = is_controlled_request(self.request)
        blocked_by_mac = bool(
            in_controlled_network
            and request_mac
            and BlockedEntity.objects.filter(mac_address=request_mac, is_active=True).exists()
        )
        if device is None:
            if blocked_by_mac:
                return {
                    "access_status": "blocked",
                    "device_state": "blocked",
                    "blocked": True,
                    "current_device": None,
                    "message": "Network access is blocked on the current Wi-Fi because this device MAC address is restricted.",
                }
            return {
                "access_status": "granted",
                "device_state": "untracked",
                "blocked": False,
                "current_device": None,
                "message": "Network access granted. No device record was attached to this session.",
            }

        blocked = in_controlled_network and (
            device.status == "blocked"
            or BlockedEntity.objects.filter(device=device, is_active=True).exists()
            or blocked_by_mac
        )
        attention = not device.is_registered or device.status in {"unknown", "suspicious"}
        access_status = "blocked" if blocked else "granted_with_attention" if attention else "granted"
        device_state = "blocked" if blocked else "unregistered" if not device.is_registered else "known"
        message = (
            "Network access is blocked on the current Wi-Fi because this device is restricted."
            if blocked
            else "Network access granted with device monitoring enabled."
            if attention
            else "Network access granted."
        )
        return {
            "access_status": access_status,
            "device_state": device_state,
            "blocked": blocked,
            "current_device": DeviceSerializer(device, context={"request": None}).data,
            "message": message,
        }

    def _get_request_ip(self, request):
        return get_client_ip(request)

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        ip_address = self._get_request_ip(request)
        self._current_request_mac = self._get_request_mac(request)
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            is_controlled_request(request)
            and self._current_request_mac
            and BlockedEntity.objects.filter(mac_address=self._current_request_mac, is_active=True).exists()
        ):
            create_network_activity(
                request=request,
                user=None,
                device=None,
                activity_type="restricted_access",
                description="Blocked MAC attempted to sign in.",
                ip_address=ip_address,
                outcome="blocked",
                metadata={"reason": "mac_blocked", "mac_address": self._current_request_mac},
                is_suspicious=True,
            )
            return Response(
                {"error": "This device MAC address has been blocked by the administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        user = authenticate(username=email, password=password)
        
        if user:
            device = self._ensure_device_record(request, user, ip_address)
            if device and device.owner_id == user.id and (
                device.status == "blocked"
                or BlockedEntity.objects.filter(device=device, is_active=True).exists()
            ):
                create_network_activity(
                    request=request,
                    user=user,
                    device=device,
                    activity_type="restricted_access",
                    description="Blocked device attempted to sign in.",
                    ip_address=ip_address,
                    outcome="blocked",
                    metadata={"reason": "device_blocked"},
                    is_suspicious=True,
                )
                return Response(
                    {"error": "This device has been blocked by the administrator."},
                    status=status.HTTP_403_FORBIDDEN
                )
            if user.is_active:
                refresh = RefreshToken.for_user(user)
                create_network_activity(
                    request=request,
                    user=user,
                    device=device,
                    activity_type="login",
                    description="Successful login via email/password authentication.",
                    ip_address=ip_address,
                    outcome="success",
                    metadata={"login_method": "email_password"},
                )
                
                # Log successful login
                log_action(
                    request,
                    'LOGIN',
                    target_user=user,
                    additional_data={'login_method': 'email_password'}
                )
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user, context={"request": request}).data,
                    'network_access': self._build_network_access_context(user, device),
                }, status=status.HTTP_200_OK)
            else:
                # Log failed login due to inactive account
                create_network_activity(
                    request=request,
                    user=user,
                    device=device,
                    activity_type="login_attempt",
                    description="Login blocked because the account is deactivated.",
                    ip_address=ip_address,
                    outcome="blocked",
                    metadata={"reason": "account_deactivated"},
                    is_suspicious=True,
                )
                log_action(
                    request,
                    'LOGIN',
                    target_user=user,
                    additional_data={'status': 'failed', 'reason': 'account_deactivated'}
                )
                return Response(
                    {'error': 'Account is deactivated'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Log failed login with invalid credentials
        create_network_activity(
            request=request,
            user=None,
            device=device,
            activity_type="login_attempt",
            description="Failed login attempt with invalid credentials.",
            ip_address=ip_address,
            outcome="failed",
            metadata={"attempted_email": email},
            is_suspicious=True,
        )
        log_action(
            request,
            'LOGIN',
            additional_data={
                'status': 'failed', 
                'reason': 'invalid_credentials',
                'attempted_email': email
            }
        )
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class AdminOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({'message': 'Hello Admin'})


class PoliceOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPolice]

    def get(self, request):
        return Response({'message': 'Hello Police'})


class InvestigatorOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsInvestigator]

    def get(self, request):
        return Response({'message': 'Hello Investigator'})


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  

    def get_object(self):
        return self.request.user

    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {
                    'old': old_data[key],
                    'new': new_data.get(key)
                }
        return changed

    def put(self, request, *args, **kwargs):
        """Handle PUT requests for profile updates including profile picture"""
        old_data = ProfileUpdateSerializer(self.get_object()).data
        response = super().put(request, *args, **kwargs)
        
        log_action(
            request,
            'PROFILE_UPDATE',
            target_user=request.user,
            additional_data={
                'action_type': 'full_update',
                'changes': self._get_changed_fields(old_data, response.data)
            }
        )
        
        return response

    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests for partial profile updates including profile picture"""
        old_data = ProfileUpdateSerializer(self.get_object()).data
        response = super().patch(request, *args, **kwargs)
        
        log_action(
            request,
            'PROFILE_UPDATE',
            target_user=request.user,
            additional_data={
                'action_type': 'partial_update',
                'changes': self._get_changed_fields(old_data, response.data)
            }
        )
        
        return response


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        
        if not email:
            return Response(
                {"error": "Email is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            # Log password reset request
            log_action(
                request,
                'PASSWORD_RESET_REQUEST',
                target_user=user
            )
            
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            

            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_link = f"{frontend_url}/reset-password/{uid}/{token}"
            
            try:
                send_mail(
                    subject="Password Reset Request",
                    message=f"Hello {user.first_name or user.username},\n\n"
                           f"You requested a password reset. Click the link below to reset your password:\n"
                           f"{reset_link}\n\n"
                           f"This link will expire in 24 hours.\n\n"
                           f"If you didn't request this, please ignore this email.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {email}")
                
            except Exception as e:
                logger.error(f"Failed to send password reset email to {email}: {str(e)}")
                
                # Log email failure
                log_action(
                    request,
                    'EMAIL_SEND_FAILURE',
                    target_user=user,
                    additional_data={
                        'email_type': 'password_reset',
                        'error': str(e)
                    }
                )
                
                return Response(
                    {"error": "Failed to send email. Please try again later."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(
                {"message": "If an account with this email exists, a password reset link has been sent."}, 
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Log failed password reset attempt
            logger.warning(f"Password reset attempted for non-existent email: {email}")
            log_action(
                request,
                'PASSWORD_RESET_REQUEST',
                additional_data={
                    'status': 'failed',
                    'reason': 'user_not_found',
                    'attempted_email': email
                }
            )
            return Response(
                {"message": "If an account with this email exists, a password reset link has been sent."}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Unexpected error in password reset for {email}: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        
        if not all([uid, token, new_password]):
            return Response(
                {"error": "UID, token, and new password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if confirm_password and new_password != confirm_password:
            return Response(
                {"error": "Passwords do not match."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode the user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify the token
            if default_token_generator.check_token(user, token):
                # Set new password
                user.set_password(new_password)
                user.save()
                
                # Log successful password reset
                log_action(
                    request,
                    'PASSWORD_RESET_COMPLETE',
                    target_user=user
                )
                
                logger.info(f"Password successfully reset for user {user.email}")
                return Response(
                    {"message": "Password has been reset successfully."}, 
                    status=status.HTTP_200_OK
                )
            else:
                # Log failed password reset due to invalid token
                log_action(
                    request,
                    'PASSWORD_RESET_COMPLETE',
                    target_user=user,
                    additional_data={'status': 'failed', 'reason': 'invalid_token'}
                )
                return Response(
                    {"error": "Invalid or expired reset link."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            # Log failed password reset due to invalid link
            log_action(
                request,
                'PASSWORD_RESET_COMPLETE',
                additional_data={'status': 'failed', 'reason': 'invalid_reset_link'}
            )
            return Response(
                {"error": "Invalid reset link."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in password reset: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserListView(generics.ListAPIView):
    """Admin view to list all users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrInvestigatorOrPolice]

    def get_queryset(self):
        queryset = super().get_queryset().order_by("username", "id")
        role = self.request.query_params.get("role")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if role:
            queryset = queryset.filter(role__iexact=role)
        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(employee_id__icontains=search)
            )
        return queryset

    def get(self, request, *args, **kwargs):
        # Log user list access
        log_action(
            request,
            'USER_LIST_ACCESS',
            additional_data={'accessed_by_role': request.user.role}
        )
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to get, update, or delete a specific user"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrInvestigator]

    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {
                    'old': old_data[key],
                    'new': new_data.get(key)
                }
        return changed

    def _validate_user_admin_action(self, request, instance):
        if instance == request.user:
            return Response(
                {"error": "Cannot perform this action on your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if instance.role == 'Admin' and instance.status == 'Active':
            active_admin_count = User.objects.filter(role='Admin', status='Active').count()
            if active_admin_count <= 1:
                return Response(
                    {"error": "Cannot perform this action on the last active admin account."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Log user detail access
        log_action(
            request,
            'USER_DETAIL_ACCESS',
            target_user=instance,
            additional_data={'accessed_by': request.user.email}
        )
        
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Handle user updates with proper logging"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Log the update attempt
        logger.info(f"Admin {request.user.email} attempting to update user {instance.email}")
        
        validation_error = self._validate_user_admin_action(request, instance)
        if validation_error:
            if instance == request.user:
                return Response(
                    {"error": "Cannot update your own account through this endpoint. Use profile update instead."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return validation_error
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Store original data for logging
        original_data = UserSerializer(instance).data
        
        self.perform_update(serializer)
        
        # Log what was changed
        updated_user = serializer.instance
        changes = self._get_changed_fields(original_data, serializer.data)
        
        log_action(
            request,
            'USER_UPDATE',
            target_user=updated_user,
            additional_data={
                'old_data': original_data,
                'new_data': serializer.data,
                'changed_fields': changes,
                'update_type': 'partial' if partial else 'full'
            }
        )
        
        if changes:
            change_summary = ', '.join([f"{k}: {v['old']} -> {v['new']}" for k, v in changes.items()])
            logger.info(f"User {updated_user.email} updated by admin {request.user.email}. Changes: {change_summary}")
        
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Handle user deletion with proper logging and safeguards"""
        instance = self.get_object()

        validation_error = self._validate_user_admin_action(request, instance)
        if validation_error:
            if instance == request.user:
                return Response(
                    {"error": "Cannot delete your own account."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return validation_error
        
        # Log the deletion attempt
        logger.warning(f"Admin {request.user.email} is deleting user {instance.email} (ID: {instance.id})")
        
        # Store user info before deletion for logging
        user_data = UserSerializer(instance).data
        
        # Log the deletion
        log_action(
            request,
            'USER_DELETE',
            target_user=instance,
            additional_data={'user_data': user_data}
        )
        
        self.perform_destroy(instance)
        
        logger.warning(f"User {user_data['email']} (ID: {user_data['id']}) successfully deleted by admin {request.user.email}")
        
        return Response(
            {
                "message": f"User {user_data['email']} has been successfully deleted.",
                "deleted_user_id": user_data["id"],
                "deleted_user_email": user_data["email"],
            },
            status=status.HTTP_200_OK
        )


class AdminUserUpdateView(generics.UpdateAPIView):
    """Dedicated view for admin user updates"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {
                    'old': old_data[key],
                    'new': new_data.get(key)
                }
        return changed
    
    def update(self, request, *args, **kwargs):
        """Handle user updates with validation and logging"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
       
        if instance == request.user:
            return Response(
                {"error": "Cannot update your own account through admin endpoints. Use profile update instead."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Admin {request.user.email} updating user {instance.email}")
        
        # Capture old data for logging
        old_data = UserSerializer(instance).data
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)
        
        # Log the update
        changes = self._get_changed_fields(old_data, serializer.data)
        log_action(
            request,
            'USER_UPDATE',
            target_user=instance,
            additional_data={
                'old_data': old_data,
                'new_data': serializer.data,
                'changed_fields': changes,
                'update_type': 'partial' if partial else 'full'
            }
        )
        
        logger.info(f"User {instance.email} successfully updated by admin {request.user.email}")
        
        return Response({
            "message": "User updated successfully.",
            "user": serializer.data
        })


class AdminUserDeleteView(generics.DestroyAPIView):
    """Dedicated view for admin user deletion"""
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def destroy(self, request, *args, **kwargs):
        """Handle user deletion with proper safeguards"""
        instance = self.get_object()
        
        if instance == request.user:
            return Response(
                {"error": "Cannot delete your own account."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if instance.role == 'Admin' and instance.status == 'Active':
            admin_count = User.objects.filter(role='Admin', status='Active').count()
            if admin_count <= 1:
                return Response(
                    {"error": "Cannot delete the last active admin account."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        logger.warning(f"Admin {request.user.email} is deleting user {instance.email} (ID: {instance.id})")
        
        # Store user data for logging
        user_data = UserSerializer(instance).data
        
        # Log the deletion
        log_action(
            request,
            'USER_DELETE',
            target_user=instance,
            additional_data={'user_data': user_data}
        )
        
        deleted_user_email = instance.email
        self.perform_destroy(instance)
        
        logger.warning(f"User {deleted_user_email} successfully deleted by admin {request.user.email}")
        
        return Response(
            {
                "message": f"User {deleted_user_email} has been successfully deleted.",
                "deleted_user_id": user_data["id"],
                "deleted_user_email": deleted_user_email,
            },
            status=status.HTTP_200_OK
        )


class UserActivateDeactivateView(APIView):
    """Admin view to activate/deactivate users"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def patch(self, request, pk):
        """Toggle user active status"""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        logger.info(f"Before toggle - User {user.email} status: {user.status}, is_active: {user.is_active}")
        
        if user == request.user:
            return Response(
                {"error": "Cannot deactivate your own account."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.role == 'Admin' and user.status == 'Active':
            active_admin_count = User.objects.filter(role='Admin', status='Active').count()
            if active_admin_count <= 1:
                return Response(
                    {"error": "Cannot deactivate the last active admin account."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Store original status for logging
        original_status = user.status
        original_is_active = user.is_active
        
        if user.status == 'Active':
            user.deactivate()
            action = "deactivated"
            audit_action = 'USER_DEACTIVATE'
        else:
            user.activate()
            action = "activated"
            audit_action = 'USER_ACTIVATE'
        
        user.refresh_from_db()
        
        # Log the activation/deactivation
        log_action(
            request,
            audit_action,
            target_user=user,
            additional_data={
                'previous_status': original_status,
                'new_status': user.status,
                'previous_is_active': original_is_active,
                'new_is_active': user.is_active
            }
        )
        
        logger.info(f"User {user.email} {action} by admin {request.user.email}")
        logger.info(f"After toggle - User {user.email} status: {user.status}, is_active: {user.is_active}")
        
        return Response({
            "message": f"User {user.email} has been {action}.",
            "user": UserSerializer(user, context={"request": request}).data,
            "previous_status": original_status,
            "new_status": user.status
        })


class CurrentUserView(APIView):
    """Get current authenticated user details"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)


class NetworkAccessContextView(APIView):
    """Return the current authenticated user's device trust and network access state."""
    permission_classes = [permissions.IsAuthenticated]

    def _resolve_current_device(self, request):
        device = getattr(request, "current_device", None)
        if device is not None:
            return device

        device_id = request.headers.get("X-Device-Id")
        mac_address = request.headers.get("X-Device-Mac")
        if device_id:
            return Device.objects.filter(pk=device_id).first()
        if mac_address:
            return Device.objects.filter(mac_address=mac_address).first()
        return None

    def _get_request_mac(self, request):
        return request.headers.get("X-Device-Mac") or ""

    def get(self, request):
        device = self._resolve_current_device(request)
        request_mac = self._get_request_mac(request)
        in_controlled_network = is_controlled_request(request)
        blocked_by_mac = bool(
            in_controlled_network and request_mac and BlockedEntity.objects.filter(mac_address=request_mac, is_active=True).exists()
        )
        if device is None:
            if blocked_by_mac:
                return Response(
                    {
                        "access_status": "blocked",
                        "device_state": "blocked",
                        "blocked": True,
                        "current_device": None,
                        "message": "Network access is blocked on the current Wi-Fi for this MAC address.",
                        "user": UserSerializer(request.user, context={"request": request}).data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {
                    "access_status": "granted",
                    "device_state": "untracked",
                    "blocked": False,
                    "current_device": None,
                    "message": "Network access is active. No device is linked to this session yet.",
                    "user": UserSerializer(request.user, context={"request": request}).data,
                },
                status=status.HTTP_200_OK,
            )

        blocked = in_controlled_network and (
            device.status == "blocked" or BlockedEntity.objects.filter(device=device, is_active=True).exists() or blocked_by_mac
        )
        attention = not device.is_registered or device.status in {"unknown", "suspicious"}
        access_status = "blocked" if blocked else "granted_with_attention" if attention else "granted"
        device_state = "blocked" if blocked else "unregistered" if not device.is_registered else "known"

        return Response(
            {
                "access_status": access_status,
                "device_state": device_state,
                "blocked": blocked,
                "current_device": DeviceSerializer(device, context={"request": request}).data,
                "message": (
                    "Network access is blocked for this device."
                    if blocked
                    else "Network access is active, but this device is still being monitored."
                    if attention
                    else "Network access is active and trusted."
                ),
                "user": UserSerializer(request.user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
