// src/main.jsx
import RUL from "./pages/RUL.js";
import Login from "./pages/Login";
import Engine from "./pages/Engine";
import Layout from "./components/Layout.jsx";
import AnomaliesOld from "./pages/AnomaliesOld.jsx";
import { LiveData } from "./pages/LiveData.jsx";
import Maintenance from "./pages/Maintenance.js";
import { Generator } from "./pages/Generator.jsx";
import { Mains } from "./pages/Mains.jsx";
import Alarms from "./pages/Alarms.jsx";
import Archive from "./pages/Archive.js";
import ProfilePage from "./pages/ProfilePage.jsx";

import "./index.css";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Anomalies } from "./pages/Anomalies.js";
import { Reports } from "./pages/Reports.js";

const queryClient = new QueryClient({});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <Toaster richColors={true} />
        <Routes>
          <Route index element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="engine" element={<Engine />} />
            <Route path="generator" element={<Generator />} />
            <Route path="mains" element={<Mains />} />
            <Route path="live-data" element={<LiveData />} />
            <Route path="anomalies-old" element={<AnomaliesOld />} />
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
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
