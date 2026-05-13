import { apiSlice } from "./ApiSlice";
import type { SecurityBlock } from "../types/netguard";

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
  }),
});

export const {
  useGetSecurityBlocksQuery,
  useGetSecurityBlockByIdQuery,
  useCreateSecurityBlockMutation,
  useUnblockSecurityBlockMutation,
} = securityApi;
