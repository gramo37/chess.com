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
    getGameStatus: builder.query({
      query: (gameId) => ({
        url: "/getGameStatus",
        method: "GET",
        baseURLOveride: BACKEND_URL,
        params: {
          gameId
        }
      })
    })
  }),
});

export const {
  useRefreshTokenQuery,
  useGetActiveUsersQuery,
  useGetAllUsersQuery,
  useGetGameStatusQuery
} = gameAPI;
