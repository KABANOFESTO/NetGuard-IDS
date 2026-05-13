from django.urls import path

from .views import MonitoringDashboardView, MonitoringReportView, NetworkActivityListCreateView


urlpatterns = [
    path("activities/", NetworkActivityListCreateView.as_view(), name="network-activity-list"),
    path("dashboard/", MonitoringDashboardView.as_view(), name="monitoring-dashboard"),
    path("reports/", MonitoringReportView.as_view(), name="monitoring-report"),
]
