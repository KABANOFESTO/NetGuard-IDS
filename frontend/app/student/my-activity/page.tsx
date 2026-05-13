"use client";

import { Activity, Clock3, Network, Route } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function StudentActivityPage() {
  const { data: activities = [], isLoading } = useGetNetworkActivitiesQuery();

  const accessPoints = new Set(activities.map((activity) => activity.destination || activity.ip_address)).size;
  const totalUsage = activities.reduce((sum, activity) => sum + activity.data_usage_mb, 0);

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Activity"
        title="Track your recent access activity across the campus network."
        description="This page summarizes the sessions, access points, and usage events associated with your student or lecturer account."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Recorded events" value={formatNumber(activities.length)} detail="Authentication, handoff, and usage events." />
        <StatCard icon={Clock3} label="Latest activity" value={activities[0] ? formatDateTime(activities[0].timestamp) : "No records"} detail="Most recent event seen by the backend." tone="sky" />
        <StatCard icon={Route} label="Observed endpoints" value={formatNumber(accessPoints)} detail="IPs or destinations associated with your account." tone="violet" />
        <StatCard icon={Network} label="Traffic pattern" value={formatDataUsage(totalUsage)} detail="Combined data usage from your recorded activity." tone="emerald" />
      </div>

      <Panel title="Activity timeline" description="A student-safe record of where and when your account was used.">
        {isLoading ? (
          <EmptyState title="Loading activity" description="Fetching your recent monitoring history." />
        ) : activities.length ? (
          <DataTable
            columns={[
              { key: "event", label: "Event" },
              { key: "location", label: "Location" },
              { key: "device", label: "Device" },
              { key: "status", label: "Status" },
              { key: "time", label: "Time" },
            ]}
            rows={activities.map((activity) => ({
              event: activity.activity_type.replaceAll("_", " "),
              location: activity.destination || activity.ip_address,
              device: activity.device_name || "Unspecified device",
              status: <Badge tone={statusTone(activity.outcome)}>{activity.outcome}</Badge>,
              time: formatDateTime(activity.timestamp),
            }))}
          />
        ) : (
          <EmptyState title="No activity available" description="Your account does not have any recorded activity yet." />
        )}
      </Panel>
    </div>
  );
}
