// apps/backend/app/config/extern.ts
// ML Server URL configuration — reads from env vars set in .env
// Mirrors the frontend src/config/extern.ts pattern but uses process.env instead of import.meta.env

import env from "#start/env";

/**
 * External ML module server URLs.
 * These are the Flask/FastAPI servers run by the ML team.
 * Configure them in the backend .env file.
 */
export const Modules = {
  RUL: env.get("RUL_URL", "http://127.0.0.1:5000"),
  PDM: env.get("PDM_URL", "http://127.0.0.1:5010"),
  ANOMALY: env.get("ANOMALY_URL", "http://127.0.0.1:5011"),
};
