import { apiSlice } from "./ApiSlice";
import type {
  NetworkEdgeActionLog,
  NetworkEdgeActionRequest,
  NetworkEdgeHealth,
  NetworkEdgeProfile,
  SecurityBlock,
} from "../types/netguard";

const securityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityBlocks: builder.query<SecurityBlock[], boolean | void>({
      query: (active) => ({
        url:
          typeof active === "boolean"
            ? `security/blocks/?active=${String(active)}`
            : "security/blocks/",
        method: "GET",
      }),
      providesTags: ["SecurityBlock"],
    }),
    getSecurityBlockById: builder.query<SecurityBlock, number>({
      query: (id) => ({
        url: `security/blocks/${id}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "SecurityBlock", id }],
    }),
    createSecurityBlock: builder.mutation<SecurityBlock, Partial<SecurityBlock>>({
      query: (data) => ({
        url: "security/blocks/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SecurityBlock", "Device", "Auth"],
    }),
    unblockSecurityBlock: builder.mutation<{ message: string; unblocked_at: string }, number>({
      query: (id) => ({
        url: `security/blocks/${id}/unblock/`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        "SecurityBlock",
        "Device",
        "Auth",
        { type: "SecurityBlock", id },
      ],
    }),
    getNetworkEdgeProfiles: builder.query<NetworkEdgeProfile[], void>({
      query: () => ({
        url: "security/edge-profiles/",
        method: "GET",
      }),
      providesTags: ["NetworkEdgeProfile"],
    }),
    createNetworkEdgeProfile: builder.mutation<NetworkEdgeProfile, Partial<NetworkEdgeProfile>>({
      query: (data) => ({
        url: "security/edge-profiles/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["NetworkEdgeProfile"],
    }),
    updateNetworkEdgeProfile: builder.mutation<
      NetworkEdgeProfile,
      { id: number; data: Partial<NetworkEdgeProfile> }
    >({
      query: ({ id, data }) => ({
        url: `security/edge-profiles/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NetworkEdgeProfile"],
    }),
    deleteNetworkEdgeProfile: builder.mutation<{ detail?: string }, number>({
      query: (id) => ({
        url: `security/edge-profiles/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["NetworkEdgeProfile"],
    }),
    getNetworkEdgeActionLogs: builder.query<NetworkEdgeActionLog[], Record<string, string | number | boolean | undefined> | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters && typeof filters === "object") {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.set(key, String(value));
            }
          });
        }
        const queryString = params.toString();
        return {
          url: `security/edge-actions/logs/${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["NetworkEdgeActionLog"],
    }),
    executeNetworkEdgeAction: builder.mutation<
      {
        success: boolean;
        status_code: string;
        message: string;
        payload: Record<string, unknown>;
      },
      NetworkEdgeActionRequest
    >({
      query: (data) => ({
        url: "security/edge-actions/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["NetworkEdgeActionLog", "Device", "Auth"],
    }),
    getNetworkEdgeHealth: builder.query<NetworkEdgeHealth, void>({
      query: () => ({
        url: "security/edge-health/",
        method: "GET",
      }),
      providesTags: ["NetworkEdgeProfile"],
    }),
  }),
});

export const {
  useGetSecurityBlocksQuery,
  useGetSecurityBlockByIdQuery,
  useCreateSecurityBlockMutation,
  useUnblockSecurityBlockMutation,
  useGetNetworkEdgeProfilesQuery,
  useCreateNetworkEdgeProfileMutation,
  useUpdateNetworkEdgeProfileMutation,
  useDeleteNetworkEdgeProfileMutation,
  useGetNetworkEdgeActionLogsQuery,
  useExecuteNetworkEdgeActionMutation,
  useGetNetworkEdgeHealthQuery,
} = securityApi;
