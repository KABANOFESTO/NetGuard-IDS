"use client";

import { useEffect, useState } from "react";
import { Network, RefreshCcw, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useBlockDeviceMutation, useGetDevicesQuery } from "@/lib/redux/slices/DeviceSlice";
import {
  useCreateNetworkEdgeProfileMutation,
  useDeleteNetworkEdgeProfileMutation,
  useExecuteNetworkEdgeActionMutation,
  useGetNetworkEdgeActionLogsQuery,
  useGetNetworkEdgeHealthQuery,
  useGetNetworkEdgeProfilesQuery,
  useGetSecurityBlocksQuery,
  useUnblockSecurityBlockMutation,
  useUpdateNetworkEdgeProfileMutation,
} from "@/lib/redux/slices/SecuritySlice";
import type { NetworkEdgeActionRequest, NetworkEdgeProfile } from "@/lib/redux/types/netguard";
import { formatDateTime, statusTone } from "@/lib/portal/formatters";
import { getApiErrorMessage } from "@/lib/utils/apiError";

type NetworkEdgeProfileForm = {
  name: string;
  provider_type: NetworkEdgeProfile["provider_type"];
  base_url: string;
  api_token: string;
  shared_secret: string;
  authorize_path: string;
  revoke_path: string;
  ban_path: string;
  unban_path: string;
  disconnect_path: string;
  health_path: string;
  timeout_seconds: number;
  enabled: boolean;
  is_default: boolean;
  notes: string;
};

const emptyProfileForm: NetworkEdgeProfileForm = {
  name: "",
  provider_type: "radius_captive_portal",
  base_url: "",
  api_token: "",
  shared_secret: "",
  authorize_path: "/authorize",
  revoke_path: "/revoke",
  ban_path: "/ban",
  unban_path: "/unban",
  disconnect_path: "/disconnect",
  health_path: "/health",
  timeout_seconds: 10,
  enabled: true,
  is_default: false,
  notes: "",
};

const actionLabels: Record<NetworkEdgeActionRequest["action"], string> = {
  ban_mac: "Block device",
  unban_mac: "Restore access",
  authorize: "Authorize access",
  revoke: "Revoke access",
  terminate_sessions: "Disconnect sessions",
  health_check: "Health check",
};

