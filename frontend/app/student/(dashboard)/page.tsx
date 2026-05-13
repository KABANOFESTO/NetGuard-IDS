"use client";

import { Bell, Laptop, ShieldCheck, Wifi } from "lucide-react";

import {
  ActionButton,
  Badge,
  EmptyState,
  InfoList,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";
import { useGetDevicesQuery } from "@/lib/redux/slices/DeviceSlice";
import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetNetworkActivitiesQuery } from "@/lib/redux/slices/MonitoringSlice";
import { formatDataUsage, formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function StudentDashboardPage() {
  const { data: user } = useGetMyDetailsQuery({});
  const { data: devices = [] } = useGetDevicesQuery();
  const { data: activities = [] } = useGetNetworkActivitiesQuery();

  const suspiciousActivities = activities.filter((activity) => activity.is_suspicious);
  const recentActivities = activities.slice(0, 3);
  const totalUsage = activities.reduce((sum, activity) => sum + activity.data_usage_mb, 0);

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Your network access, devices, and security notices in one place."
        description="This dashboard gives students and lecturers visibility into active devices, connection trust, recent activity, and monitoring notices without exposing admin-only controls."
        actions={
          <>
            <ActionButton tone="light">Role: {user?.role ?? "Student"}</ActionButton>
            <ActionButton>Tracked events: {formatNumber(activities.length)}</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} label="Current session" value={user?.status === "Active" ? "Connected" : "Restricted"} detail="Based on your account state in the backend." tone="emerald" />
        <StatCard icon={Laptop} label="Registered devices" value={formatNumber(devices.length)} detail="Devices associated with your account profile." tone="sky" />
        <StatCard icon={Bell} label="Security notices" value={formatNumber(suspiciousActivities.length)} detail="Suspicious or restricted events tied to your account." tone="amber" />
        <StatCard icon={ShieldCheck} label="Usage status" value={suspiciousActivities.length ? "Reviewing" : "Healthy"} detail={`Traffic observed: ${formatDataUsage(totalUsage)}.`} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Recent network activity" description="Your most recent campus access events and connection history.">
          {recentActivities.length ? (
            <InfoList
              rows={recentActivities.map((activity) => ({
                label: activity.activity_type.replaceAll("_", " "),
                value: activity.device_name || activity.user_email || activity.ip_address,
                detail: `${formatDateTime(activity.timestamp)} • ${activity.description}`,
                badge: <Badge tone={statusTone(activity.outcome)}>{activity.outcome}</Badge>,
              }))}
            />
          ) : (
            <EmptyState title="No activity yet" description="Your account has no recorded monitoring events yet." />
          )}
        </Panel>

        <Panel title="Security guidance" description="Student-facing recommendations based on campus network policy.">
          <div className="space-y-3">
            {[
              "Use only your registered devices when accessing internal campus services.",
              "If you receive repeated login-failure notices, reset your password immediately.",
              "Report any unknown device linked to your account to the IT team.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Account trust summary" description="How NetGuard currently sees your account on the university network.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Identity validation</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">{user?.status === "Active" ? "Passed" : "Restricted"}</p>
              <p className="mt-2 text-sm text-emerald-800">Credentials match your registered portal account.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-sky-700">Behavior pattern</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900">{suspiciousActivities.length ? "Reviewing" : "Normal"}</p>
              <p className="mt-2 text-sm text-sky-800">Based on the activity currently stored for your account.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Today at a glance" description="A simplified summary of your current network footprint.">
          <InfoList
            rows={[
              {
                label: "Bandwidth used",
                value: formatDataUsage(totalUsage),
                detail: "Combined data volume from your tracked network events.",
              },
              {
                label: "Activity records",
                value: formatNumber(activities.length),
                detail: "Authentication, access, and usage events tied to your account.",
              },
              {
                label: "Latest notice",
                value: suspiciousActivities[0]?.description ?? "No current advisory",
                detail: suspiciousActivities[0] ? formatDateTime(suspiciousActivities[0].timestamp) : "Your account currently shows normal usage.",
                badge: <Badge tone={suspiciousActivities[0] ? "amber" : "emerald"}>{suspiciousActivities[0] ? "Advisory" : "Healthy"}</Badge>,
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
