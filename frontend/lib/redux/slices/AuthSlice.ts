import { apiSlice } from "./ApiSlice";
import type { AuthResponse, AuthUser, NetworkAccessContext } from "../types/netguard";

interface LoginPayload {
  email: string;
  password: string;
  device_id?: number;
  mac_address?: string;
  ip_address?: string;
  device_name?: string;
  device_type?: string;
  operating_system?: string;
  registration_notes?: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: "Admin" | "Guest" | "Lecturer" | "Student";
  is_active?: boolean;
}

interface CreateUserPayload {
  username: string;
  email: string;
  role: "Admin" | "Guest" | "Lecturer" | "Student";
  is_active?: boolean;
}

interface UpdateUserPayload {
  id: number;
  data: Partial<AuthUser>;
}

interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
  confirm_password?: string;
}

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (data) => ({
        url: "auth/login/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthUser, RegisterPayload>({
      query: (data) => ({
        url: "auth/register/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    createUser: builder.mutation<
      { message: string; user_id?: number; email?: string },
      CreateUserPayload
    >({
      query: (data) => ({
        url: "auth/admin/users/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateProfile: builder.mutation<AuthUser, FormData | Record<string, unknown>>({
      query: (data) => ({
        url: "auth/update-profile/",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    forgotPassword: builder.mutation<{ message?: string; error?: string }, { email: string }>({
      query: (data) => ({
        url: "auth/forgot-password/",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<
      { message?: string; error?: string },
      ResetPasswordPayload
    >({
      query: (data) => ({
        url: "auth/reset-password/",
        method: "POST",
        body: data,
      }),
    }),
    getAllUsers: builder.query<AuthUser[], void>({
      query: () => ({
        url: "auth/users/",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<AuthUser, number>({
      query: (id) => ({
        url: `auth/users/${id}/`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    getMyDetails: builder.query<AuthUser, void | Record<string, never>>({
      query: () => ({
        url: "auth/me/",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    getAccessContext: builder.query<NetworkAccessContext, void | Record<string, never>>({
      query: () => ({
        url: "auth/access/",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    updateUser: builder.mutation<{ message?: string; user?: AuthUser } | AuthUser, UpdateUserPayload>({
      query: ({ id, data }) => ({
        url: `auth/admin/users/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => ["User", { type: "User", id }],
    }),
    deleteUser: builder.mutation<{ message: string; deleted_user_id?: number; deleted_user_email?: string }, number>({
      query: (id) => ({
        url: `auth/admin/users/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    toggleUserActive: builder.mutation<
      {
        message: string;
        user: AuthUser;
        previous_status: string;
        new_status: string;
      },
      number
    >({
      query: (id) => ({
        url: `auth/admin/users/${id}/toggle-active/`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => ["User", "Auth", { type: "User", id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRegisterMutation,
  useUpdateProfileMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetMyDetailsQuery,
  useGetAccessContextQuery,
  useLazyGetMyDetailsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserActiveMutation,
} = authApi;

export const useGetMyDetailsMutation = authApi.useLazyGetMyDetailsQuery;
