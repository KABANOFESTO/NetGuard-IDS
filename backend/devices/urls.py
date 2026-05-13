from django.urls import path

from .views import (
    DeviceBlockView,
    DeviceDetailView,
    DeviceListCreateView,
    DeviceStatusUpdateView,
    DeviceSummaryView,
)


urlpatterns = [
    path("", DeviceListCreateView.as_view(), name="device-list"),
    path("summary/", DeviceSummaryView.as_view(), name="device-summary"),
    path("<int:pk>/", DeviceDetailView.as_view(), name="device-detail"),
    path("<int:pk>/status/", DeviceStatusUpdateView.as_view(), name="device-status"),
    path("<int:pk>/block/", DeviceBlockView.as_view(), name="device-block"),
]
