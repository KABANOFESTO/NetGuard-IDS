"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Network, ShieldAlert, ShieldCheck, Radio, RefreshCcw } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import {
  useCreateNetworkEdgeProfileMutation,
  useDeleteNetworkEdgeProfileMutation,
  useExecuteNetworkEdgeActionMutation,
  useGetNetworkEdgeActionLogsQuery,
  useGetNetworkEdgeHealthQuery,
  useGetNetworkEdgeProfilesQuery,
  useUpdateNetworkEdgeProfileMutation,
} from "@/lib/redux/slices/SecuritySlice";
import type { NetworkEdgeActionRequest, NetworkEdgeProfile } from "@/lib/redux/types/netguard";
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

type NetworkEdgeActionForm = {
  profile_id: string;
  action: NetworkEdgeActionRequest["action"];
  user_id: string;
  device_id: string;
  mac_address: string;
  ip_address: string;
  reason: string;
  notes: string;
  session_id: string;
  disconnect_all_sessions: boolean;
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

const emptyActionForm: NetworkEdgeActionForm = {
  profile_id: "",
  action: "ban_mac",
  user_id: "",
  device_id: "",
  mac_address: "",
  ip_address: "",
  reason: "manual_block",
  notes: "",
  session_id: "",
  disconnect_all_sessions: true,
};

export default function AdminNetworkControlPage() {
  const { data: profiles = [], refetch: refetchProfiles, isLoading: profilesLoading } = useGetNetworkEdgeProfilesQuery();
  const { data: health, refetch: refetchHealth } = useGetNetworkEdgeHealthQuery();
  const { data: logs = [], refetch: refetchLogs, isFetching: logsFetching } = useGetNetworkEdgeActionLogsQuery(undefined);
  const [createProfile] = useCreateNetworkEdgeProfileMutation();
  const [updateProfile] = useUpdateNetworkEdgeProfileMutation();
  const [deleteProfile] = useDeleteNetworkEdgeProfileMutation();
  const [executeAction, { isLoading: executing }] = useExecuteNetworkEdgeActionMutation();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [actionForm, setActionForm] = useState(emptyActionForm);

  useEffect(() => {
    if (!profiles.length) {
      return;
    }
    const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? profiles.find((profile) => profile.is_default) ?? profiles[0];
    if (!selectedProfile) {
      return;
    }
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
    setActionForm((current) => ({
      ...current,
      profile_id: String(selectedProfile.id),
    }));
  }, [profiles, selectedProfileId]);

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
        if (!payload.api_token?.trim()) {
          delete payload.api_token;
        }
        if (!payload.shared_secret?.trim()) {
          delete payload.shared_secret;
        }
      }

      if (selectedProfileId) {
        await updateProfile({ id: selectedProfileId, data: payload }).unwrap();
        toast.success("Network edge profile updated.");
      } else {
        const created = await createProfile(payload).unwrap();
        setSelectedProfileId(created.id);
        toast.success("Network edge profile created.");
      }
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save network edge profile."));
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;
    const confirmed = window.confirm("Delete this network edge profile? This will not remove external router configuration.");
    if (!confirmed) return;
    try {
      await deleteProfile(selectedProfileId).unwrap();
      toast.success("Network edge profile deleted.");
      setSelectedProfileId(null);
      setProfileForm(emptyProfileForm);
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete network edge profile."));
    }
  };

  const handleExecuteAction = async () => {
    try {
      await executeAction({
        profile_id: actionForm.profile_id ? Number(actionForm.profile_id) : undefined,
        action: actionForm.action,
        user_id: actionForm.user_id ? Number(actionForm.user_id) : undefined,
        device_id: actionForm.device_id ? Number(actionForm.device_id) : undefined,
        mac_address: actionForm.mac_address || undefined,
        ip_address: actionForm.ip_address || undefined,
        reason: actionForm.reason,
        notes: actionForm.notes,
        session_id: actionForm.session_id,
        disconnect_all_sessions: actionForm.disconnect_all_sessions,
      }).unwrap();
      toast.success("Network edge action sent.");
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to execute network edge action."));
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Network Control"
        title="Control access at the network edge, not just inside the portal."
        description="Use this console to connect NetGuard to a RADIUS/captive portal gateway, firewall/router API, or access-point controller for real device bans, session revocation, and access authorization."
        actions={
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh control plane
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Network} label="Profiles" value={String(profiles.length)} detail="Configured edge integrations." tone="sky" />
        <StatCard icon={ShieldCheck} label="Default profile" value={health?.profile?.name ?? "None"} detail={health?.message ?? "No active profile configured."} tone="emerald" />
        <StatCard icon={ShieldAlert} label="Last action" value={logs[0]?.action ?? "None"} detail={logs[0]?.message ?? "No control action executed yet."} tone="amber" />
        <StatCard icon={Radio} label="Health status" value={health?.success ? "Online" : health?.enabled ? "Needs attention" : "Disabled"} detail={health?.status_code ? `Status: ${health.status_code}` : "Health check not run yet."} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Edge profiles" description="Store the details for your captive portal, firewall/router, or AP controller.">
          {profilesLoading ? (
            <EmptyState title="Loading profiles" description="Fetching the configured network edge integrations." />
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
            <EmptyState title="No profiles configured" description="Create a profile to connect NetGuard to a real network controller." />
          )}
        </Panel>

        <Panel title={selectedProfileId ? "Edit profile" : "Create profile"} description="This is where you define the external controller endpoint and its action paths.">
          <div className="grid gap-3 md:grid-cols-2">
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
            <input
              type="url"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2"
              placeholder="Base URL"
              value={profileForm.base_url}
              onChange={(e) => setProfileForm((c) => ({ ...c, base_url: e.target.value }))}
            />
            <input
              type="password"
              autoComplete="off"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="API token"
              value={profileForm.api_token}
              onChange={(e) => setProfileForm((c) => ({ ...c, api_token: e.target.value }))}
            />
            <input
              type="password"
              autoComplete="off"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Shared secret"
              value={profileForm.shared_secret}
              onChange={(e) => setProfileForm((c) => ({ ...c, shared_secret: e.target.value }))}
            />
            <p className="text-xs text-slate-500 md:col-span-2">
              Leave the API token and shared secret blank when editing if you want to keep the currently stored credentials.
            </p>
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Edge action console" description="Send an allow/block/session command to the active controller.">
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 md:col-span-2" value={actionForm.profile_id} onChange={(e) => setActionForm((c) => ({ ...c, profile_id: e.target.value }))}>
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
                setActionForm((c) => ({
                  ...c,
                  action: e.target.value as NetworkEdgeActionRequest["action"],
                }))
              }
            >
              <option value="ban_mac">Ban MAC</option>
              <option value="unban_mac">Unban MAC</option>
              <option value="authorize">Authorize session</option>
              <option value="revoke">Revoke session</option>
              <option value="terminate_sessions">Terminate sessions</option>
              <option value="health_check">Health check</option>
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" value={actionForm.reason} onChange={(e) => setActionForm((c) => ({ ...c, reason: e.target.value }))}>
              <option value="manual_block">Manual block</option>
              <option value="intrusion">Intrusion</option>
              <option value="suspicious_activity">Suspicious activity</option>
            </select>
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="User ID" value={actionForm.user_id} onChange={(e) => setActionForm((c) => ({ ...c, user_id: e.target.value }))} />
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Device ID" value={actionForm.device_id} onChange={(e) => setActionForm((c) => ({ ...c, device_id: e.target.value }))} />
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="MAC address" value={actionForm.mac_address} onChange={(e) => setActionForm((c) => ({ ...c, mac_address: e.target.value }))} />
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="IP address" value={actionForm.ip_address} onChange={(e) => setActionForm((c) => ({ ...c, ip_address: e.target.value }))} />
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Session ID" value={actionForm.session_id} onChange={(e) => setActionForm((c) => ({ ...c, session_id: e.target.value }))} />
            <input className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Notes / reason" value={actionForm.notes} onChange={(e) => setActionForm((c) => ({ ...c, notes: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={actionForm.disconnect_all_sessions} onChange={(e) => setActionForm((c) => ({ ...c, disconnect_all_sessions: e.target.checked }))} />
              Disconnect all active sessions when supported
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExecuteAction}
              disabled={executing}
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {executing ? "Sending..." : "Execute action"}
            </button>
          </div>
        </Panel>

        <Panel title="Action log" description="Track every allow, ban, or session termination request.">
          {logsFetching ? (
            <EmptyState title="Loading logs" description="Fetching recent controller actions." />
          ) : logs.length ? (
            <DataTable
              columns={[
                { key: "action", label: "Action" },
                { key: "target", label: "Target" },
                { key: "status", label: "Status" },
                { key: "time", label: "Time" },
              ]}
              rows={logs.slice(0, 8).map((log) => ({
                action: log.action,
                target: log.device_name || log.user_email || log.mac_address || "Network edge",
                status: <Badge tone={log.success ? "emerald" : "rose"}>{log.success ? "Success" : "Failed"}</Badge>,
                time: log.created_at,
              }))}
            />
          ) : (
            <EmptyState title="No edge actions yet" description="Execute an action or run a health check to populate the log." />
          )}
        </Panel>
      </div>
    </div>
  );
}
