import { Activity, Clock3, Network, Route } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function StudentActivityPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Activity"
        title="Track your recent access activity across the campus network."
        description="This page summarizes the sessions, access points, and usage events associated with your student account."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Events today" value="14" detail="Authentication, handoff, and network usage events." />
        <StatCard icon={Clock3} label="Active session time" value="4h 12m" detail="Connection time across current devices." tone="sky" />
        <StatCard icon={Route} label="Access points used" value="3" detail="Library, student center, and faculty block." tone="violet" />
        <StatCard icon={Network} label="Traffic pattern" value="Normal" detail="No abnormal spikes flagged for your account." tone="emerald" />
      </div>

      <Panel
        title="Activity timeline"
        description="A student-safe record of where and when your account was used."
      >
        <DataTable
          columns={[
            { key: "event", label: "Event" },
            { key: "location", label: "Location" },
            { key: "device", label: "Device" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              event: "Successful sign-in",
              location: "Main Library",
              device: "Dell Latitude 7420",
              status: <Badge tone="emerald">Allowed</Badge>,
            },
            {
              event: "Access point handoff",
              location: "Student Center",
              device: "Samsung Galaxy A54",
              status: <Badge tone="sky">Tracked</Badge>,
            },
            {
              event: "Portal session ended",
              location: "Engineering Block",
              device: "Dell Latitude 7420",
              status: <Badge tone="slate">Closed</Badge>,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
