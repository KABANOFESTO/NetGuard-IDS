"use client";

import { CalendarClock, MapPin, ShieldCheck, Wifi } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function GuestSessionInfoPage() {
  const { data: activities = [], isLoading } = useGetNetworkActivitiesQuery();

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Session"
        title="View the details of your temporary access session."
        description="Guest sessions are monitored to protect the university network while still giving visitors practical internet access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Wifi} label="Session records" value={formatNumber(activities.length)} detail="Guest activity events currently stored in the backend." tone="emerald" />
        <StatCard icon={CalendarClock} label="Latest event" value={activities[0] ? formatDateTime(activities[0].timestamp) : "No records"} detail="Most recent guest activity seen by the system." tone="amber" />
        <StatCard icon={ShieldCheck} label="Security posture" value={activities.some((activity) => activity.outcome === "restricted") ? "Contained" : "Normal"} detail="Guest sessions stay inside the restricted network segment." tone="sky" />
      </div>

      <Panel title="Session record" description="Important details about your current and recent guest connections.">
        {isLoading ? (
          <EmptyState title="Loading session history" description="Fetching recent guest network activity." />
        ) : activities.length ? (
          <DataTable
            columns={[
              { key: "session", label: "Session event" },
              { key: "location", label: "Location" },
              { key: "started", label: "Started" },
              { key: "status", label: "Status" },
            ]}
            rows={activities.map((activity) => ({
              session: activity.activity_type.replaceAll("_", " "),
              location: activity.destination || activity.ip_address,
              started: formatDateTime(activity.timestamp),
              status: <Badge tone={statusTone(activity.outcome)}>{activity.outcome}</Badge>,
            }))}
          />
        ) : (
          <EmptyState title="No guest session history" description="This account has no stored guest session events yet." />
        )}
      </Panel>

      <Panel title="Coverage notes">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <MapPin className="h-5 w-5 text-sky-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Access zone</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Guest accounts are contained to public-facing wireless coverage where temporary access is expected.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Monitoring</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              NetGuard still tracks basic usage, timing, and suspicious behavior even on restricted visitor access.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
