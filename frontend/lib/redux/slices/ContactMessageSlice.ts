import { apiSlice } from "./ApiSlice";

const contactMessageApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        sendContactMessage: builder.mutation({
            query: (data) => ({
                url: "contact",
                method: "POST",
                body: data,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
        getAllContactMessages: builder.query({
            query: () => ({
                url: "admin/messages",
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
        updateContactMessage: builder.mutation({
            query: ({ id, data }) => ({
                url: `admin/messages/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
        deleteContactMessage: builder.mutation({
            query: (id) => ({
                url: `admin/messages/${id}`,
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            }),
        }),
    }),
});

export const {
    useSendContactMessageMutation,
    useGetAllContactMessagesQuery,
    useUpdateContactMessageMutation,
    useDeleteContactMessageMutation,
} = contactMessageApi;