from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

import requests
from django.conf import settings


class NetworkEdgeError(RuntimeError):
    pass


@dataclass
class NetworkEdgeResult:
    success: bool
    status_code: str
    message: str
    payload: dict[str, Any]


def _build_headers(profile):
    headers = {"Content-Type": "application/json"}
    if profile.api_token:
        headers["Authorization"] = f"Bearer {profile.api_token}"
    if profile.shared_secret:
        headers["X-Shared-Secret"] = profile.shared_secret
    return headers


class BaseNetworkEdgeClient:
    def __init__(self, profile):
        self.profile = profile
        self.timeout = profile.timeout_seconds or getattr(settings, "NETWORK_EDGE_TIMEOUT_SECONDS", 10)

    def _request(self, method: str, path: str, payload: Optional[dict[str, Any]] = None):
        if not self.profile.base_url:
            raise NetworkEdgeError("The selected network-edge profile does not have a base_url configured.")

        url = f"{self.profile.base_url.rstrip('/')}/{path.lstrip('/')}"
        response = requests.request(
            method=method,
            url=url,
            json=payload or {},
            headers=_build_headers(self.profile),
            timeout=self.timeout,
        )
        try:
            data = response.json()
        except Exception:
            data = {"raw": response.text}

        if response.status_code >= 400:
            raise NetworkEdgeError(
                f"Provider request failed with HTTP {response.status_code}: {data}"
            )

        return response.status_code, data

    def health_check(self):
        return self._request("GET", self.profile.health_path)

    def authorize_session(self, payload):
        return self._request("POST", self.profile.authorize_path, payload)

    def revoke_session(self, payload):
        return self._request("POST", self.profile.revoke_path, payload)

    def ban_mac(self, payload):
        return self._request("POST", self.profile.ban_path, payload)

    def unban_mac(self, payload):
        return self._request("POST", self.profile.unban_path, payload)

    def disconnect_sessions(self, payload):
        return self._request("POST", self.profile.disconnect_path, payload)


def get_edge_client(profile):
    if profile.provider_type == "radius_captive_portal":
        return BaseNetworkEdgeClient(profile)
    if profile.provider_type == "firewall_router":
        return BaseNetworkEdgeClient(profile)
    if profile.provider_type == "access_point_controller":
        return BaseNetworkEdgeClient(profile)
    raise NetworkEdgeError(f"Unsupported provider type: {profile.provider_type}")

