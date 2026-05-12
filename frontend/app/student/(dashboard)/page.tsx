import {
  Bell,
  Laptop,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import {
  ActionButton,
  Badge,
  InfoList,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Your network access, devices, and security notices in one place."
        description="This dashboard gives students visibility into their active devices, connection trust, recent activity, and security alerts without exposing sensitive admin controls."
        actions={
          <>
            <ActionButton tone="light">Review devices</ActionButton>
            <ActionButton>Connection healthy</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} label="Current session" value="Connected" detail="Campus Wi-Fi access is active and verified." tone="emerald" />
        <StatCard icon={Laptop} label="Registered devices" value="3" detail="Laptop, phone, and tablet linked to your account." />
        <StatCard icon={Bell} label="Security alerts" value="1" detail="One advisory needs your attention." tone="amber" />
        <StatCard icon={ShieldCheck} label="Access status" value="Trusted" detail="No suspicious behavior detected on your account." tone="sky" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Recent network activity"
          description="Your most recent campus access events and connection history."
        >
          <InfoList
            rows={[
              {
                label: "Latest login",
                value: "Main Library Wi-Fi",
                detail: "Today, 08:14 AM from Dell Latitude 7420",
                badge: <Badge tone="emerald">Verified</Badge>,
              },
              {
                label: "Last device sync",
                value: "Samsung Galaxy A54",
                detail: "Today, 07:58 AM from Student Center access point",
                badge: <Badge tone="sky">Known device</Badge>,
              },
              {
                label: "Session history",
                value: "Engineering Block",
                detail: "Yesterday, 05:42 PM logout recorded normally",
                badge: <Badge tone="slate">Closed</Badge>,
              },
            ]}
          />
        </Panel>

        <Panel
          title="Security guidance"
          description="Student-facing recommendations based on campus network policy."
        >
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
        <Panel
          title="Account trust summary"
          description="How NetGuard currently sees your account on the university network."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Identity validation</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900">Passed</p>
              <p className="mt-2 text-sm text-emerald-800">Credentials match your registered student profile.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-sky-700">Behavior pattern</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900">Normal</p>
              <p className="mt-2 text-sm text-sky-800">Usage looks consistent with your recent sessions.</p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Today at a glance"
          description="A simplified summary of your current network footprint."
        >
          <InfoList
            rows={[
              {
                label: "Bandwidth used",
                value: "1.8 GB",
                detail: "Mostly academic portals, cloud storage, and lecture resources.",
              },
              {
                label: "Active duration",
                value: "4h 12m",
                detail: "Connected across two verified campus access points.",
              },
              {
                label: "Last alert",
                value: "Password hygiene reminder",
                detail: "Advisory only. No access restrictions applied.",
                badge: <Badge tone="amber">Advisory</Badge>,
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}
