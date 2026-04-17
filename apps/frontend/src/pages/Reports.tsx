// src/pages/Reports.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AllAnomaliesCount } from "../components/charts/reports/AllAnomaliesCount";
import { AnomaliesByProperty } from "../components/charts/reports/AnomaliesByProperty";
import { PDMNotificationStatistics } from "../components/charts/reports/PDMNotificationStatistics";
import { DateTimeUnit } from "luxon";
import { RulChart } from "../components/charts/RulTrendChart";
import { RulInputData, RulPrediction } from "../types/rul.types";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { GenericPropertyStatisticsBarChart } from "../components/charts/reports/GenericPropertyStatisticsBarChart";
import { GenericAnimatedModal } from "../components/GenericAnimatedModal";
import { tuyau } from "../lib/Tuyau";
import { toast } from "sonner";
import { GensetPropertyName } from "../types/gensetProperty.types";
import { useQuery } from "@tanstack/react-query";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";

// 1. Static Definitions outside component to prevent re-creation
const PROPERTIES: { propertyName: GensetPropertyName; chartTitle: string }[] = [
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

const STATIC_CHARTS = [
  { key: "anomaliesCount", title: "Anomalies Count" },
  { key: "anomaliesByProperty", title: "Anomalies by Property" },
  { key: "pdm", title: "PDM Notifications" },
  { key: "rul", title: "Health Index Deterioration" },
] as const;

const ALL_CHART_KEYS = [...STATIC_CHARTS.map((c) => c.key), ...PROPERTIES.map((p) => p.propertyName)];
const TIME_RANGE_OPTIONS: Array<{ value: DateTimeUnit; label: string }> = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];
const CHART_LABELS: Record<string, string> = {
  ...Object.fromEntries(STATIC_CHARTS.map((chart) => [chart.key, chart.title])),
  ...Object.fromEntries(PROPERTIES.map((prop) => [prop.propertyName, prop.chartTitle])),
};

