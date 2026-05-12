import { Clock3, ShieldCheck, TimerReset, Wifi } from "lucide-react";
import { Badge, InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function GuestDashboardPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Guest Portal"
        title="Manage temporary Wi-Fi access safely and clearly."
        description="Guest access in NetGuard is intentionally limited. This dashboard shows session validity, access duration, basic usage, and important policy information."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} label="Access status" value="Active" detail="Guest session is currently authorized." tone="emerald" />
        <StatCard icon={Clock3} label="Time remaining" value="06h 40m" detail="Temporary access window before expiry." tone="amber" />
        <StatCard icon={TimerReset} label="Session quota" value="1 day" detail="Single-day guest allocation policy." tone="sky" />
        <StatCard icon={ShieldCheck} label="Restriction level" value="Limited" detail="Internal administrative systems remain blocked." tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Guest session summary" description="High-level information about your temporary network access.">
          <InfoList
            rows={[
              {
                label: "Session issued",
                value: "Today, 08:00 AM",
                detail: "Provisioned by University reception desk",
              },
              {
                label: "Assigned zone",
                value: "Visitor Wi-Fi Segment",
                detail: "Restricted to public internet and approved guest services",
                badge: <Badge tone="sky">Limited scope</Badge>,
              },
              {
                label: "Expiration",
                value: "Today, 08:00 PM",
                detail: "Guest session automatically closes after the access window ends",
                badge: <Badge tone="amber">Time-bound</Badge>,
              },
            ]}
          />
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
