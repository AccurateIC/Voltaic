// src/main.jsx
import RUL from "./pages/RUL.js";
import Login from "./pages/Login";
import Engine from "./pages/Engine";
import Layout from "./components/Layout";
import AnomaliesOld from "./pages/AnomaliesOld";
import { LiveData } from "./pages/LiveData";
import Maintenance from "./pages/Maintenance";
import { Generator } from "./pages/Generator";
import { Mains } from "./pages/Mains";
import Alarms from "./pages/Alarms";
import Archive from "./pages/Archive";
import ProfilePage from "./pages/ProfilePage";

import "./index.css";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Anomalies } from "./pages/Anomalies";
import { Reports } from "./pages/Reports";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
