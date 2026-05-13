from django.urls import path

from .views import (
    IntrusionAlertDetailView,
    IntrusionAlertListCreateView,
    IntrusionAlertSummaryView,
)


urlpatterns = [
    path("", IntrusionAlertListCreateView.as_view(), name="intrusion-alert-list"),
    path("summary/", IntrusionAlertSummaryView.as_view(), name="intrusion-alert-summary"),
    path("<int:pk>/", IntrusionAlertDetailView.as_view(), name="intrusion-alert-detail"),
]
