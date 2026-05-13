from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'is_active')

    def validate_role(self, value):
        if value == "Admin":
            raise serializers.ValidationError(
                "Admin accounts cannot be created through public signup. Ask an existing administrator to create the account."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            is_active=validated_data.get('is_active', True),  
        )
        return user

class AdminUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'is_active') 
        
    def create(self, validated_data):
        # Generate a random password
        password = User.generate_random_password()
        
        # Create the user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            role=validated_data['role'],
            is_active=validated_data.get('is_active', True),
        )
        
       
        user.temporary_password = password
        return user


class InitialAdminBootstrapSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate_role(self, value):
        if value != "Admin":
            raise serializers.ValidationError("Initial bootstrap can only create an Admin account.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='Admin',
            is_active=True,
        )

class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'role',
            'status',
            'profile_picture',
            'profile_picture_url',
            'employee_id',
            'telephone',
            'location',
            'bachelor_degree',
            'is_active',
        )

    def get_profile_picture_url(self, obj):
        request = self.context.get("request")
        url = obj.get_profile_picture_url()
        if request and url:
            return request.build_absolute_uri(url)
        return url

class ProfileUpdateSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    current_password = serializers.CharField(write_only=True, required=False)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'username',
            'current_password',
            'new_password',
            'profile_picture',
            'telephone',
            'location',
            'is_active',
        ]

    def validate(self, data):
        user = self.context['request'].user

        if 'new_password' in data:
            if not user.check_password(data.get('current_password')):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        return data

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data['username']

        if 'new_password' in validated_data:
            instance.set_password(validated_data['new_password'])

        if 'profile_picture' in validated_data:
            if instance.profile_picture:
                instance.profile_picture.delete(save=False)
            instance.profile_picture = validated_data['profile_picture']

        if 'telephone' in validated_data:
            instance.telephone = validated_data['telephone']

        if 'location' in validated_data:
            instance.location = validated_data['location']

        if 'is_active' in validated_data: 
            instance.is_active = validated_data['is_active']

        instance.save()
        return instance
