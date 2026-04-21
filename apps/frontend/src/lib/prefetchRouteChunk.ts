/**
 * Prefetch route JS chunks on hover/focus. Uses the same dynamic imports as
 * React.lazy() in main.jsx so Vite reuses the same chunk and cache.
 */
const loaders: Record<string, () => Promise<unknown>> = {
  "/login": () => import("../pages/Login"),
  "/": () => import("../pages/Login"),
  "/engine": () => import("../pages/Engine"),
  "/generator": () => import("../pages/Generator.tsx"),
  "/mains": () => import("../pages/Mains.tsx"),
  "/live-data": () => import("../pages/LiveData.jsx"),
  "/anomalies-old": () => import("../pages/AnomaliesOld.jsx"),
  "/reports": () => import("../pages/Reports"),
  "/alarms": () => import("../pages/Alarms.jsx"),
  "/predictive-maintenance": () => import("../pages/Maintenance"),
  "/rul": () => import("../pages/RUL"),
  "/profile": () => import("../pages/ProfilePage.jsx"),
  "/archive": () => import("../pages/Archive"),
  "/anomalies": () => import("../pages/Anomalies"),
};

/**
 * Warm the chunk for a path (typically sidebar hover / focus).
 * Safe to call repeatedly; the browser caches the module graph.
 */
export function prefetchRouteChunk(pathname: string): void {
  const key = pathname.replace(/\/$/, "") || "/";
  const load = loaders[key];
  if (load) {
    void load();
  }
}
