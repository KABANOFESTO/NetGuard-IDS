import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearAuthSession, setAuthNotice } from "@/lib/auth/session";
import { getClientDeviceIdentity, getStoredDeviceId } from "@/lib/device/clientDevice";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const normalizedBaseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;
const publicAuthPaths = new Set([
  "auth/login/",
  "auth/register/",
  "auth/forgot-password/",
  "auth/reset-password/",
]);

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${normalizedBaseUrl}/api/`,
    prepareHeaders: (headers, { arg }) => {
      const requestUrl =
        typeof arg === "string" ? arg : typeof arg === "object" && arg?.url ? arg.url : "";

      if (typeof window !== "undefined") {
        const deviceIdentity = getClientDeviceIdentity();
        const storedDeviceId = getStoredDeviceId();
        headers.set("X-Device-Mac", deviceIdentity.macAddress);
        if (storedDeviceId) {
          headers.set("X-Device-Id", String(storedDeviceId));
        }
      }

      if (publicAuthPaths.has(requestUrl)) {
        headers.delete("Authorization");
        return headers;
      }

      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return headers;
    },
  });

const baseQueryWithAuthHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const requestUrl =
    typeof args === "string" ? args : typeof args === "object" && args?.url ? args.url : "";
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && typeof window !== "undefined") {
    const data = result.error.data as
      | { error?: string; code?: string; detail?: string }
      | undefined;

    const message = data?.error || data?.detail;
    if (
      result.error.status === 401 ||
      result.error.status === 403
    ) {
      if (
        !publicAuthPaths.has(requestUrl) &&
        (data?.code === "device_blocked" || message?.toLowerCase().includes("blocked"))
      ) {
        setAuthNotice(message || "This device has been blocked by the administrator.");
        clearAuthSession();
        window.location.href = "/auth";
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthHandling,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    "Auth",
    "User",
    "Device",
    "DeviceSummary",
    "Alert",
    "AlertSummary",
    "MonitoringActivity",
    "MonitoringDashboard",
    "MonitoringReport",
    "SecurityBlock",
    "AuditLog",
  ],
  endpoints: () => ({}),
});
