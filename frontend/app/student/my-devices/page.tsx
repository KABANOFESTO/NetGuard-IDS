import { Laptop, ShieldCheck, Smartphone, Tablet } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function StudentDevicesPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Devices"
        title="Manage the devices currently associated with your account."
        description="Students can verify registered devices, identify unknown hardware, and understand how NetGuard sees their endpoint trust."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Laptop} label="Registered endpoints" value="3" detail="Devices linked to your account profile." tone="sky" />
        <StatCard icon={ShieldCheck} label="Trusted devices" value="3" detail="All registered devices are currently recognized." tone="emerald" />
        <StatCard icon={Smartphone} label="New device requests" value="0" detail="No pending registration actions." tone="amber" />
      </div>

      <Panel
        title="Device inventory"
        description="Known student devices and their latest network state."
      >
        <DataTable
          columns={[
            { key: "device", label: "Device" },
            { key: "type", label: "Type" },
            { key: "identity", label: "Identity" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              device: "Dell Latitude 7420",
              type: "Laptop",
              identity: "IP 10.24.8.14 | MAC 9C:7B:EF:20:4A:18",
              status: <Badge tone="emerald">Trusted</Badge>,
            },
            {
              device: "Samsung Galaxy A54",
              type: "Phone",
              identity: "IP 10.24.8.92 | MAC F4:1E:57:8C:2D:4A",
              status: <Badge tone="emerald">Trusted</Badge>,
            },
            {
              device: "iPad Air",
              type: "Tablet",
              identity: "IP 10.24.9.26 | MAC 34:AB:37:5D:9F:11",
              status: <Badge tone="sky">Idle</Badge>,
            },
          ]}
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: Laptop, title: "Laptop access", text: "Best suited for academic portals, research systems, and heavy campus-service usage." },
          { icon: Smartphone, title: "Phone access", text: "Commonly used for notifications, messaging, and quick service authentication." },
          { icon: Tablet, title: "Tablet access", text: "Allowed for light student workflows and lecture content consumption." },
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
