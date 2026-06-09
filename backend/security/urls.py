from django.urls import path

from .views import (
    BlockedEntityDetailView,
    BlockedEntityListCreateView,
    NetworkEdgeActionExecuteView,
    NetworkEdgeActionLogListView,
    NetworkEdgeHealthView,
    NetworkEdgeProfileDetailView,
    NetworkEdgeProfileListCreateView,
    UnblockEntityView,
)


urlpatterns = [
    path("blocks/", BlockedEntityListCreateView.as_view(), name="blocked-entity-list"),
    path("blocks/<int:pk>/", BlockedEntityDetailView.as_view(), name="blocked-entity-detail"),
    path("blocks/<int:pk>/unblock/", UnblockEntityView.as_view(), name="blocked-entity-unblock"),
    path("edge-profiles/", NetworkEdgeProfileListCreateView.as_view(), name="network-edge-profile-list"),
    path("edge-profiles/<int:pk>/", NetworkEdgeProfileDetailView.as_view(), name="network-edge-profile-detail"),
    path("edge-actions/", NetworkEdgeActionExecuteView.as_view(), name="network-edge-action"),
    path("edge-actions/logs/", NetworkEdgeActionLogListView.as_view(), name="network-edge-action-logs"),
    path("edge-health/", NetworkEdgeHealthView.as_view(), name="network-edge-health"),
]
