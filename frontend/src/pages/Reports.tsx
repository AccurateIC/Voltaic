import { useState, useEffect, useMemo } from "react";
import { DateTimeUnit } from "luxon";

import { AllAnomaliesCount } from "../components/charts/reports/AllAnomaliesCount";
import { AnomaliesByProperty } from "../components/charts/reports/AnomaliesByProperty";
import { PDMNotificationStatistics } from "../components/charts/reports/PDMNotificationStatistics";
import { RulChart } from "../components/charts/RulTrendChart";
import { GenericPropertyStatisticsBarChart } from "../components/charts/reports/GenericPropertyStatisticsBarChart";

import { useRulPrediction } from "../hooks/useRulPrediction";
import { useAuth } from "../hooks/useAuth";
import { rulInputData } from "../components/rulData";
import { RulPrediction } from "../types/rul.types";

export const Reports = () => {
  const { getRulPrediction } = useRulPrediction();
  const { getLoggedInUser } = useAuth();

  const loggedInUser = getLoggedInUser?.data;
  const loggedInEmail = loggedInUser?.email;

  const [count, setCount] = useState(0);
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("week");
  const [rulPred, setRulPred] = useState<RulPrediction[]>([]);

  const propertyCharts = [
    { key: "engSpeedDisplay", title: "Engine Speed (RPM)" },
    { key: "engOilPress", title: "Engine Oil Pressure (bar)" },
    { key: "engFuelLevelUnits", title: "Engine Fuel Level (L)" },
    { key: "genL1Volts", title: "Generator Phase 1 Voltage (V)" },
    { key: "genL2Volts", title: "Generator Phase 2 Voltage (V)" },
    { key: "genL3Volts", title: "Generator Phase 3 Voltage (V)" },
    { key: "mainsL1Volts", title: "Mains Phase 1 Voltage (V)" },
    { key: "mainsL2Volts", title: "Mains Phase 2 Voltage (V)" },
    { key: "mainsL3Volts", title: "Mains Phase 3 Voltage (V)" },
  ] as const;

  const staticCharts = [
    { key: "anomaliesCount", title: "Anomalies Count" },
    { key: "anomaliesByProperty", title: "Anomalies by Property" },
    { key: "pdm", title: "PDM Notifications" },
    { key: "rul", title: "Health Index Deterioration" },
  ] as const;

  const allChartKeys = useMemo(() => [...staticCharts, ...propertyCharts].map((c) => c.key), []);

  const [selectedCharts, setSelectedCharts] = useState<string[]>(allChartKeys);

  const fetchRulPrediction = async () => {
    if (!loggedInEmail || !rulInputData[loggedInEmail]) return;
    const userDataArray = rulInputData[loggedInEmail];
    const entry = userDataArray[count % userDataArray.length];
    if (!entry) return;

    getRulPrediction.mutate(entry, {
      onSuccess: (data) => {
        setRulPred(data?.Future_Predictions);
        setCount((prev) => (prev + 1) % userDataArray.length);
      },
      onError: (err) => console.error("Error fetching RUL data:", err),
    });
  };

  useEffect(() => {
    fetchRulPrediction();
  }, []);

  const allSelected = selectedCharts.length === allChartKeys.length;
  const noneSelected = selectedCharts.length === 0;

  const dropdownLabel = useMemo(() => {
    if (allSelected) return "All Charts Selected";
    if (noneSelected) return "Select Charts";
    if (selectedCharts.length <= 2) {
      return [...staticCharts, ...propertyCharts]
        .filter((c) => selectedCharts.includes(c.key))
        .map((c) => c.title)
        .join(", ");
    }
    return `${selectedCharts.length} Selected`;
  }, [selectedCharts, allSelected, noneSelected]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 p-2">
        <h1 className="text-2xl">Reports</h1>

        <div className="form-control w-full max-w-xl px-4">
          <label className="label font-bold">Select Properties</label>

          <div className="dropdown dropdown-hover w-full">
            <label tabIndex={0} className="btn btn-sm w-full justify-between">
              {dropdownLabel}
              <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.25 7.25L10 12.25L14.75 7.25H5.25Z" />
              </svg>
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 bg-base-100 shadow rounded-box w-64 max-h-84 overflow-y-auto">
              <li>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={allSelected}
                    onChange={() => setSelectedCharts(allSelected ? [] : allChartKeys)}
                  />
                  <span className="font-semibold">Select All</span>
                </label>
              </li>

              {staticCharts.map((chart) => (
                <li key={chart.key}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedCharts.includes(chart.key)}
                      onChange={(e) =>
                        setSelectedCharts((prev) =>
                          e.target.checked ? [...prev, chart.key] : prev.filter((k) => k !== chart.key)
                        )
                      }
                    />
                    <span>{chart.title}</span>
                  </label>
                </li>
              ))}

              {propertyCharts.map((chart) => (
                <li key={chart.key}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedCharts.includes(chart.key)}
                      onChange={(e) =>
                        setSelectedCharts((prev) =>
                          e.target.checked ? [...prev, chart.key] : prev.filter((k) => k !== chart.key)
                        )
                      }
                    />
                    <span>{chart.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button className="btn">Export</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {selectedCharts.includes("anomaliesCount") && (
          <div className="aspect-4/3 bg-base-200" key="anomaliesCount">
            <AllAnomaliesCount />
          </div>
        )}

        {selectedCharts.includes("anomaliesByProperty") && (
          <div className="aspect-4/3 bg-base-200" key="anomaliesByProperty">
            <AnomaliesByProperty />
          </div>
        )}

        {selectedCharts.includes("pdm") && (
          <div className="aspect-4/3 bg-base-200" key="pdm">
            <PDMNotificationStatistics timeDuration={timeDuration} />
          </div>
        )}

        {selectedCharts.includes("rul") && (
          <div className="aspect-4/3 bg-base-200" key="rul">
            <RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />
          </div>
        )}

        {propertyCharts
          .filter((c) => selectedCharts.includes(c.key))
          .map((c) => (
            <div className="aspect-4/3 bg-base-200" key={c.key}>
              <GenericPropertyStatisticsBarChart timeDuration={timeDuration} propertyName={c.key} chartTitle={c.title} />
            </div>
          ))}
      </div>
    </div>
  );
};
