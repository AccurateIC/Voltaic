import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Login from "./pages/Login.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import Engine from "./pages/Engine.jsx";
import { Generator } from "./pages/Generator.jsx";
import { Reports } from "./pages/Reports.jsx";
import { Maintenance } from "./pages/Maintenance.jsx";
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import Alarms from "./pages/Alarms";
import Anomalies from "./pages/Anomalies.jsx";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
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
            <Route path="reports" element={<Reports />} />
            <Route path="anomalies" element={<Anomalies />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="maintenance" element={<Maintenance />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
