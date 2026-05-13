from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsGuest(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Guest"


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Student"


class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Lecturer"


class IsAdminOrStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_student = IsStudent().has_permission(request, view)
        return is_admin or is_student


class IsAdminOrStudentOrGuest(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_student = IsStudent().has_permission(request, view)
        is_guest = IsGuest().has_permission(request, view)
        return is_admin or is_student or is_guest


class IsAdminOrLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_lecturer = IsLecturer().has_permission(request, view)
        return is_admin or is_lecturer


class IsPolice(permissions.BasePermission):
    def has_permission(self, request, view):
        return False


class IsInvestigator(permissions.BasePermission):
    def has_permission(self, request, view):
        return False


class IsAdminOrInvestigator(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_investigator = IsInvestigator().has_permission(request, view)
        return is_admin or is_investigator


class IsAdminOrInvestigatorOrPolice(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_investigator = IsInvestigator().has_permission(request, view)
        is_police = IsPolice().has_permission(request, view)
        return is_admin or is_investigator or is_police
