"use client";

import {
  AlertTriangle,
  BellRing,
  Network,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import {
  ActionButton,
  Badge,
  DataTable,
  EmptyState,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";
import { useGetAlertSummaryQuery, useGetAlertsQuery } from "@/lib/redux/slices/AlertSlice";
import { useGetDeviceSummaryQuery } from "@/lib/redux/slices/DeviceSlice";
import { useGetMonitoringDashboardQuery } from "@/lib/redux/slices/MonitoringSlice";
import { useGetAllUsersQuery } from "@/lib/redux/slices/AuthSlice";
import { formatDataUsage, formatNumber, formatDateTime, statusTone } from "@/lib/portal/formatters";

export default function AdminDashboardPage() {
  const { data: dashboard } = useGetMonitoringDashboardQuery();
  const { data: alertSummary } = useGetAlertSummaryQuery();
  const { data: deviceSummary } = useGetDeviceSummaryQuery();
  const { data: users } = useGetAllUsersQuery();
  const { data: alerts = [] } = useGetAlertsQuery({ status: "pending" });

  const incidents = alerts.slice(0, 5);

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin Command Center"
        title="Monitor the university network and respond to threats in real time."
        description="This workspace combines monitoring, device trust, role-based user visibility, and incident handling so the IT team can act quickly when the network is at risk."
        actions={
          <>
            <ActionButton tone="light">
              Last 24h activity: {formatNumber(dashboard?.activities.total)}
            </ActionButton>
            <ActionButton>
              Pending alerts: {formatNumber(alertSummary?.pending_alerts)}
            </ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Registered users"
          value={formatNumber(users?.length)}
          detail="Students, lecturers, guests, and administrators managed by the platform."
          tone="sky"
        />
        <StatCard
          icon={Network}
          label="Network events"
          value={formatNumber(dashboard?.activities.total)}
          detail={`Suspicious events: ${formatNumber(dashboard?.activities.suspicious)} in the last ${dashboard?.time_window ?? "24h"}.`}
          tone="violet"
        />
        <StatCard
          icon={BellRing}
          label="Open alerts"
          value={formatNumber(alertSummary?.pending_alerts)}
          detail={`Critical alerts: ${formatNumber(alertSummary?.critical_alerts)} awaiting review.`}
          tone="amber"
        />
        <StatCard
          icon={ShieldCheck}
          label="Known devices"
          value={formatNumber(deviceSummary?.total_devices)}
          detail={`Blocked or isolated devices: ${formatNumber(deviceSummary?.blocked_devices)}.`}
          tone="emerald"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Priority incidents" description="The most urgent unresolved events detected by NetGuard.">
          {incidents.length ? (
            <DataTable
              columns={[
                { key: "incident", label: "Incident" },
                { key: "target", label: "Target" },
                { key: "time", label: "Detected" },
                { key: "status", label: "Status" },
              ]}
              rows={incidents.map((alert) => ({
                incident: alert.message,
                target: alert.user_email ?? alert.device_name ?? "Network source",
                time: formatDateTime(alert.detected_at),
                status: <Badge tone={statusTone(alert.severity)}>{alert.status}</Badge>,
              }))}
            />
          ) : (
            <EmptyState
              title="No pending incidents right now"
              description="The detection engine is active, but there are no unresolved alerts in the queue."
            />
          )}
        </Panel>

        <Panel title="Operational status" description="High-level health indicators across the monitoring stack.">
          <div className="space-y-3">
            {[
              {
                label: "Detection engine",
                value: `${formatNumber(dashboard?.activities.suspicious)} suspicious events flagged`,
                badge: "Healthy",
              },
              {
                label: "Alert dispatch",
                value: `${formatNumber(alertSummary?.total_alerts)} alerts logged in the system`,
                badge: "Live",
              },
              {
                label: "Response automation",
                value: `${formatNumber(deviceSummary?.blocked_devices)} devices currently blocked`,
                badge: "Active",
              },
              {
                label: "Traffic usage",
                value: formatDataUsage(dashboard?.activities.data_usage_mb),
                badge: "Tracked",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                  </div>
                  <Badge tone="emerald">{item.badge}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: AlertTriangle,
            title: "Intrusion readiness",
            text: `Failed logins in the last ${dashboard?.time_window ?? "24h"}: ${formatNumber(dashboard?.activities.failed_logins)}.`,
          },
          {
            icon: UserCog,
            title: "User control",
            text: `${formatNumber(users?.filter((user) => user.status === "Inactive").length)} user accounts are currently inactive or restricted.`,
          },
          {
            icon: ShieldCheck,
            title: "Response support",
            text: `${formatNumber(deviceSummary?.unknown_devices)} unknown devices and ${formatNumber(deviceSummary?.unregistered_devices)} unregistered devices need review.`,
          },
        ].map(({ icon: Icon, title, text }) => (
          <Panel key={title} title={title}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-sky-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-7 text-slate-600">{text}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
