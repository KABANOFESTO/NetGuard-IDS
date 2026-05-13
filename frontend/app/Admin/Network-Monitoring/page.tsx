"use client";

import { Activity, Eye, Network, Router, Waves } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import {
  useGetMonitoringDashboardQuery,
  useGetNetworkActivitiesQuery,
} from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function AdminNetworkMonitoringPage() {
  const { data: dashboard } = useGetMonitoringDashboardQuery();
  const { data: activities = [], isLoading } = useGetNetworkActivitiesQuery();

  const recentActivities = activities.slice(0, 8);

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Network Monitoring"
        title="Watch live traffic patterns and access behavior across the campus network."
        description="This monitoring view reflects the data-collection and detection goals of NetGuard: track traffic, see where users and devices are connecting, and identify unusual behavior early."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Traffic health" value={dashboard?.activities.suspicious ? "Reviewing" : "Stable"} detail={`${formatNumber(dashboard?.activities.suspicious)} suspicious activities in the active window.`} tone="emerald" />
        <StatCard icon={Eye} label="Observed events" value={formatNumber(dashboard?.activities.total)} detail="Monitored authentication, usage, and device events." tone="sky" />
        <StatCard icon={Network} label="Failed logins" value={formatNumber(dashboard?.activities.failed_logins)} detail="Authentication failures recorded by the detection engine." tone="violet" />
        <StatCard icon={Router} label="Traffic volume" value={formatDataUsage(dashboard?.activities.data_usage_mb)} detail="Total data usage in the monitored reporting window." tone="amber" />
      </div>

      <Panel title="Recent observed activity" description="Fresh network events flowing into the monitoring backend.">
        {isLoading ? (
          <EmptyState title="Loading network activity" description="Preparing live network activity records." />
        ) : recentActivities.length ? (
          <DataTable
            columns={[
              { key: "event", label: "Event" },
              { key: "source", label: "Source" },
              { key: "usage", label: "Usage" },
              { key: "status", label: "Status" },
              { key: "time", label: "Time" },
            ]}
            rows={recentActivities.map((activity) => ({
              event: (
                <div>
                  <p className="font-medium text-slate-900">{activity.activity_type.replaceAll("_", " ")}</p>
                  <p className="text-xs text-slate-500">{activity.description}</p>
                </div>
              ),
              source: (
                <div>
                  <p>{activity.user_email || activity.device_name || activity.ip_address}</p>
                  <p className="text-xs text-slate-500">{activity.destination || activity.ip_address}</p>
                </div>
              ),
              usage: formatDataUsage(activity.data_usage_mb),
              status: <Badge tone={statusTone(activity.outcome)}>{activity.outcome}</Badge>,
              time: formatDateTime(activity.timestamp),
            }))}
          />
        ) : (
          <EmptyState title="No activity yet" description="The backend has not returned any network events yet." />
        )}
      </Panel>

      <Panel title="Monitoring notes">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <Waves className="h-5 w-5 text-sky-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Behavior baselines</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Top activity categories in the current dataset:{" "}
              {dashboard?.top_activity_types.length
                ? dashboard.top_activity_types.map((item) => `${item.activity_type} (${item.total})`).join(", ")
                : "No categories available yet."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Real-time response value</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              The backend has already flagged {formatNumber(dashboard?.activities.suspicious)} suspicious events and {formatNumber(dashboard?.alerts.pending)} pending alerts that can be acted on immediately.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
