function requiredEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const Modules = {
  RUL: requiredEnv("VITE_RUL_API"),
  PDM: requiredEnv("VITE_PDM_API"),
  ANOMALY: requiredEnv("VITE_ANOMALY_API"),
};