export default function AdminNetworkControlPage() {
  const { data: profiles = [], refetch: refetchProfiles, isLoading: profilesLoading } = useGetNetworkEdgeProfilesQuery();
  const [scope, setScope] = useState<"all" | "current_network">("all");
  const { data: devices = [], isLoading: devicesLoading } = useGetDevicesQuery(
    scope === "current_network" ? { same_network: true } : undefined
  );
  const { data: activeBlocks = [] } = useGetSecurityBlocksQuery(true);
  const { data: health, refetch: refetchHealth } = useGetNetworkEdgeHealthQuery();
  const { data: logs = [], refetch: refetchLogs, isFetching: logsFetching } = useGetNetworkEdgeActionLogsQuery(undefined);
  const [blockDevice] = useBlockDeviceMutation();
  const [unblockSecurityBlock] = useUnblockSecurityBlockMutation();
  const [createProfile] = useCreateNetworkEdgeProfileMutation();
  const [updateProfile] = useUpdateNetworkEdgeProfileMutation();
  const [deleteProfile] = useDeleteNetworkEdgeProfileMutation();
  const [executeAction, { isLoading: executing }] = useExecuteNetworkEdgeActionMutation();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [actionForm, setActionForm] = useState({
    action: "ban_mac" as NetworkEdgeActionRequest["action"],
    reason: "manual_block",
    notes: "",
    disconnect_all_sessions: true,
  });

  useEffect(() => {
    if (!profiles.length) return;
    const selectedProfile =
      profiles.find((profile) => profile.id === selectedProfileId) ?? profiles.find((profile) => profile.is_default) ?? profiles[0];
    if (!selectedProfile) return;

    setSelectedProfileId(selectedProfile.id);
    setProfileForm({
      name: selectedProfile.name,
      provider_type: selectedProfile.provider_type,
      base_url: selectedProfile.base_url,
      api_token: "",
      shared_secret: "",
      authorize_path: selectedProfile.authorize_path,
      revoke_path: selectedProfile.revoke_path,
      ban_path: selectedProfile.ban_path,
      unban_path: selectedProfile.unban_path,
      disconnect_path: selectedProfile.disconnect_path,
      health_path: selectedProfile.health_path,
      timeout_seconds: selectedProfile.timeout_seconds,
      enabled: selectedProfile.enabled,
      is_default: selectedProfile.is_default,
      notes: selectedProfile.notes,
    });
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (!devices.length) {
      setSelectedDeviceId(null);
      return;
    }

    if (!selectedDeviceId || !devices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  const selectedDevice = devices.find((device) => device.id === selectedDeviceId) ?? null;
  const hasNetworkEdgeProfile = Boolean(health?.enabled && health.profile);
  const activeBlockForSelectedDevice = selectedDevice
    ? activeBlocks.find((block) => block.device === selectedDevice.id && block.is_active)
    : null;
  const selectedDeviceRisk = selectedDevice
    ? activeBlockForSelectedDevice
      ? { label: "Blocked", tone: "rose" as const }
      : selectedDevice.status === "suspicious" || !selectedDevice.is_registered
        ? { label: "Watch", tone: "amber" as const }
        : { label: "Trusted", tone: "emerald" as const }
    : null;

  const refreshAll = async () => {
    await Promise.all([refetchProfiles(), refetchHealth(), refetchLogs()]);
  };

  const handleSaveProfile = async () => {
    try {
      const payload: Partial<NetworkEdgeProfile> = {
        ...profileForm,
        timeout_seconds: Number(profileForm.timeout_seconds),
      };

      if (selectedProfileId) {
        if (!payload.api_token?.trim()) delete payload.api_token;
        if (!payload.shared_secret?.trim()) delete payload.shared_secret;
        await updateProfile({ id: selectedProfileId, data: payload }).unwrap();
        toast.success("Controller profile updated.");
      } else {
        const created = await createProfile(payload).unwrap();
        setSelectedProfileId(created.id);
        toast.success("Controller profile created.");
      }
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save controller profile."));
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;
    const confirmed = window.confirm("Delete this controller profile? The external router or AP configuration will remain unchanged.");
    if (!confirmed) return;

    try {
      await deleteProfile(selectedProfileId).unwrap();
      toast.success("Controller profile deleted.");
      setSelectedProfileId(null);
      setProfileForm(emptyProfileForm);
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete controller profile."));
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedDevice && actionForm.action !== "health_check") {
      toast.error("Please choose a device from the current network first.");
      return;
    }

    try {
      if (!hasNetworkEdgeProfile && actionForm.action !== "health_check") {
        if (!selectedDevice) {
          toast.error("Please choose a device from the current network first.");
          return;
        }

        if (actionForm.action === "ban_mac" || actionForm.action === "terminate_sessions" || actionForm.action === "revoke") {
          await blockDevice({
            id: selectedDevice.id,
            reason: actionForm.reason as "intrusion" | "suspicious_activity" | "manual_block",
          }).unwrap();
          toast.success("Device controlled locally on the current network. Add a controller profile to push the action to the router or access point.");
          await refreshAll();
          return;
        }

        if ((actionForm.action === "unban_mac" || actionForm.action === "authorize") && activeBlockForSelectedDevice) {
          await unblockSecurityBlock(activeBlockForSelectedDevice.id).unwrap();
          toast.success("Access restored locally for the current network.");
          await refreshAll();
          return;
        }

        toast.error("No active local block was found for this device.");
        return;
      }

      await executeAction({
        profile_id: selectedProfileId ?? undefined,
        action: actionForm.action,
        device_id: selectedDevice?.id,
        mac_address: selectedDevice?.mac_address,
        ip_address: selectedDevice?.ip_address,
        reason: actionForm.reason,
        notes: actionForm.notes,
        disconnect_all_sessions: actionForm.disconnect_all_sessions,
      }).unwrap();
      toast.success("Network action sent.");
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to execute network action."));
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Network Control"
        title="Choose a device from the live network and control its access."
        description="This screen is designed for admins to work with real users and devices, not raw MAC entry. Pick a device that NetGuard can already see on the current network, then block, restore, or disconnect it."
        actions={
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      <div className="rounded-3xl border border-violet-200 bg-violet-50/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-violet-700 shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Control workflow</p>
              <p className="mt-1 text-sm text-slate-600">
                1. Pick a device from the live network list. 2. Choose an action. 3. Submit to block, restore, or disconnect access.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                scope === "all" ? "bg-violet-600 text-white" : "border border-violet-200 bg-white text-slate-700"
              }`}
            >
              All devices
            </button>
            <button
              type="button"
              onClick={() => setScope("current_network")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                scope === "current_network" ? "bg-violet-600 text-white" : "border border-violet-200 bg-white text-slate-700"
              }`}
            >
              Current network only
            </button>
            <Badge tone="violet">{devices.length} devices</Badge>
            <Badge tone={health?.success ? "emerald" : "amber"}>{health?.message ?? "Health not checked yet"}</Badge>
            <Badge tone={hasNetworkEdgeProfile ? "emerald" : "rose"}>
              {hasNetworkEdgeProfile ? "Edge profile ready" : "Local control active"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Network} label="Profiles" value={String(profiles.length)} detail="Configured controller integrations." tone="sky" />
        <StatCard icon={ShieldCheck} label="Default profile" value={health?.profile?.name ?? "None"} detail={health?.enabled ? "Controller available." : "No controller connected."} tone="emerald" />
        <StatCard icon={ShieldAlert} label="Last action" value={logs[0]?.action ?? "None"} detail={logs[0]?.message ?? "No action yet."} tone="amber" />
        <StatCard icon={Radio} label="Controller health" value={health?.success ? "Online" : health?.enabled ? "Needs attention" : "Disabled"} detail={health?.status_code ? `Status ${health.status_code}` : "Not checked yet."} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel
          title={scope === "current_network" ? "Live network devices" : "Device inventory"}
          description={
            scope === "current_network"
              ? "Select a device detected on the current network."
              : "Select a device from the full inventory, with the option to switch to the current network view."
          }
        >
          {devicesLoading ? (
            <EmptyState title="Loading devices" description="Fetching devices on the active network." />
          ) : devices.length ? (
            <div className="space-y-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedDeviceId === device.id ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{device.device_name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {device.owner_name || device.owner_email || "Unassigned"} • {device.device_type}
                        {device.operating_system ? ` • ${device.operating_system}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        IP {device.ip_address} • MAC {device.mac_address}
                      </p>
                    </div>
                    <Badge tone={statusTone(device.status)}>{device.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title={scope === "current_network" ? "No network devices" : "No devices available"}
              description={
                scope === "current_network"
                  ? "No devices are currently visible on the active control network. Switch to All devices for the full inventory."
                  : "NetGuard did not find any devices to display yet."
              }
            />
          )}
        </Panel>

        <Panel title="Action console" description="Apply a network decision to the selected device.">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-lg">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-300">Selected device</p>
              {selectedDevice ? (
                <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">{selectedDevice.device_name}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      {selectedDevice.owner_name || selectedDevice.owner_email || "Unassigned"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedDeviceRisk ? <Badge tone={selectedDeviceRisk.tone}>{selectedDeviceRisk.label}</Badge> : null}
                      {activeBlockForSelectedDevice?.network_scope ? (
                        <Badge tone="slate">{activeBlockForSelectedDevice.network_scope}</Badge>
                      ) : null}
                      <Badge tone={statusTone(selectedDevice.status)}>{selectedDevice.status}</Badge>
                      <Badge tone={selectedDevice.is_registered ? "emerald" : "amber"}>
                        {selectedDevice.is_registered ? "Registered" : "Unregistered"}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Last seen</p>
                    <p className="mt-2 text-sm font-medium text-white">{formatDateTime(selectedDevice.last_seen)}</p>
                    <p className="mt-4 text-xs uppercase tracking-wide text-slate-300">Identity</p>
                    <p className="mt-2 text-sm text-slate-200">{selectedDevice.ip_address}</p>
                    <p className="text-sm text-slate-200">{selectedDevice.mac_address}</p>
                  </div>
                  <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-300">Why it is visible</p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      This device is currently visible on the active control network, so you can review it, monitor it, and apply a network action without entering manual identifiers.
                      {hasNetworkEdgeProfile
                        ? " Edge enforcement is ready for the router or access point."
                        : " Edge enforcement is not configured yet, so control actions stay local to this network and stop applying when the device moves to another network."}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">Choose a device from the left to continue.</p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2"
                value={selectedProfileId ?? ""}
                onChange={(e) => setSelectedProfileId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Use default profile</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                value={actionForm.action}
                onChange={(e) =>
                  setActionForm((current) => ({
                    ...current,
                    action: e.target.value as NetworkEdgeActionRequest["action"],
                  }))
                }
              >
                <option value="ban_mac">Block device</option>
                <option value="unban_mac">Restore access</option>
                <option value="authorize">Authorize access</option>
                <option value="revoke">Revoke access</option>
                <option value="terminate_sessions">Disconnect sessions</option>
                <option value="health_check">Health check</option>
              </select>

              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                value={actionForm.reason}
                onChange={(e) => setActionForm((current) => ({ ...current, reason: e.target.value }))}
              >
                <option value="manual_block">Manual block</option>
                <option value="intrusion">Intrusion</option>
                <option value="suspicious_activity">Suspicious activity</option>
              </select>

              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2"
                placeholder="Notes for the action"
                value={actionForm.notes}
                onChange={(e) => setActionForm((current) => ({ ...current, notes: e.target.value }))}
              />

              <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={actionForm.disconnect_all_sessions}
                  onChange={(e) => setActionForm((current) => ({ ...current, disconnect_all_sessions: e.target.checked }))}
                />
                Disconnect all active sessions when supported
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={executing || (!selectedDevice && actionForm.action !== "health_check")}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {executing
                  ? "Sending..."
                  : !hasNetworkEdgeProfile && actionForm.action === "ban_mac"
                    ? "Apply local control"
                    : actionLabels[actionForm.action]}
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Controller profiles" description="Advanced integration settings for RADIUS, firewall, or access point controllers.">
          {profilesLoading ? (
            <EmptyState title="Loading profiles" description="Fetching controller integrations." />
          ) : profiles.length ? (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedProfileId === profile.id ? "border-slate-400 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{profile.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{profile.provider_type.replaceAll("_", " ")}</p>
                      <p className="mt-1 text-xs text-slate-500">{profile.base_url || "No base URL configured"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone={profile.enabled ? "emerald" : "slate"}>{profile.enabled ? "Enabled" : "Disabled"}</Badge>
                      {profile.is_default ? <Badge tone="sky">Default</Badge> : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No profiles configured" description="Create a profile to connect NetGuard to a real controller." />
          )}
        </Panel>

        <Panel title={selectedProfileId ? "Edit profile" : "Create profile"} description="Advanced settings for the external controller.">
          <details className="rounded-2xl border border-slate-200 bg-white p-4" open>
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Basic settings</summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Profile name" value={profileForm.name} onChange={(e) => setProfileForm((c) => ({ ...c, name: e.target.value }))} />
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                value={profileForm.provider_type}
                onChange={(e) =>
                  setProfileForm((c) => ({
                    ...c,
                    provider_type: e.target.value as NetworkEdgeProfile["provider_type"],
                  }))
                }
              >
                <option value="radius_captive_portal">RADIUS / Captive Portal</option>
                <option value="firewall_router">Firewall / Router API</option>
                <option value="access_point_controller">Access Point Controller</option>
              </select>
              <input type="url" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2" placeholder="Base URL" value={profileForm.base_url} onChange={(e) => setProfileForm((c) => ({ ...c, base_url: e.target.value }))} />
              <input type="password" autoComplete="off" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" placeholder="API token" value={profileForm.api_token} onChange={(e) => setProfileForm((c) => ({ ...c, api_token: e.target.value }))} />
              <input type="password" autoComplete="off" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400" placeholder="Shared secret" value={profileForm.shared_secret} onChange={(e) => setProfileForm((c) => ({ ...c, shared_secret: e.target.value }))} />
              <p className="text-xs text-slate-500 md:col-span-2">Leave token and secret blank when editing to keep the stored values.</p>
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Authorize path" value={profileForm.authorize_path} onChange={(e) => setProfileForm((c) => ({ ...c, authorize_path: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Revoke path" value={profileForm.revoke_path} onChange={(e) => setProfileForm((c) => ({ ...c, revoke_path: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Ban path" value={profileForm.ban_path} onChange={(e) => setProfileForm((c) => ({ ...c, ban_path: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Unban path" value={profileForm.unban_path} onChange={(e) => setProfileForm((c) => ({ ...c, unban_path: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Disconnect path" value={profileForm.disconnect_path} onChange={(e) => setProfileForm((c) => ({ ...c, disconnect_path: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Health path" value={profileForm.health_path} onChange={(e) => setProfileForm((c) => ({ ...c, health_path: e.target.value }))} />
              <input type="number" min={1} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Timeout seconds" value={profileForm.timeout_seconds} onChange={(e) => setProfileForm((c) => ({ ...c, timeout_seconds: Number(e.target.value) }))} />
              <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2" placeholder="Notes" value={profileForm.notes} onChange={(e) => setProfileForm((c) => ({ ...c, notes: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={profileForm.enabled} onChange={(e) => setProfileForm((c) => ({ ...c, enabled: e.target.checked }))} />
                Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={profileForm.is_default} onChange={(e) => setProfileForm((c) => ({ ...c, is_default: e.target.checked }))} />
                Default profile
              </label>
            </div>
          </details>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleSaveProfile} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
              {selectedProfileId ? "Update profile" : "Create profile"}
            </button>
            <button
              type="button"
              onClick={handleDeleteProfile}
              disabled={!selectedProfileId}
              className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete profile
            </button>
            <button type="button" onClick={() => refetchHealth()} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
              Run health check
            </button>
          </div>
        </Panel>
      </div>

      <Panel title="Recent actions" description="Track the latest allow, block, and session requests.">
        {logsFetching ? (
          <EmptyState title="Loading logs" description="Fetching recent controller actions." />
        ) : logs.length ? (
          <div className="space-y-3">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{log.action.replaceAll("_", " ")}</p>
                    <p className="text-sm text-slate-600">{log.message}</p>
                  </div>
                  <Badge tone={log.success ? "emerald" : "rose"}>{log.success ? "Success" : "Failed"}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {log.device_name || log.user_email || log.mac_address || "Network edge"} • {formatDateTime(log.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No edge actions yet" description="Execute an action or run a health check to populate the log." />
        )}
      </Panel>
    </div>
  );
}
