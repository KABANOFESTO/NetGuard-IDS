import { ClipboardList, FileBarChart, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge, InfoList, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Reporting"
        title="Turn monitoring data into usable operational and security reports."
        description="Reporting is part of NetGuard’s logging and audit value. These summaries help the university review intrusions, user behavior, device status, and response trends."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Reports generated" value="28" detail="Security and activity reports prepared this month." tone="sky" />
        <StatCard icon={FileBarChart} label="Intrusion reports" value="9" detail="Focused on suspicious access incidents." tone="rose" />
        <StatCard icon={ShieldCheck} label="Compliance logs" value="100%" detail="Detection, alert, and response actions are recorded." tone="emerald" />
        <StatCard icon={TrendingUp} label="Trend direction" value="-18%" detail="Critical incidents reduced compared with last month." tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Available report sets" description="The kinds of reporting the IT team can review regularly.">
          <InfoList
            rows={[
              {
                label: "Intrusion summary",
                value: "Suspicious access report",
                detail: "Failed logins, unknown devices, restricted-service attempts, and escalations.",
                badge: <Badge tone="rose">Security</Badge>,
              },
              {
                label: "User activity",
                value: "Role-based access log",
                detail: "User logins, active sessions, and usage patterns across academic and guest segments.",
                badge: <Badge tone="sky">Operations</Badge>,
              },
              {
                label: "Response review",
                value: "Containment and action history",
                detail: "Blocks, restrictions, investigations, and admin interventions.",
                badge: <Badge tone="emerald">Audit</Badge>,
              },
            ]}
          />
        </Panel>

        <Panel title="Why reporting matters" description="Reports make the system usable in real university operations.">
          <div className="space-y-3">
            {[
              "Helps the IT team demonstrate that threats were detected and handled.",
              "Provides evidence when reviewing misuse, unauthorized access, or abnormal sessions.",
              "Supports future scaling decisions by showing where the network is under the most stress.",
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
