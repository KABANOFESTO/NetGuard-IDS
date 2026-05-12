import {
  AlertTriangle,
  BellRing,
  Network,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import {
  ActionButton,
  Badge,
  DataTable,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/portal/PortalUI";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin Command Center"
        title="Monitor the university network and respond to threats in real time."
        description="This is the operational heart of NetGuard for Admin and IT staff. It brings together live monitoring, suspicious behavior detection, device trust, and rapid response visibility."
        actions={
          <>
            <ActionButton tone="light">Export briefing</ActionButton>
            <ActionButton>Open incident queue</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersRound} label="Active users" value="4,862" detail="Students, lecturers, guests, and admin sessions online." tone="sky" />
        <StatCard icon={Network} label="Monitored traffic lanes" value="18" detail="Network zones and service segments under watch." tone="violet" />
        <StatCard icon={BellRing} label="Open alerts" value="19" detail="Events waiting for review or action." tone="amber" />
        <StatCard icon={ShieldCheck} label="Protected endpoints" value="7,314" detail="Registered devices currently known to the system." tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Priority incidents" description="The most important events for the IT team right now.">
          <DataTable
            columns={[
              { key: "incident", label: "Incident" },
              { key: "zone", label: "Zone" },
              { key: "trigger", label: "Trigger" },
              { key: "status", label: "Status" },
            ]}
            rows={[
              {
                incident: "Repeated failed admin login attempts",
                zone: "Internal Admin Portal",
                trigger: "12 failed attempts in 9 minutes",
                status: <Badge tone="rose">Critical</Badge>,
              },
              {
                incident: "Unknown device joined restricted lab VLAN",
                zone: "Engineering Lab",
                trigger: "MAC address not in registered inventory",
                status: <Badge tone="amber">Investigating</Badge>,
              },
              {
                incident: "Guest session tried to access blocked service",
                zone: "Visitor Network",
                trigger: "Restricted endpoint access",
                status: <Badge tone="sky">Contained</Badge>,
              },
            ]}
          />
        </Panel>

        <Panel title="Operational status" description="High-level indicators of system health and readiness.">
          <div className="space-y-3">
            {[
              { label: "Detection engine", value: "Running normally", tone: "emerald" as const },
              { label: "Alert dispatch", value: "Dashboard notifications active", tone: "sky" as const },
              { label: "Response automation", value: "Temporary restriction policy enabled", tone: "amber" as const },
              { label: "Database logging", value: "Audit records writing successfully", tone: "violet" as const },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                  </div>
                  <Badge tone={item.tone}>Healthy</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: AlertTriangle,
            title: "Intrusion readiness",
            text: "Track invalid logins, restricted-area access, and abnormal usage patterns without waiting for manual review.",
          },
          {
            icon: UserCog,
            title: "User control",
            text: "Review user roles, investigate account behavior, and intervene quickly when policy violations appear.",
          },
          {
            icon: ShieldCheck,
            title: "Response support",
            text: "Restrict suspicious devices, flag sessions, and preserve logs for follow-up investigation and reporting.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <Panel key={title} title={title}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-3 text-sky-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-7 text-slate-600">{text}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
