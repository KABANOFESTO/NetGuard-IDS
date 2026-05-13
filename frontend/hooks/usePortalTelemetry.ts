"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

import { useGetDevicesQuery, useRegisterDeviceMutation } from "@/lib/redux/slices/DeviceSlice";
import { useGetMyDetailsQuery } from "@/lib/redux/slices/AuthSlice";
import { useCreateNetworkActivityMutation } from "@/lib/redux/slices/MonitoringSlice";
import {
  bytesToMegabytes,
  getClientDeviceIdentity,
  getStoredDeviceId,
  getUsageDeltaBytes,
  hasSessionStarted,
  markSessionStarted,
  storeDevice,
} from "@/lib/device/clientDevice";

export function usePortalTelemetry() {
  const pathname = usePathname() ?? "/";
  const routeRef = useRef(pathname);
  const { data: user, isSuccess: hasUser } = useGetMyDetailsQuery({});
  const { data: devices = [] } = useGetDevicesQuery(undefined, { skip: !hasUser });
  const [registerDevice] = useRegisterDeviceMutation();
  const [createNetworkActivity] = useCreateNetworkActivityMutation();

  const identity = useMemo(() => getClientDeviceIdentity(), []);
  const device = useMemo(
    () => devices.find((item) => item.mac_address === identity.macAddress) ?? null,
    [devices, identity.macAddress]
  );

  useEffect(() => {
    routeRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!hasUser || device || !user) {
      return;
    }

    let cancelled = false;

    const bootstrapDevice = async () => {
      try {
        const created = await registerDevice({
          device_name: identity.deviceName,
          device_type: identity.deviceType,
          mac_address: identity.macAddress,
          operating_system: identity.operatingSystem,
          registration_notes: identity.registrationNotes,
        }).unwrap();

        if (!cancelled) {
          storeDevice(created);
        }
      } catch (error) {
        // Ignore duplicate or transient registration errors; device query will reflect server state.
        void error;
      }
    };

    void bootstrapDevice();
    return () => {
      cancelled = true;
    };
  }, [device, hasUser, identity, registerDevice, user]);

  useEffect(() => {
    if (device) {
      storeDevice(device);
    }
  }, [device]);

  useEffect(() => {
    if (!user || !device) {
      return;
    }

    if (hasSessionStarted(user.id, device.id)) {
      return;
    }

    markSessionStarted(user.id, device.id);

    void createNetworkActivity({
      device: device.id,
      activity_type: "session_start",
      description: "User session started from monitored web portal client.",
      destination: pathname,
      outcome: "success",
      data_usage_mb: 0,
      metadata: {
        source: "web_portal",
        device_uuid: identity.uuid,
      },
    });
  }, [createNetworkActivity, device, identity.uuid, pathname, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const knownDeviceId = device?.id ?? getStoredDeviceId();
    if (!knownDeviceId) {
      return;
    }

    const flushUsage = () => {
      const deltaBytes = getUsageDeltaBytes();
      const deltaMb = bytesToMegabytes(deltaBytes);

      if (deltaMb <= 0) {
        return;
      }

      void createNetworkActivity({
        device: knownDeviceId,
        activity_type: "download",
        description: `Observed portal traffic while visiting ${routeRef.current}.`,
        destination: routeRef.current,
        outcome: "success",
        data_usage_mb: Number(deltaMb.toFixed(4)),
        metadata: {
          source: "web_portal",
          device_uuid: identity.uuid,
          sample_type: "resource_transfer",
        },
      });
    };

    const interval = window.setInterval(flushUsage, 30000);
    const visibilityHandler = () => {
      if (document.visibilityState === "hidden") {
        flushUsage();
      }
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("beforeunload", flushUsage);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("beforeunload", flushUsage);
      flushUsage();
    };
  }, [createNetworkActivity, device?.id, identity.uuid, user]);
}
