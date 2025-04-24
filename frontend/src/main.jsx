import { scan } from "react-scan"; // must be imported before React and React DOM
import RUL from "./features/RUL/pages/RUL.jsx";
import Login from "./pages/Login.jsx";
import Engine from "./pages/Engine.jsx";
import Layout from "./components/Layout.jsx";
import Anomalies from "./pages/Anomalies.jsx";
import { LiveData } from "./pages/LiveData.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import { Generator } from "./pages/Generator.jsx";
import { Mains } from "./pages/Mains.jsx";
import AlarmsBackup from "./pages/AlarmsBackup.jsx";
import Reports from "./pages/Reports.jsx";
import Alarms from "./pages/Alarms.jsx";
import Archive from "./pages/Archive.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import "./index.css";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "/node_modules/react-resizable/css/styles.css";
import "/node_modules/react-grid-layout/css/styles.css";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// react-scan: automatically detects performance issues in your React app
// see: https://react-scan.com/
scan({ enabled: true }); // DISABLE IN PRODUCTION

const queryClient = new QueryClient({});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster richColors={true} />
        <Routes>
          <Route index element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
            <Route path="engine" element={<Engine />} />
            <Route path="generator" element={<Generator />} />
            <Route path="mains" element={<Mains />} />
            <Route path="live-data" element={<LiveData />} />
            <Route path="anomalies" element={<Anomalies />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alarms-backup" element={<AlarmsBackup />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="predictive-maintenance" element={<Maintenance />} />
            <Route path="rul" element={<RUL />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="archive" element={<Archive />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
