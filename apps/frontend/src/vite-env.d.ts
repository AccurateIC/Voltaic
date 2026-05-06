/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_RUL_API?: string;
  readonly VITE_PDM_API?: string;
  readonly VITE_ANOMALY_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
