import { Bell, ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function StudentAlertsPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Alerts"
        title="Review security notices linked to your account."
        description="Students can see advisory-level warnings, login issues, and device notices that help them keep their campus access secure."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Bell} label="Open notices" value="2" detail="Items that still need student attention." tone="amber" />
        <StatCard icon={ShieldAlert} label="Account warnings" value="1" detail="One warning tied to repeated failed login attempts." tone="rose" />
        <StatCard icon={ShieldCheck} label="Resolved notices" value="6" detail="Previously handled or auto-cleared alerts." tone="emerald" />
      </div>

      <Panel
        title="Alert history"
        description="These notices are informational unless the admin team marks them as escalated."
      >
        <DataTable
          columns={[
            { key: "alert", label: "Alert" },
            { key: "source", label: "Source" },
            { key: "time", label: "Time" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              alert: "Repeated failed login attempts detected",
              source: "Student Portal Sign-in",
              time: "Today, 07:51 AM",
              status: <Badge tone="amber">Needs review</Badge>,
            },
            {
              alert: "New device linked to account",
              source: "Campus Wi-Fi Registration",
              time: "Yesterday, 06:12 PM",
              status: <Badge tone="sky">Confirmed</Badge>,
            },
            {
              alert: "Password updated successfully",
              source: "Identity Service",
              time: "May 10, 2026",
              status: <Badge tone="emerald">Resolved</Badge>,
            },
          ]}
        />
      </Panel>

      <Panel
        title="What you should do"
        description="Recommended student actions for safe network usage."
      >
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
