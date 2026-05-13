"use client";

import { Laptop, ShieldCheck, Smartphone, Tablet } from "lucide-react";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useGetDevicesQuery } from "@/lib/redux/slices/DeviceSlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";

export default function StudentDevicesPage() {
  const { data: devices = [], isLoading } = useGetDevicesQuery();

  const trustedDevices = devices.filter((device) => device.status === "active").length;

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Devices"
        title="Manage the devices currently associated with your account."
        description="Students and lecturers can verify registered devices, identify unknown hardware, and understand how NetGuard sees endpoint trust."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Laptop} label="Registered endpoints" value={formatNumber(devices.length)} detail="Devices linked to your account profile." tone="sky" />
        <StatCard icon={ShieldCheck} label="Trusted devices" value={formatNumber(trustedDevices)} detail="Devices currently marked active by the backend." tone="emerald" />
        <StatCard icon={Smartphone} label="Needs review" value={formatNumber(devices.filter((device) => device.status !== "active").length)} detail="Devices that are blocked, suspicious, or unknown." tone="amber" />
      </div>

      <Panel title="Device inventory" description="Known account devices and their latest network state.">
        {isLoading ? (
          <EmptyState title="Loading devices" description="Fetching your registered device inventory." />
        ) : devices.length ? (
          <DataTable
            columns={[
              { key: "device", label: "Device" },
              { key: "type", label: "Type" },
              { key: "identity", label: "Identity" },
              { key: "status", label: "Status" },
              { key: "last_seen", label: "Last seen" },
            ]}
            rows={devices.map((device) => ({
              device: device.device_name,
              type: device.device_type,
              identity: (
                <div>
                  <p>IP {device.ip_address}</p>
                  <p className="text-xs text-slate-500">MAC {device.mac_address}</p>
                </div>
              ),
              status: <Badge tone={statusTone(device.status)}>{device.status}</Badge>,
              last_seen: formatDateTime(device.last_seen),
            }))}
          />
        ) : (
          <EmptyState title="No devices linked yet" description="Your account does not have any registered devices right now." />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: Laptop, title: "Laptop access", text: "Best suited for academic portals, research systems, and heavier campus-service usage." },
          { icon: Smartphone, title: "Phone access", text: "Commonly used for notifications, messaging, and quick service authentication." },
          { icon: Tablet, title: "Tablet access", text: "Allowed for lighter learning and lecture content workflows." },
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
