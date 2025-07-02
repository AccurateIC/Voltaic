// src/pages/Reports.tsx
import { useState } from "react";
import { AllAnomaliesCount } from "../components/charts/reports/AllAnomaliesCount";
import { AnomaliesByProperty } from "../components/charts/reports/AnomaliesByProperty";
import { PDMNotificationStatistics } from "../components/charts/reports/PDMNotificationStatistics";
import { DateTimeUnit } from "luxon";
import { RulChart } from "../components/charts/RulTrendChart";
import { RulPrediction } from "../types/rul.types";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { rulInputData } from "../components/rulData";
import { useAuth } from "../hooks/useAuth";
import { GenericPropertyStatisticsBarChart } from "../components/charts/reports/GenericPropertyStatisticsBarChart";
import { GenericAnimatedModal } from "../components/GenericAnimatedModal";
import React from "react";
import { FaFilter } from "react-icons/fa6";

export const Reports = () => {
  // hooks
  const { getRulPrediction } = useRulPrediction();
  const { getLoggedInUser } = useAuth();

  const loggedInUser = getLoggedInUser?.data;
  const loggedInEmail = loggedInUser?.email;

  //state
  const [count, setCount] = useState(0);
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("week");

  const [rulPred, setRulPred] = useState<RulPrediction[]>([]);
  const [modalContent, setModalContent] = useState<{ component: React.ReactNode; title?: string } | null>(null);

  const openInModal = (component: React.ReactNode) => {
    setModalContent({ component });
  };

  const renderGraphCard = (content: React.ReactNode, key?: string | number) => (
    <div
      key={key}
      className="aspect-4/3 bg-base-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => openInModal(content)}>
      {content}
    </div>
  );

  const properties = [
    { propertyName: "engSpeedDisplay", chartTitle: "Engine Speed (RPM)" },
    { propertyName: "engOilPress", chartTitle: "Engine Oil Pressure (bar)" },
    { propertyName: "engFuelLevelUnits", chartTitle: "Engine Fuel Level (L)" },
    { propertyName: "genL1Volts", chartTitle: "Generator Phase 1 Voltage (volts)" },
    { propertyName: "genL2Volts", chartTitle: "Generator Phase 2 Voltage (volts)" },
    { propertyName: "genL3Volts", chartTitle: "Generator Phase 3 Voltage (volts)" },
    { propertyName: "mainsL1Volts", chartTitle: "Mains Phase 1 Voltage (volts)" },
    { propertyName: "mainsL2Volts", chartTitle: "Mains Phase 2 Voltage (volts)" },
    { propertyName: "mainsL3Volts", chartTitle: "Mains Phase 3 Voltage (volts)" },
  ];
  const staticCharts = [
    { key: "anomaliesCount", title: "Anomalies Count" },
    { key: "anomaliesByProperty", title: "Anomalies by Property" },
    { key: "pdm", title: "PDM Notifications" },
    { key: "rul", title: "Health Index Deterioration" },
  ] as const;

  const allChartKeys = [...staticCharts.map((c) => c.key), ...properties.map((p) => p.propertyName)];

  const [selectedCharts, setSelectedCharts] = useState<string[]>(allChartKeys);

  // fetch rul prediction data
  const fetchRulPrediction = async () => {
    try {
      // Check if user email exists and has data
      if (!loggedInEmail || !rulInputData[loggedInEmail]) {
        console.log("Waiting for user data...");
        return;
      }

      const userDataArray = rulInputData[loggedInEmail];
      // Use the length of the user's specific data array
      const entry = userDataArray[count % userDataArray.length];

      if (!entry) {
        console.error("No entry found for current count");
        return;
      }

      const newEntry = {
        Time_Hours: entry.Time_Hours,
        RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
        Oil_Pressure: entry.Oil_Pressure,
        Power_Output_kW: entry.Power_Output_kW,
        Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption,
      };

      getRulPrediction.mutate(newEntry, {
        onSuccess: (data) => {
          console.log("RUL data fetched successfully:", data);
          setRulPred(data?.Future_Predictions);
          setCount((prevCount) => (prevCount + 1) % userDataArray.length);
        },
        onError: (error) => {
          console.error("Error fetching RUL data:", error);
        },
      });
    } catch (err) {
      console.error("Error fetching RUL data:", error);
    }
  };

  const TimeRangeSelector = ({ value, onChange }) => {
    const options = ["year", "month", "week"];

    return (
      <div className="flex flex-row items-center gap-2">
        <label className="text-md text-base-content">Time Range:</label>
        <div className="dropdown dropdown-start">
          <div tabIndex={0} role="button" className="btn btn-m bg-base-100 px-10 w-full items-center justify-between">
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </div>

          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 w-full rounded-box z-10">
            {options.map((option) => (
              <li key={option} className="hover:bg-base-200 rounded w-full">
                <a onClick={() => onChange(option)} className="block px-4 py-2 cursor-pointer text-m">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const SelectChartsDropdown = () => {
    const allSelected = selectedCharts.length === allChartKeys.length;
    const noneSelected = selectedCharts.length === 0;

    const label = allSelected
      ? "All Charts Selected"
      : noneSelected
      ? "Select Charts"
      : selectedCharts.length <= 2
      ? [...staticCharts.map((c) => ({ key: c.key, title: c.title })), ...properties]
          .filter((c) => selectedCharts.includes("key" in c ? c.key : c.propertyName))
          .map((c) => ("title" in c ? c.title : c.chartTitle))
          .join(", ")
      : `${selectedCharts.length} Selected`;

    return (
      <>
        <label className="label text-md text-base-content">Select Charts</label>
        <div className="form-control">
          <div className="dropdown dropdown-start">
            <label tabIndex={0} className="btn btn-sm w-full justify-between p-5 px-10">
              {label}
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.25 7.25L10 12.25L14.75 7.25H5.25Z" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu flex flex-row w-80 bg-base-100 shadow rounded-box h-80 overflow-y-scroll p-2 z-10">
              <li className="flex flex-row w-full items-center gap-2 cursor-pointer">
                <label className="w-full">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={() => setSelectedCharts(allSelected ? [] : allChartKeys)}
                  />
                  <span className="font-semibold w-full">Select All</span>
                </label>
              </li>
              {staticCharts.map((c) => (
                <li key={c.key} className="w-full">
                  <label className="flex flex-row w-full items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedCharts.includes(c.key)}
                      onChange={(e) =>
                        setSelectedCharts((prev) => (e.target.checked ? [...prev, c.key] : prev.filter((k) => k !== c.key)))
                      }
                    />
                    <span className="w-full">{c.title}</span>
                  </label>
                </li>
              ))}
              {properties.map((p) => (
                <li key={p.propertyName} className="w-full">
                  <label className="flex flex-row w-full items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedCharts.includes(p.propertyName)}
                      onChange={(e) =>
                        setSelectedCharts((prev) =>
                          e.target.checked ? [...prev, p.propertyName] : prev.filter((k) => k !== p.propertyName)
                        )
                      }
                    />
                    <span>{p.chartTitle}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:3333/reports/generateDummy?timeDuration=${timeDuration}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g., "Asia/Kolkata"
        },
      });
      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `neurogen.pdf`); // to download the file
      document.body.appendChild(link);
      link.click(); //start download
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Failed to export report. Please try again.");
    }
  };

  console.log("timeDuration", timeDuration);
  return (
    <div>
      <div className="p-2">
        <h1 className="text-2xl">Reports</h1>

        <div className="flex items-center justify-between mt-2">
          <div className="text-xl flex items-center gap-4">
            <FaFilter size={22} className="ml-2" />
            <TimeRangeSelector value={timeDuration} onChange={setTimeDuration} />
            <SelectChartsDropdown />
          </div>

          <button className="btn" onClick={handleExport}>
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 h-full">
        {/* Static Charts */}
        {selectedCharts.includes("anomaliesCount") && renderGraphCard(<AllAnomaliesCount />, "anomaliesCount")}
        {selectedCharts.includes("anomaliesByProperty") &&
          renderGraphCard(<AnomaliesByProperty timeDuration={timeDuration} />, "anomaliesByProperty")}
        {selectedCharts.includes("pdm") && renderGraphCard(<PDMNotificationStatistics timeDuration={timeDuration} />, "pdm")}
        {selectedCharts.includes("rul") &&
          renderGraphCard(<RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />, "rul")}

        {/* All Properties Statistics */}
        {properties.map(
          (property) =>
            selectedCharts.includes(property.propertyName) &&
            renderGraphCard(
              <GenericPropertyStatisticsBarChart
                timeDuration={timeDuration}
                propertyName={property.propertyName}
                chartTitle={property.chartTitle}
              />
            )
        )}
      </div>
      {/* Modal */}
      <GenericAnimatedModal isOpen={modalContent !== null} onClose={() => setModalContent(null)}>
        {modalContent?.component}
      </GenericAnimatedModal>
    </div>
  );
};
