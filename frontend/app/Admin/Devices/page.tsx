"use client";

import { Laptop, Monitor, Network, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Badge, DataTable, EmptyState, PageHeader, Panel, StatCard } from "@/components/portal/PortalUI";
import { useBlockDeviceMutation, useGetDevicesQuery, useGetDeviceSummaryQuery } from "@/lib/redux/slices/DeviceSlice";
import { useGetSecurityBlocksQuery, useUnblockSecurityBlockMutation } from "@/lib/redux/slices/SecuritySlice";
import { formatDateTime, formatNumber, statusTone } from "@/lib/portal/formatters";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function AdminDevicesPage() {
  const { data: summary } = useGetDeviceSummaryQuery({ same_network: true });
  const { data: devices = [], isLoading } = useGetDevicesQuery({ same_network: true });
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
        title="Track devices seen on the current university network and control them without typing MAC addresses."
        description="This view shows only endpoints detected on the active network segment, so admins can review IP and MAC identity, see trust state, and block or unblock devices directly from the list."
      />

      <div className="rounded-3xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-sky-700 shadow-sm">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Current network status</p>
              <p className="mt-1 text-sm text-slate-600">
                NetGuard is showing devices detected on the active control network. Devices on other Wi-Fi networks stay accessible normally unless they are linked to a block record.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="sky">Current network only</Badge>
            <Badge tone="emerald">{formatNumber(summary?.active_devices ?? 0)} trusted</Badge>
            <Badge tone="amber">{formatNumber(summary?.suspicious_devices ?? 0)} under review</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Monitor}
          label="Same-network devices"
          value={formatNumber(summary?.total_devices)}
          detail="Endpoints detected on the current control network."
          tone="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="Trusted now"
          value={formatNumber(summary?.active_devices)}
          detail="Active devices that are not blocked or suspicious."
          tone="sky"
        />
        <StatCard
          icon={Laptop}
          label="Under review"
          value={formatNumber(summary?.suspicious_devices)}
          detail="Devices marked suspicious because of monitoring rules."
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

      <Panel title="Current network inventory" description="Only devices seen on the active control network are listed here.">
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
                  <p className="text-xs text-slate-500">
                    {device.device_type}
                    {device.operating_system ? ` • ${device.operating_system}` : ""}
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
              status: <Badge tone={statusTone(device.status)}>{device.status}</Badge>,
              last_seen: formatDateTime(device.last_seen),
              action:
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
                ),
            }))}
          />
        ) : (
          <EmptyState
            title="No devices on this network"
            description="NetGuard did not detect any devices on the current control network yet."
          />
        )}
      </Panel>
    </div>
  );
}
