"use client";

import { BarChart3, Clock3, Download, Upload } from "lucide-react";

import { EmptyState, InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatNumber } from "@/lib/portal/formatters";

export default function GuestUsageInfoPage() {
  const { data: activities = [] } = useGetNetworkActivitiesQuery();

  const totalUsage = activities.reduce((sum, activity) => sum + activity.data_usage_mb, 0);
  const downloadUsage = activities
    .filter((activity) => activity.activity_type === "download")
    .reduce((sum, activity) => sum + activity.data_usage_mb, 0);
  const uploadUsage = activities
    .filter((activity) => activity.activity_type === "upload")
    .reduce((sum, activity) => sum + activity.data_usage_mb, 0);

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Usage"
        title="See how your temporary session is being used."
        description="Guest usage visibility helps visitors understand their limits while giving the university a safer temporary-access model."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BarChart3} label="Total usage" value={formatDataUsage(totalUsage)} detail="Combined recorded guest traffic volume." />
        <StatCard icon={Clock3} label="Tracked events" value={formatNumber(activities.length)} detail="Monitored guest activity records." tone="sky" />
        <StatCard icon={Download} label="Download" value={formatDataUsage(downloadUsage)} detail="Recorded download traffic." tone="emerald" />
        <StatCard icon={Upload} label="Upload" value={formatDataUsage(uploadUsage)} detail="Recorded upload traffic." tone="violet" />
      </div>

      <Panel title="Usage breakdown" description="A simple summary of how the guest account is using the network.">
        {activities.length ? (
          <InfoList
            rows={[
              {
                label: "Top category",
                value: activities[0]?.activity_type.replaceAll("_", " ") ?? "General usage",
                detail: "Based on the most recent guest monitoring record.",
              },
              {
                label: "Streaming controls",
                value: "Limited quality allowance",
                detail: "Heavy bandwidth services may be deprioritized during peak academic hours.",
              },
              {
                label: "Restricted access",
                value: "Internal systems blocked",
                detail: "Administrative, research, and protected university services remain inaccessible.",
              },
            ]}
          />
        ) : (
          <EmptyState title="No usage records yet" description="There is no guest usage data available for this account yet." />
        )}
      </Panel>
    </div>
  );
}
