"use client";

import { useState } from "react";
import { Laptop, Monitor, Network, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useBlockDeviceMutation, useDeleteDeviceMutation, useGetDevicesQuery, useGetDeviceSummaryQuery } from "@/lib/redux/slices/DeviceSlice";
import { useGetSecurityBlocksQuery, useUnblockSecurityBlockMutation } from "@/lib/redux/slices/SecuritySlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function AdminDevicesPage() {
  const [scope, setScope] = useState<"all" | "current_network">("all");
  const deviceFilter = scope === "current_network" ? { same_network: true } : undefined;
  const { data: summary } = useGetDeviceSummaryQuery(deviceFilter);
  const { data: devices = [], isLoading } = useGetDevicesQuery(deviceFilter);
  const { data: activeBlocks = [] } = useGetSecurityBlocksQuery(true);
  const [blockDevice, { isLoading: blocking }] = useBlockDeviceMutation();
  const [deleteDevice, { isLoading: deleting }] = useDeleteDeviceMutation();
  const [unblockSecurityBlock, { isLoading: unblocking }] = useUnblockSecurityBlockMutation();

  const activeBlockByDeviceId = new Map(
    activeBlocks
      .filter((block) => block.device && block.is_active)
      .map((block) => [block.device as number, block])
  );

  const handleBlock = async (deviceId: number) => {
    try {
      const response = await blockDevice({ id: deviceId, reason: "manual_block" }).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to block device."));
    }
  };

  const handleUnblock = async (deviceId: number) => {
    const activeBlock = activeBlockByDeviceId.get(deviceId);
    if (!activeBlock) {
      toast.error("No active network block was found for this device.");
      return;
    }

    try {
      const response = await unblockSecurityBlock(activeBlock.id).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to unblock device."));
    }
  };

  const handleDelete = async (deviceId: number) => {
    const confirmed = window.confirm("Delete this device from NetGuard inventory? This removes its record and related block history.");
    if (!confirmed) return;

    try {
      const response = await deleteDevice(deviceId).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete device."));
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Device Control"
        title="Control devices by the network they are connected through."
        description="Admins can review device identity, see active network blocks, and remove inventory records without typing MAC addresses manually."
      />

      <div className="rounded-3xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-sky-700 shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Network-scoped control</p>
              <p className="mt-1 text-sm text-slate-600">
                Blocks are applied to the network scope where the admin creates them. If the same device connects through another router or Wi-Fi, that separate network is evaluated independently.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                scope === "all" ? "bg-sky-600 text-white" : "border border-sky-200 bg-white text-slate-700"
              }`}
            >
              All devices
            </button>
            <button
              type="button"
              onClick={() => setScope("current_network")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                scope === "current_network" ? "bg-sky-600 text-white" : "border border-sky-200 bg-white text-slate-700"
              }`}
            >
              Current network only
            </button>
            <Badge tone="emerald">{formatNumber(summary?.active_devices ?? 0)} trusted</Badge>
            <Badge tone="amber">{formatNumber(summary?.suspicious_devices ?? 0)} under review</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Monitor}
          label={scope === "current_network" ? "Same-network devices" : "All devices"}
          value={formatNumber(summary?.total_devices)}
          detail={scope === "current_network" ? "Endpoints detected on the current control network." : "All devices stored in NetGuard."}
          tone="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="Trusted now"
          value={formatNumber(summary?.active_devices)}
          detail="Active devices without a suspicious inventory state."
          tone="sky"
        />
        <StatCard
          icon={Laptop}
          label="Under review"
          value={formatNumber(summary?.suspicious_devices)}
          detail="Devices marked suspicious by monitoring rules."
          tone="amber"
        />
        <StatCard
          icon={Smartphone}
          label="Unknown or unregistered"
          value={formatNumber((summary?.unknown_devices ?? 0) + (summary?.unregistered_devices ?? 0))}
          detail="Endpoints that need identity validation."
          tone="rose"
        />
      </div>

      <Panel
        title={scope === "current_network" ? "Current network inventory" : "All devices inventory"}
        description={
          scope === "current_network"
            ? "Only devices seen on the active control network are listed here."
            : "All registered devices are shown here, with active network blocks clearly marked."
        }
      >
        {isLoading ? (
          <EmptyState title="Loading devices" description="Fetching the device inventory from the backend." />
        ) : devices.length ? (
          <DataTable
            columns={[
              { key: "device", label: "Device" },
              { key: "owner", label: "Owner" },
              { key: "identity", label: "IP / MAC" },
              { key: "status", label: "Status" },
              { key: "last_seen", label: "Last seen" },
              { key: "action", label: "Action" },
            ]}
            rows={devices.map((device) => {
              const activeBlock = activeBlockByDeviceId.get(device.id);
              return {
                device: (
                  <div>
                    <p className="font-medium text-slate-900">{device.device_name}</p>
                    <p className="text-xs text-slate-500">
                      {device.device_type}
                      {device.operating_system ? ` - ${device.operating_system}` : ""}
                    </p>
                  </div>
                ),
                owner: device.owner_name || device.owner_email || "Unassigned",
                identity: (
                  <div>
                    <p>{device.ip_address}</p>
                    <p className="text-xs text-slate-500">{device.mac_address}</p>
                  </div>
                ),
                status: activeBlock ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="rose">Network blocked</Badge>
                    {activeBlock.network_scope ? <Badge tone="slate">{activeBlock.network_scope}</Badge> : null}
                  </div>
                ) : (
                  <Badge tone={statusTone(device.status)}>{device.status}</Badge>
                ),
                last_seen: formatDateTime(device.last_seen),
                action: (
                  <div className="flex flex-wrap gap-2">
                    {activeBlock ? (
                      <button
                        type="button"
                        disabled={unblocking}
                        onClick={() => handleUnblock(device.id)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={blocking}
                        onClick={() => handleBlock(device.id)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Block
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => handleDelete(device.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ),
              };
            })}
          />
        ) : (
          <EmptyState
            title={scope === "current_network" ? "No devices on this network" : "No devices available"}
            description={
              scope === "current_network"
                ? "NetGuard did not detect any devices on the current control network yet. Switch to All devices to view the full inventory."
                : "There are no registered devices in the system yet."
            }
          />
        )}
      </Panel>
    </div>
  );
}
