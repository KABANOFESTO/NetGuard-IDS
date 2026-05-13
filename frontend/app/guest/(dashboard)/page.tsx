"use client";

import { Clock3, ShieldCheck, TimerReset, Wifi } from "lucide-react";

import { Badge, EmptyState, InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatDateTime, formatNumber } from "@/lib/portal/formatters";

export default function GuestDashboardPage() {
  const { data: user } = useGetMyDetailsQuery({});
  const { data: activities = [] } = useGetNetworkActivitiesQuery();

  const totalUsage = activities.reduce((sum, activity) => sum + activity.data_usage_mb, 0);
  const restrictedEvents = activities.filter((activity) => activity.outcome === "restricted");
  const latestActivity = activities[0];

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Portal"
        title="Manage temporary Wi-Fi access safely and clearly."
        description="Guest access in NetGuard is intentionally limited. This dashboard shows account status, monitored usage, recent session activity, and important policy information."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} label="Access status" value={user?.status === "Active" ? "Active" : "Restricted"} detail="Guest session state based on your current account record." tone="emerald" />
        <StatCard icon={Clock3} label="Latest activity" value={latestActivity ? formatDateTime(latestActivity.timestamp) : "No records"} detail="Most recent monitored guest event." tone="amber" />
        <StatCard icon={TimerReset} label="Session activity" value={formatNumber(activities.length)} detail="Tracked events linked to your temporary access account." tone="sky" />
        <StatCard icon={ShieldCheck} label="Restriction level" value="Limited" detail={`${formatNumber(restrictedEvents.length)} restricted events recorded.`} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Guest session summary" description="High-level information about your monitored temporary access.">
          {activities.length ? (
            <InfoList
              rows={[
                {
                  label: "Latest session event",
                  value: latestActivity?.activity_type.replaceAll("_", " ") ?? "No activity",
                  detail: latestActivity ? `${formatDateTime(latestActivity.timestamp)} • ${latestActivity.description}` : "No guest activity recorded yet.",
                },
                {
                  label: "Assigned scope",
                  value: "Visitor Wi-Fi Segment",
                  detail: "Restricted to public internet and approved guest services.",
                  badge: <Badge tone="sky">Limited scope</Badge>,
                },
                {
                  label: "Current usage",
                  value: formatDataUsage(totalUsage),
                  detail: "Combined data usage from the guest account's monitored activity.",
                  badge: <Badge tone="amber">Temporary</Badge>,
                },
              ]}
            />
          ) : (
            <EmptyState title="No guest session activity yet" description="There are no recorded guest network events for this account right now." />
          )}
        </Panel>

        <Panel title="Access policy reminders" description="What guests can and cannot do on the campus network.">
          <div className="space-y-3">
            {[
              "Guest users can access general internet services and approved public resources.",
              "Administrative dashboards, internal labs, and restricted systems are blocked.",
              "Suspicious usage or repeated policy violations may end the session early.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
