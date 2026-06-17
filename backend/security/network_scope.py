from __future__ import annotations

import ipaddress

from django.conf import settings


def get_client_ip(request) -> str:
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or request.data.get("ip_address") or "127.0.0.1"


def get_control_networks():
    configured = getattr(settings, "NETWORK_CONTROL_CIDRS", [])
    networks = []
    for entry in configured:
        value = str(entry).strip()
        if not value:
            continue
        try:
            networks.append(ipaddress.ip_network(value, strict=False))
        except ValueError:
            continue
    return networks


def is_controlled_ip(ip_address: str | None) -> bool:
    if not ip_address:
        return False
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return False
    return any(ip_obj in network for network in get_control_networks())


def is_controlled_request(request) -> bool:
    return is_controlled_ip(get_client_ip(request))


def get_reference_network(ip_address: str | None):
    if not ip_address:
        return None
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return None
    prefix = 24 if ip_obj.version == 4 else 64
    network = ipaddress.ip_network(f"{ip_obj}/{prefix}", strict=False)
    return network


def get_request_network_scope(request) -> str:
    explicit_scope = request.headers.get("X-Network-Scope", "").strip()
    if explicit_scope:
        return explicit_scope

    network = get_reference_network(get_client_ip(request))
    return str(network) if network is not None else ""


def is_same_network(ip_address: str | None, reference_ip: str | None) -> bool:
    network = get_reference_network(reference_ip)
    if network is None or not ip_address:
        return False
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        return False
    return ip_obj in network
