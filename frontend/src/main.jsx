import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";  
import Layout from "./components/Layout.jsx";
import Engine from "./pages/Engine.jsx";
import { Generator } from "./pages/Generator.jsx";
import { Reports } from "./pages/Reports.jsx";
import PredictiveMaintenance from "./pages/PredictiveMaintenance.jsx";
import GensetData from "./pages/GensetData.jsx";
import { Provider } from "react-redux";
import store from "./Redux/store.js";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import Alarms from "./pages/Alarms";
import Anamolies from "./pages/Anamolies.jsx";
import RUL from "./pages/RUL.jsx";
import { Mains } from "./pages/Mains.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route path="engine" element={<Engine />} />
            <Route path="generator" element={<Generator />} />
            <Route path="mains" element={<Mains />} />
            <Route path="reports" element={<Reports />} />
            <Route path="anamolies" element={<Anamolies />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="predictive-maintenance" element={<PredictiveMaintenance />} />
            <Route path="genset-data" element={<GensetData />} />
            <Route path="RUL" element={<RUL />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
