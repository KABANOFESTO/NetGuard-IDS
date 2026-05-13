from django.urls import path

from .views import BlockedEntityDetailView, BlockedEntityListCreateView, UnblockEntityView


urlpatterns = [
    path("blocks/", BlockedEntityListCreateView.as_view(), name="blocked-entity-list"),
    path("blocks/<int:pk>/", BlockedEntityDetailView.as_view(), name="blocked-entity-detail"),
    path("blocks/<int:pk>/unblock/", UnblockEntityView.as_view(), name="blocked-entity-unblock"),
]
