import RUL from "./pages/RUL.jsx";
import Login from "./pages/Login.jsx";
import Engine from "./pages/Engine.jsx";
import Layout from "./components/Layout.jsx";
import Anomalies from "./pages/Anomalies.jsx";
import { Reports } from "./pages/Reports.jsx";
import Vibration from "./pages/Vibration.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import { Generator } from "./pages/Generator.jsx";
import { Mains } from "./pages/Mains.jsx";
import AlarmsBackup from "./pages/AlarmsBackup.jsx";
import Alarms from "./pages/Alarms.jsx";

import "./index.css";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "/node_modules/react-resizable/css/styles.css";
import "/node_modules/react-grid-layout/css/styles.css";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
          }>
          {/* <Route path="testchart" element={<TestChart />} /> */}
          <Route path="engine" element={<Engine />} />
          <Route path="generator" element={<Generator />} />
          <Route path="mains" element={<Mains />} />
          <Route path="reports" element={<Reports />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="alarms-backup" element={<AlarmsBackup />} />
          <Route path="alarms" element={<Alarms />} />
          <Route path="predictive-maintenance" element={<Maintenance />} />
          <Route path="rul" element={<RUL />} />
          {/* <Route path="vibration" element={<Vibration />} /> */}
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
