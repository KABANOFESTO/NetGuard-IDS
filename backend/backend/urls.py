from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authapi.urls')),
    path('api/', include('AuditLog.urls')),
    path('api/devices/', include('devices.urls')),
    path('api/monitoring/', include('monitoring.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/security/', include('security.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
