import { apiSlice } from "./ApiSlice";
import type { AuditLog } from "../types/netguard";

interface AuditLogFilters {
  action?: string;
  user?: number;
  target_user?: number;
  ordering?: string;
}

const buildAuditLogParams = (filters?: AuditLogFilters | void) => {
  const params = new URLSearchParams();

  if (filters?.action) {
    params.set("action", filters.action);
  }
  if (filters?.user) {
    params.set("user", String(filters.user));
  }
  if (filters?.target_user) {
    params.set("target_user", String(filters.target_user));
  }
  if (filters?.ordering) {
    params.set("ordering", filters.ordering);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const auditLogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], AuditLogFilters | void>({
      query: (filters) => ({
        url: `audit-logs/${buildAuditLogParams(filters)}`,
        method: "GET",
      }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogApi;
