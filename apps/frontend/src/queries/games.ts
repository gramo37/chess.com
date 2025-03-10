import { BACKEND_URL } from "../constants/routes";
import { api } from "./api";

export const gameAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
        baseURLOveride: BACKEND_URL,
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "/all_users",
        method: "GET",
        baseURLOveride: BACKEND_URL,
      }),
    }),
    getActiveUsers: builder.query({
      query: () => ({
        url: "/active_users",
        method: "GET",
        baseURLOveride: BACKEND_URL,
      }),
    }),
  }),
});

export const {
  useRefreshTokenQuery,
  useGetActiveUsersQuery,
  useGetAllUsersQuery,
} = gameAPI;
