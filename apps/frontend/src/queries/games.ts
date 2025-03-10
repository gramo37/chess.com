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
  }),
});

export const { useRefreshTokenQuery } = gameAPI;
