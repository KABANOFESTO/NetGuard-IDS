import { apiSlice } from "./ApiSlice";
import type {
  MonitoringDashboard,
  MonitoringReport,
  NetworkActivity,
} from "../types/netguard";

interface ActivityFilters {
  is_suspicious?: boolean;
  activity_type?: string;
  outcome?: string;
}

const buildActivityParams = (filters?: ActivityFilters | void) => {
  const params = new URLSearchParams();

  if (typeof filters?.is_suspicious === "boolean") {
    params.set("is_suspicious", String(filters.is_suspicious));
  }
  if (filters?.activity_type) {
    params.set("activity_type", filters.activity_type);
  }
  if (filters?.outcome) {
    params.set("outcome", filters.outcome);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const monitoringApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNetworkActivities: builder.query<NetworkActivity[], ActivityFilters | void>({
      query: (filters) => ({
        url: `monitoring/activities/${buildActivityParams(filters)}`,
        method: "GET",
      }),
      providesTags: ["MonitoringActivity"],
    }),
    createNetworkActivity: builder.mutation<NetworkActivity, Partial<NetworkActivity>>({
      query: (data) => ({
        url: "monitoring/activities/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MonitoringActivity", "MonitoringDashboard", "MonitoringReport", "Alert"],
    }),
    getMonitoringDashboard: builder.query<MonitoringDashboard, void>({
      query: () => ({
        url: "monitoring/dashboard/",
        method: "GET",
      }),
      providesTags: ["MonitoringDashboard"],
    }),
    getMonitoringReport: builder.query<MonitoringReport, number | void>({
      query: (days = 7) => ({
        url: `monitoring/reports/?days=${days}`,
        method: "GET",
      }),
      providesTags: ["MonitoringReport"],
    }),
  }),
});

export const {
  useGetNetworkActivitiesQuery,
  useCreateNetworkActivityMutation,
  useGetMonitoringDashboardQuery,
  useGetMonitoringReportQuery,
} = monitoringApi;
