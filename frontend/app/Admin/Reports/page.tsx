"use client";

import { ClipboardList, FileBarChart, ShieldCheck, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Badge, EmptyState, InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetAuditLogsQuery } from "@/lib/redux/slices/AuditLogSlice";
import { useGetMonitoringReportQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatNumber } from "@/lib/portal/formatters";

export default function AdminReportsPage() {
  const [days, setDays] = useState(7);
  const { data: report } = useGetMonitoringReportQuery(days);
  const { data: auditLogs = [] } = useGetAuditLogsQuery({ ordering: "-timestamp" });

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Reporting"
        title="Turn monitoring data into usable operational and security reports."
        description="Reporting helps the university review intrusions, user behavior, response actions, and long-term network patterns in a way that supports both security and operations."
      />

      <div className="flex gap-2">
        {[7, 14, 30].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setDays(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              days === value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            Last {value} days
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Tracked activities" value={formatNumber(report?.activity_summary.total_activities)} detail={`Suspicious activities: ${formatNumber(report?.activity_summary.suspicious_activities)}.`} tone="sky" />
        <StatCard icon={FileBarChart} label="Intrusion alerts" value={formatNumber(report?.alert_summary.total_alerts)} detail={`Resolved: ${formatNumber(report?.alert_summary.resolved_alerts)}.`} tone="rose" />
        <StatCard icon={ShieldCheck} label="Audit records" value={formatNumber(auditLogs.length)} detail="Security, user, dashboard, and reporting actions logged." tone="emerald" />
        <StatCard icon={TrendingUp} label="Traffic volume" value={formatDataUsage(report?.activity_summary.total_data_usage_mb)} detail={`Reporting window: ${days} days.`} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top active users" description="Accounts with the most monitored network activity in the selected period.">
          {report?.top_users.length ? (
            <InfoList
              rows={report.top_users.map((user) => ({
                label: `User #${user.user__id}`,
                value: user.user__email,
                detail: `${formatNumber(user.total)} recorded activities`,
                badge: <Badge tone="sky">Observed</Badge>,
              }))}
            />
          ) : (
            <EmptyState title="No user activity yet" description="There is not enough activity data to build a ranked user report." />
          )}
        </Panel>

        <Panel title="Top active devices" description="Devices with the most activity in the selected reporting period.">
          {report?.top_devices.length ? (
            <InfoList
              rows={report.top_devices.map((device) => ({
                label: `Device #${device.device__id}`,
                value: device.device__device_name,
                detail: `${formatNumber(device.total)} recorded activities`,
                badge: <Badge tone="emerald">Tracked</Badge>,
              }))}
            />
          ) : (
            <EmptyState title="No device activity yet" description="There is not enough device activity data to build a ranked device report." />
          )}
        </Panel>
      </div>
    </div>
  );
}
