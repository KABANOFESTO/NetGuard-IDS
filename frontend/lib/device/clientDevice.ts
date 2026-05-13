import type { Device } from "@/lib/redux/types/netguard";

type ClientDeviceType = "tablet" | "mobile" | "laptop" | "other";

const DEVICE_UUID_KEY = "netguard_device_uuid";
const DEVICE_ID_KEY = "netguard_device_id";
const LAST_REPORTED_BYTES_KEY = "netguard_last_reported_bytes";
const SESSION_STARTED_PREFIX = "netguard_session_started";

function getStoredUuid() {
  if (typeof window === "undefined") {
    return "000000000000";
  }

  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID().replaceAll("-", "");
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }

  return uuid;
}

function toPseudoMac(uuid: string) {
  const padded = uuid.padEnd(12, "0").slice(0, 12).toUpperCase();
  return padded.match(/.{1,2}/g)?.join(":") ?? "02:00:00:00:00:01";
}

export function getClientDeviceIdentity() {
  const uuid = getStoredUuid();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const platform = typeof navigator !== "undefined" ? navigator.platform : "Unknown";

  const lowered = userAgent.toLowerCase();
  const isTablet = /ipad|tablet|playbook|silk/.test(lowered);
  const isMobile = /mobile|android|iphone|ipod/.test(lowered);

  const deviceType: ClientDeviceType = isTablet
    ? "tablet"
    : isMobile
      ? "mobile"
      : /mac|win|linux|x11/i.test(platform)
        ? "laptop"
        : "other";

  let operatingSystem = "Unknown OS";
  if (/windows/i.test(userAgent)) operatingSystem = "Windows";
  else if (/android/i.test(userAgent)) operatingSystem = "Android";
  else if (/iphone|ipad|ios/i.test(userAgent)) operatingSystem = "iOS";
  else if (/mac os/i.test(userAgent)) operatingSystem = "macOS";
  else if (/linux/i.test(userAgent)) operatingSystem = "Linux";

  let browser = "Browser";
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome/i.test(userAgent)) browser = "Chrome";
  else if (/firefox/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";

  return {
    uuid,
    macAddress: toPseudoMac(uuid),
    deviceType,
    operatingSystem,
    deviceName: `${browser} on ${operatingSystem}`,
    registrationNotes:
      "Auto-registered browser client fingerprint for web portal monitoring.",
  };
}

export function getStoredDeviceId() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(DEVICE_ID_KEY);
  return raw ? Number(raw) : null;
}

export function storeDevice(device: Device) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(DEVICE_ID_KEY, String(device.id));
}

export function getCurrentTransferBytes() {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return 0;
  }

  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const resourceBytes = entries.reduce((sum, entry) => {
    const bytes = entry.transferSize || entry.encodedBodySize || 0;
    return sum + bytes;
  }, 0);

  const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const navigationBytes =
    navigationEntry?.transferSize || navigationEntry?.encodedBodySize || 0;

  return resourceBytes + navigationBytes;
}

export function getUsageDeltaBytes() {
  if (typeof window === "undefined") {
    return 0;
  }

  const current = getCurrentTransferBytes();
  const previous = Number(sessionStorage.getItem(LAST_REPORTED_BYTES_KEY) || "0");
  const delta = Math.max(0, current - previous);
  sessionStorage.setItem(LAST_REPORTED_BYTES_KEY, String(current));
  return delta;
}

export function bytesToMegabytes(bytes: number) {
  return bytes / (1024 * 1024);
}

export function markSessionStarted(userId: number, deviceId: number) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(`${SESSION_STARTED_PREFIX}:${userId}:${deviceId}`, "1");
}

export function hasSessionStarted(userId: number, deviceId: number) {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(`${SESSION_STARTED_PREFIX}:${userId}:${deviceId}`) === "1";
}
