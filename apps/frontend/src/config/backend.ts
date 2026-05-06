function requiredEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const BACKEND_BASE_URL = requiredEnv("VITE_BACKEND_URL");
