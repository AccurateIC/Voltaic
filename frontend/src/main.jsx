// 

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
import { Reports } from "./pages/Reports.jsx";
import { Provider } from "react-redux"; // Import Provider from react-redux
import store from "./Redux/store.js"; // Import your Redux store
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

// Wrap the entire app with Redux Provider
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}> {/* Wrap with Redux Provider */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="testchart" element={<TestChart />} />
            <Route path="engine" element={<Engine />} />
            <Route path="generator" element={<Generator />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
