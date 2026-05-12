import { Activity, Eye, Network, Router, Waves } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function AdminNetworkMonitoringPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Network Monitoring"
        title="Watch live traffic patterns and access behavior across the campus network."
        description="This monitoring view reflects the core data-collection and detection goals of NetGuard: track traffic, see where users are connecting, and identify unusual behavior early."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Traffic health" value="Stable" detail="No major congestion across monitored segments." tone="emerald" />
        <StatCard icon={Eye} label="Live sessions" value="5,114" detail="Authenticated users currently visible to the system." tone="sky" />
        <StatCard icon={Network} label="Monitored segments" value="18" detail="Academic, admin, guest, and lab network zones." tone="violet" />
        <StatCard icon={Router} label="Anomalies flagged" value="7" detail="Events with behavior outside normal baseline." tone="amber" />
      </div>

      <Panel title="Observed network segments" description="Operational visibility by zone.">
        <DataTable
          columns={[
            { key: "segment", label: "Segment" },
            { key: "users", label: "Active users" },
            { key: "usage", label: "Traffic pattern" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              segment: "Student Wi-Fi",
              users: "3,420",
              usage: "High but expected morning usage",
              status: <Badge tone="emerald">Normal</Badge>,
            },
            {
              segment: "Engineering Labs",
              users: "416",
              usage: "Elevated access to internal lab systems",
              status: <Badge tone="amber">Reviewing</Badge>,
            },
            {
              segment: "Guest Network",
              users: "84",
              usage: "Contained public traffic only",
              status: <Badge tone="sky">Restricted</Badge>,
            },
          ]}
        />
      </Panel>

      <Panel title="Monitoring notes">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <Waves className="h-5 w-5 text-sky-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Behavior baselines</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              NetGuard compares traffic intensity, login patterns, and restricted-area access against normal campus behavior to find anomalies early.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <Activity className="h-5 w-5 text-emerald-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Real-time response value</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Faster visibility reduces the time between suspicious activity, human review, and a containment decision by the IT team.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
