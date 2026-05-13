import { apiSlice } from "./ApiSlice";
import type { AlertSummary, IntrusionAlert } from "../types/netguard";

interface AlertFilters {
  status?: string;
  severity?: string;
  alert_type?: string;
  assigned_to?: number;
}

const buildAlertParams = (filters?: AlertFilters | void) => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.severity) {
    params.set("severity", filters.severity);
  }
  if (filters?.alert_type) {
    params.set("alert_type", filters.alert_type);
  }
  if (filters?.assigned_to) {
    params.set("assigned_to", String(filters.assigned_to));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const alertApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAlerts: builder.query<IntrusionAlert[], AlertFilters | void>({
      query: (filters) => ({
        url: `alerts/${buildAlertParams(filters)}`,
        method: "GET",
      }),
      providesTags: ["Alert"],
    }),
    getAlertSummary: builder.query<AlertSummary, void>({
      query: () => ({
        url: "alerts/summary/",
        method: "GET",
      }),
      providesTags: ["AlertSummary"],
    }),
    getAlertById: builder.query<IntrusionAlert, number>({
      query: (id) => ({
        url: `alerts/${id}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Alert", id }],
    }),
    createAlert: builder.mutation<IntrusionAlert, Partial<IntrusionAlert>>({
      query: (data) => ({
        url: "alerts/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Alert", "AlertSummary"],
    }),
    updateAlert: builder.mutation<IntrusionAlert, { id: number; data: Partial<IntrusionAlert> }>({
      query: ({ id, data }) => ({
        url: `alerts/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Alert",
        "AlertSummary",
        { type: "Alert", id },
      ],
    }),
  }),
});

export const {
  useGetAlertsQuery,
  useGetAlertSummaryQuery,
  useGetAlertByIdQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
} = alertApi;
