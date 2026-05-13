import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const normalizedBaseUrl = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${normalizedBaseUrl}/api/`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }

      return headers;
    },
  }),
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
