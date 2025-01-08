// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import TestChart from "./components/charts/TestChart.jsx";
import Engine from "./pages/Engine.jsx";
import { Generator } from "./pages/Generator.jsx";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { Reports } from "./pages/Reports.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="testchart" element={<TestChart />} />
          <Route path="engine" element={<Engine />} />
          <Route path="generator" element={<Generator />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
