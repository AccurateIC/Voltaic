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
import { Maintenance } from "./pages/Maintenance.jsx"; 
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import Alarms from "./pages/Alarms"; 
import Anamolies from "./pages/Anamolies.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
        <Route index element={<Login />} />
          <Route path="/" element={<Layout />}>
            
            {/* <Route path="testchart" element={<TestChart />} /> */}
            <Route path="engine" element={<Engine />} />
            <Route path="generator" element={<Generator />} />
            <Route path="reports" element={<Reports />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="anamolies" element={<Anamolies />} />
            {/* <Route path="maintenance" element={<Maintenance />} /> */}
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
