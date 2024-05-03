export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
export const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";
export const AUTH_URL = `${BACKEND_URL}/auth/refresh`;
export const LOGOUT_URL = `${BACKEND_URL}/auth/logout`;