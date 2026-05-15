"use client";

import { Laptop, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import {
  useBlockDeviceMutation,
  useGetDevicesQuery,
  useGetDeviceSummaryQuery,
} from "@/lib/redux/slices/DeviceSlice";
import {
  useGetSecurityBlocksQuery,
  useUnblockSecurityBlockMutation,
} from "@/lib/redux/slices/SecuritySlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function AdminDevicesPage() {
  const { data: summary } = useGetDeviceSummaryQuery();
  const { data: devices = [], isLoading } = useGetDevicesQuery();
  const { data: activeBlocks = [] } = useGetSecurityBlocksQuery(true);
  const [blockDevice, { isLoading: blocking }] = useBlockDeviceMutation();
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
      toast.error("No active block record was found for this device.");
      return;
    }

    try {
      const response = await unblockSecurityBlock(activeBlock.id).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to unblock device."));
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 px-4 py-6 md:px-6 lg:px-8">
      <PageHeader
        eyebrow="Device Control"
        title="Track registered endpoints, spot unknown devices, and enforce trust state."
        description="Device identification is a core NetGuard feature. This view lets the IT team compare IP and MAC identity, see whether a device is registered, and take response action when something looks wrong."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Monitor} label="Known devices" value={formatNumber(summary?.total_devices)} detail="Devices currently stored in the university inventory." tone="emerald" />
        <StatCard icon={ShieldCheck} label="Trusted now" value={formatNumber(summary?.active_devices)} detail="Active devices that are not blocked or suspicious." tone="sky" />
        <StatCard icon={Laptop} label="Under review" value={formatNumber(summary?.suspicious_devices)} detail="Devices marked suspicious because of monitoring rules." tone="amber" />
        <StatCard icon={Smartphone} label="Unknown or unregistered" value={formatNumber((summary?.unknown_devices ?? 0) + (summary?.unregistered_devices ?? 0))} detail="Endpoints that need identity validation." tone="rose" />
      </div>

      <Panel title="Device inventory" description="Live inventory of network-connected devices and their latest trust state.">
        {isLoading ? (
          <EmptyState title="Loading devices" description="Fetching the current device inventory from the backend." />
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
            rows={devices.map((device) => ({
              device: (
                <div>
                  <p className="font-medium text-slate-900">{device.device_name}</p>
                  <p className="text-xs text-slate-500">{device.device_type} {device.operating_system ? `• ${device.operating_system}` : ""}</p>
                </div>
              ),
              owner: device.owner_name || device.owner_email || "Unassigned",
              identity: (
                <div>
                  <p>{device.ip_address}</p>
                  <p className="text-xs text-slate-500">{device.mac_address}</p>
                </div>
              ),
              status: <Badge tone={statusTone(device.status)}>{device.status}</Badge>,
              last_seen: formatDateTime(device.last_seen),
              action: (
                device.status === "blocked" ? (
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
                )
              ),
            }))}
          />
        ) : (
          <EmptyState title="No devices available" description="There are no registered devices in the system yet." />
        )}
      </Panel>
    </div>
  );
}
