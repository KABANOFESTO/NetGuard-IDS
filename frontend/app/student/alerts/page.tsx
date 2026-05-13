"use client";

import { Bell, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function StudentAlertsPage() {
  const { data: activities = [], isLoading } = useGetNetworkActivitiesQuery({ is_suspicious: true });
  const notices = activities.filter((activity) => activity.is_suspicious);
  const resolvedNotices = activities.filter((activity) => !activity.is_suspicious && activity.outcome === "success");

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Alerts"
        title="Review security notices linked to your account."
        description="Students see advisory-level monitoring notices based on their own activity, such as suspicious login patterns, restricted-access attempts, or device-related issues."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Bell} label="Open notices" value={formatNumber(notices.length)} detail="Suspicious or restricted events that may need your attention." tone="amber" />
        <StatCard icon={ShieldAlert} label="Account warnings" value={formatNumber(notices.filter((activity) => activity.activity_type.includes("login")).length)} detail="Login-related events tied to your profile." tone="rose" />
        <StatCard icon={ShieldCheck} label="Normal events" value={formatNumber(resolvedNotices.length)} detail="Tracked events that completed successfully." tone="emerald" />
      </div>

      <Panel title="Notice history" description="These notices come from your monitored network activity rather than the admin-only incident queue.">
        {isLoading ? (
          <EmptyState title="Loading notices" description="Preparing the latest student-facing security notices." />
        ) : notices.length ? (
          <DataTable
            columns={[
              { key: "alert", label: "Notice" },
              { key: "source", label: "Source" },
              { key: "time", label: "Time" },
              { key: "status", label: "Status" },
            ]}
            rows={notices.map((activity) => ({
              alert: activity.description,
              source: activity.device_name || activity.destination || activity.ip_address,
              time: formatDateTime(activity.timestamp),
              status: <Badge tone={statusTone(activity.outcome)}>{activity.outcome}</Badge>,
            }))}
          />
        ) : (
          <EmptyState title="No active notices" description="There are no suspicious or restricted events associated with your account right now." />
        )}
      </Panel>

      <Panel title="What you should do" description="Recommended user actions for safe network usage.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: TriangleAlert,
              title: "Unknown login attempts",
              text: "Reset your password and report the issue if you did not attempt those logins.",
            },
            {
              icon: ShieldCheck,
              title: "New devices",
              text: "Confirm the device belongs to you before continuing to use campus network services.",
            },
            {
              icon: Bell,
              title: "Policy reminders",
              text: "Read advisory notices to avoid future automatic restrictions on your account.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <Icon className="h-5 w-5 text-sky-600" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
