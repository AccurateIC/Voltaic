import "./index.css";
import "./chart/register";
import { Toaster } from "sonner";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Skeleton from "./components/Skeleton";
import { RealtimeProvider } from "./providers/RealtimeProvider";
// ✅ 6.1 — lazy imports (pages load only when navigated to)
const Login = lazy(() => import("./pages/Login"));
const Engine = lazy(() => import("./pages/Engine"));
const Layout = lazy(() => import("./components/Layout.jsx"));
const LiveData = lazy(() => import("./pages/LiveData.jsx").then(m => ({ default: m.LiveData })));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Generator = lazy(() => import("./pages/Generator.tsx").then(m => ({ default: m.Generator })));
const Mains = lazy(() => import("./pages/Mains.tsx").then(m => ({ default: m.Mains })));
const Alarms = lazy(() => import("./pages/Alarms.jsx"));
const Archive = lazy(() => import("./pages/Archive"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const Anomalies = lazy(() => import("./pages/Anomalies.jsx"));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const RUL = lazy(() => import("./pages/RUL"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Fresh by default; hooks that should cache longer set `staleTime` explicitly (e.g. genset properties, session user).
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
 <QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <Toaster richColors={true} />
    <Suspense fallback={<Skeleton type="card" />}>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <RealtimeProvider>   {/* ✅ only mounts when authenticated */}
              <Layout />
            </RealtimeProvider>
          </ProtectedRoute>
        }>
              <Route path="engine" element={<Engine />} />
              <Route path="generator" element={<Generator />} />
              <Route path="mains" element={<Mains />} />
              <Route path="live-data" element={<LiveData />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alarms" element={<Alarms />} />
              <Route path="predictive-maintenance" element={<Maintenance />} />
              <Route path="rul" element={<RUL />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="archive" element={<Archive />} />
              <Route path="anomalies" element={<Anomalies />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </Suspense>
     </BrowserRouter>
  </QueryClientProvider>
);