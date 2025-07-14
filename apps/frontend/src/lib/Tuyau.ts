// frontend/src/lib/Tuyau.ts
import { createTuyau } from "@tuyau/client";
import { api } from "backend/api";
import { superjson } from "@tuyau/superjson/plugin";
import { BACKEND_BASE_URL } from "../config/backend";

export const tuyau = createTuyau({
  api,
  baseUrl: BACKEND_BASE_URL,
  headers: { "timezone": Intl.DateTimeFormat().resolvedOptions().timeZone },
  credentials: "include", // TODO: does sending credentials in all requests result in failed requests
  plugins: [superjson()],
});