export const Reports = () => {
  const { getRulPrediction } = useRulPrediction();
  const lastSentUserRef = useRef<string | null>(null);

  const {
    data: rulInputData,
    isLoading: isRulDataLoading,
    error: rulDataError,
  } = useQuery<Record<string, RulInputData[]>>({
    queryKey: ["rul-data"],
    queryFn: async () => {
      const res = await fetch("/data/rulData.json");
      if (!res.ok) {
        throw new Error("Failed to load RUL data");
      }
      return (await res.json()) as Record<string, RulInputData[]>;
    },
    staleTime: Infinity,
  });

  const { data: filteredHealthIndexData = [], isLoading: isHealthIndexLoading } = useQuery<
    Array<{ Time_Hours: number; Predicted_Health_Index: number }>
  >({
    queryKey: ["filtered-health-index"],
    queryFn: async () => {
      const res = await fetch("/data/filteredHealthIndexData.json");
      if (!res.ok) throw new Error("Failed to load health index trend data");
      return (await res.json()) as Array<{ Time_Hours: number; Predicted_Health_Index: number }>;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Auth Query
  const {
    data: loggedInUserData,
    error: loggedInUserError,
    isLoading,
  } = useQuery({
    queryKey: ["logged-in-user"],
    queryFn: () => tuyau.auth.getLoggedInUser.$get().unwrap(),
    staleTime: Infinity,
  });

  // State
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("month");
  const [rulPred, setRulPred] = useState<RulPrediction[]>([]);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(ALL_CHART_KEYS);
  const [modalChartKey, setModalChartKey] = useState<string | null>(null);

  const loggedInEmail = loggedInUserData?.email;

  // Optimized RUL Fetching
  useEffect(() => {
    if (!loggedInEmail || !rulInputData?.[loggedInEmail]) return;

    if (lastSentUserRef.current === loggedInEmail) return;
    lastSentUserRef.current = loggedInEmail;

    const userDataArray = rulInputData[loggedInEmail];
    const entry = userDataArray[0];

    if (!entry) return;

    const newEntry = {
      email: loggedInEmail,
      Time_Hours: entry.Time_Hours,
      RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
      Oil_Pressure: entry.Oil_Pressure,
      Power_Output_kW: entry.Power_Output_kW,
      Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption,
    } as any;

    getRulPrediction.mutate(newEntry, {
      onSuccess: (data) => setRulPred(data?.Future_Predictions || []),
      onError: () => {
        toast.error("Failed to get RUL prediction");
      },
    });
  }, [loggedInEmail, rulInputData]);

  const renderGraphCard = useCallback(
    (content: React.ReactNode, key: string) => (
      <div
        key={key}
        className="aspect-video bg-base-200 cursor-pointer hover:shadow-lg transition-all rounded-lg overflow-hidden border border-base-content/5 shadow-sm"
        onClick={() => setModalChartKey(key)}
      >
        {content}
      </div>
    ),
    []
  );

  const renderChartByKey = useCallback(
    (key: string): React.ReactNode => {
      switch (key) {
        case "anomaliesCount":
          return <AllAnomaliesCount />;
        case "anomaliesByProperty":
          return <AnomaliesByProperty timeDuration={timeDuration} />;
        case "pdm":
          return <PDMNotificationStatistics timeDuration={timeDuration} />;
        case "rul":
          return (
            <RulChart
              currentRulPoint={rulPred}
              simulatedRulPoint={[]}
              filteredHealthIndexData={filteredHealthIndexData}
              isHealthIndexLoading={isHealthIndexLoading}
            />
          );
        default: {
          const prop = PROPERTIES.find((p) => p.propertyName === key);
          if (!prop) return null;
          return (
            <GenericPropertyStatisticsBarChart
              timeDuration={timeDuration}
              propertyName={prop.propertyName}
              chartTitle={prop.chartTitle}
            />
          );
        }
      }
    },
    [timeDuration, rulPred, filteredHealthIndexData, isHealthIndexLoading]
  );

  if (loggedInUserError) return <div className="p-10">Error loading user session.</div>;
  if (rulDataError) return <div className="p-10">Failed to load RUL data.</div>;
  if (isLoading || isRulDataLoading || !rulInputData || Object.keys(rulInputData).length === 0) {
    // We do NOT block the page anymore, individual property charts handle their own loading states
  }

  return (
    <div className="flex flex-col h-full w-full gap-3 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl md:text-2xl font-semibold leading-tight">Reports</h1>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 rounded-box px-2 py-1 bg-base-100/70 border border-base-content/10">
            {/* <div className="flex items-center gap-1 text-primary">
              <FaFilter size={13} />
              <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
            </div> */}
            <span className="text-sm font-medium whitespace-nowrap text-base-content/80">Time Range</span>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-sm btn-outline min-w-[112px] justify-between bg-base-100 normal-case font-medium"
              >
                {TIME_RANGE_OPTIONS.find((option) => option.value === timeDuration)?.label ?? "Month"}
                <span className="text-xs opacity-70">▼</span>
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-1 mt-1 shadow-xl bg-base-100 rounded-box w-40 z-[70]">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={timeDuration === option.value ? "active" : ""}
                      onClick={() => setTimeDuration(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-box px-2 py-1 bg-base-100/70 border border-base-content/10">
            <span className="text-sm font-medium whitespace-nowrap text-base-content/80">Charts</span>
            <SelectAllCheckboxPopup<string>
              trigger={
                <div tabIndex={0} className="select select-bordered select-sm min-w-[142px] bg-base-100 flex items-center cursor-pointer">
                  {selectedCharts.length === ALL_CHART_KEYS.length ? "All Charts" : `${selectedCharts.length} Selected`}
                </div>
              }
              widthClassName="w-[min(90vw,24rem)] max-w-[24rem]"
              selectAllChecked={selectedCharts.length === ALL_CHART_KEYS.length}
              onToggleSelectAll={(checked) => setSelectedCharts(checked ? ALL_CHART_KEYS : [])}
              options={ALL_CHART_KEYS.map((key) => ({
                value: key,
                label: CHART_LABELS[key] ?? key,
              }))}
              getOptionChecked={(value) => selectedCharts.includes(value)}
              onToggleOption={(value, checked) =>
                setSelectedCharts((prev) =>
                  checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((k) => k !== value)
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedCharts.includes("anomaliesCount") &&
          modalChartKey !== "anomaliesCount" &&
          renderGraphCard(renderChartByKey("anomaliesCount"), "anomaliesCount")}

        {selectedCharts.includes("anomaliesByProperty") &&
          modalChartKey !== "anomaliesByProperty" &&
          renderGraphCard(renderChartByKey("anomaliesByProperty"), "anomaliesByProperty")}

        {selectedCharts.includes("pdm") && modalChartKey !== "pdm" && renderGraphCard(renderChartByKey("pdm"), "pdm")}

        {selectedCharts.includes("rul") && modalChartKey !== "rul" && renderGraphCard(renderChartByKey("rul"), "rul")}

        {PROPERTIES.map(
          (prop) =>
            selectedCharts.includes(prop.propertyName) &&
            modalChartKey !== prop.propertyName &&
            renderGraphCard(renderChartByKey(prop.propertyName), prop.propertyName)
        )}
      </div>

      <GenericAnimatedModal isOpen={modalChartKey !== null} onClose={() => setModalChartKey(null)}>
        <div className="w-full h-[80vh]">{modalChartKey ? renderChartByKey(modalChartKey) : null}</div>
      </GenericAnimatedModal>
    </div>
  );
};
