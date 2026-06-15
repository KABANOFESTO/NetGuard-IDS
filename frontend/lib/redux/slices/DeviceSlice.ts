import { apiSlice } from "./ApiSlice";
import type { Device, DeviceSummary } from "../types/netguard";

interface DeviceFilters {
  status?: string;
  is_registered?: boolean;
  same_network?: boolean;
}

interface DeviceStatusPayload {
  id: number;
  status?: Device["status"];
  is_registered?: boolean;
  registration_notes?: string;
}

interface BlockDevicePayload {
  id: number;
  reason?: "intrusion" | "suspicious_activity" | "manual_block";
  notes?: string;
}

const buildDeviceParams = (filters?: DeviceFilters | void) => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (typeof filters?.is_registered === "boolean") {
    params.set("is_registered", String(filters.is_registered));
  }

  if (typeof filters?.same_network === "boolean") {
    params.set("same_network", String(filters.same_network));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const deviceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query<Device[], DeviceFilters | void>({
      query: (filters) => ({
        url: `devices/${buildDeviceParams(filters)}`,
        method: "GET",
      }),
      providesTags: ["Device"],
    }),
    getDeviceSummary: builder.query<DeviceSummary, DeviceFilters | void>({
      query: (filters) => ({
        url: `devices/summary/${buildDeviceParams(filters)}`,
        method: "GET",
      }),
      providesTags: ["DeviceSummary"],
    }),
    getDeviceById: builder.query<Device, number>({
      query: (id) => ({
        url: `devices/${id}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Device", id }],
    }),
    registerDevice: builder.mutation<Device, Partial<Device>>({
      query: (data) => ({
        url: "devices/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Device", "DeviceSummary"],
    }),
    updateDevice: builder.mutation<Device, { id: number; data: Partial<Device> }>({
      query: ({ id, data }) => ({
        url: `devices/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Device",
        "DeviceSummary",
        { type: "Device", id },
      ],
    }),
    updateDeviceStatus: builder.mutation<Device, DeviceStatusPayload>({
      query: ({ id, ...data }) => ({
        url: `devices/${id}/status/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Device",
        "DeviceSummary",
        { type: "Device", id },
      ],
    }),
    blockDevice: builder.mutation<{ message: string; block_id: number }, BlockDevicePayload>({
      query: ({ id, ...data }) => ({
        url: `devices/${id}/block/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Device",
        "DeviceSummary",
        "SecurityBlock",
        { type: "Device", id },
      ],
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useGetDeviceSummaryQuery,
  useGetDeviceByIdQuery,
  useRegisterDeviceMutation,
  useUpdateDeviceMutation,
  useUpdateDeviceStatusMutation,
  useBlockDeviceMutation,
} = deviceApi;
