import { Laptop, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { Badge, DataTable, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";

export default function AdminDevicesPage() {
  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Device Control"
        title="Track registered devices, identify unknown endpoints, and review trust state."
        description="Device identification is a core NetGuard feature. This view helps the IT team compare IP and MAC identity, see trust status, and react when a device is unknown."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Monitor} label="Known devices" value="7,314" detail="Devices currently registered in system records." tone="emerald" />
        <StatCard icon={ShieldCheck} label="Trusted now" value="7,201" detail="Devices actively recognized and allowed." tone="sky" />
        <StatCard icon={Laptop} label="Under review" value="41" detail="Devices pending validation or recent change checks." tone="amber" />
        <StatCard icon={Smartphone} label="Unknown seen today" value="9" detail="Unregistered endpoints detected on monitored segments." tone="rose" />
      </div>

      <Panel title="Device inventory" description="Current device view across important network segments.">
        <DataTable
          columns={[
            { key: "device", label: "Device" },
            { key: "owner", label: "Owner" },
            { key: "identity", label: "IP / MAC" },
            { key: "status", label: "Status" },
          ]}
          rows={[
            {
              device: "Dell OptiPlex 7000",
              owner: "Admin Office Workstation",
              identity: "10.1.4.21 | 8C:8D:28:17:1A:22",
              status: <Badge tone="emerald">Trusted</Badge>,
            },
            {
              device: "Unknown Android Device",
              owner: "Unassigned",
              identity: "10.24.18.61 | D4:6A:6A:91:CC:10",
              status: <Badge tone="rose">Unknown</Badge>,
            },
            {
              device: "HP EliteBook 840",
              owner: "Lecturer Account",
              identity: "10.12.3.40 | 74:E5:F9:6D:3B:88",
              status: <Badge tone="amber">Review</Badge>,
            },
          ]}
        />
      </Panel>
    </div>
  );
}
