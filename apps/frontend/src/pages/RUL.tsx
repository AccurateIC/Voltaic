// src/features/RUL/pages/RUL.tsx
import { cn } from "../lib/Utils";
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import { RulChart } from "../components/charts/RulTrendChart";
import { UseMutationResult } from "@tanstack/react-query";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { useLoggedInUserQuery } from "../hooks/useLoggedInUserQuery";
import { useFilteredHealthIndexJsonQuery, useRulDataJsonQuery } from "../hooks/useRulStaticJsonQueries";
import { RulInputData, RulPrediction, RulResponse } from "../types/rul.types";
import { SimulationSidebar } from "../components/RUL/SimulationSidebar";
import { toast } from "sonner";
import Skeleton from "../components/Skeleton.jsx";

interface LoggedInUser {
  email?: string;
}

const fetchRulPrediction = async (
  rulInputData: Record<string, RulInputData[]>,
  loggedInUserData: LoggedInUser,
  getRulPrediction: UseMutationResult<RulResponse, Error, RulInputData, unknown>,
  setRulPredPoints: Dispatch<SetStateAction<RulPrediction[]>>,
  count: number,
  setCount: Dispatch<SetStateAction<number>>
) => {
  const loggedInUserEmail = loggedInUserData.email;

  try {
    if (!loggedInUserEmail || !rulInputData[loggedInUserEmail]) {
      return;
    }

    const userDataArray = rulInputData[loggedInUserEmail];

    if (!userDataArray || userDataArray.length === 0) {
      return;
    }

    const entry = userDataArray[count % userDataArray.length];

    if (!entry) {
      return;
    }

    const newEntry = {
      email: loggedInUserEmail,
      Time_Hours: entry.Time_Hours,
      RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
      Oil_Pressure: entry.Oil_Pressure,
      Power_Output_kW: entry.Power_Output_kW,
      Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption,
    } as RulInputData;

    getRulPrediction.mutate(newEntry, {
      onSuccess: (data) => {
        setRulPredPoints(data.Future_Predictions);
        setCount((prevCount) => (prevCount + 1) % userDataArray.length);
      },
      onError: () => {
        setRulPredPoints([]);
      },
    });
  } catch {
    setRulPredPoints([]);
  }
};

const RUL = () => {
  const { getRulPrediction, sendLoggedInUser } = useRulPrediction();
  const lastSentUserRef = useRef<string | null>(null);

  const {
    data: rulInputData,
    isLoading: isRulDataLoading,
    error: rulDataError,
  } = useRulDataJsonQuery();

  const { data: filteredHealthIndexData = [], isLoading: isHealthIndexLoading } = useFilteredHealthIndexJsonQuery();

  const {
    data: loggedInUserData,
    error: loggedInUserError,
    isLoading,
  } = useLoggedInUserQuery();

  const initialRulState = {
    Predicted_Health_Index: 0,
    Remaining_Useful_Life: 0,
    User: "",
    Time_Hours: 0,
  };

  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const countRef = useRef<number>(0);
  const [rulPredPoints, setRulPredPoints] = useState<RulPrediction[]>([initialRulState]);
  const [simulatedRul, setSimulatedRul] = useState<RulPrediction[]>([initialRulState]);
const [isChartExpanded, setIsChartExpanded] = useState<boolean>(false);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    if (!loggedInUserData || loggedInUserError || !loggedInUserData.email) return;
    if (lastSentUserRef.current === loggedInUserData.email) return;

    lastSentUserRef.current = loggedInUserData.email;
    sendLoggedInUser.mutate(loggedInUserData as any);
  }, [loggedInUserData, loggedInUserError, sendLoggedInUser]);

  if (loggedInUserError) {
    toast.error("Failed to fetch logged in user");
    return <div className="h-full w-full">Unauthorized</div>;
  }

  if (rulDataError) {
    toast.error("Failed to load RUL input data");
    return <div className="h-full w-full">Failed to load RUL data</div>;
  }

  const primaryRulPoint = rulPredPoints?.[0];
  const remainingHours =
    primaryRulPoint?.Remaining_Useful_Life != null
      ? Math.round(Number(primaryRulPoint.Remaining_Useful_Life))
      : null;
  const predictedHealthIndex =
    primaryRulPoint?.Predicted_Health_Index != null ? Number(primaryRulPoint.Predicted_Health_Index) : null;

  return (
    <div className="flex flex-col h-full w-full gap-3 overflow-x-hidden px-4 py-4 md:px-6 md:py-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-xl md:text-2xl font-semibold leading-tight">
          Remaining Useful Life
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            className="btn btn-primary btn-sm md:btn-md flex-1 sm:flex-none"
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
          >
            {isSimulatorOpen ? "Close Simulator" : "Open Simulator"}
          </button>

          <button
            onClick={() =>
              loggedInUserData &&
              rulInputData &&
              fetchRulPrediction(
                rulInputData,
                loggedInUserData,
                getRulPrediction,
                setRulPredPoints,
                count,
                setCount
              )
            }
            className={cn("btn btn-primary btn-sm md:btn-md flex-1 sm:flex-none flex justify-center")}
            disabled={getRulPrediction.isPending}
          >
            Calculate RUL
            {getRulPrediction.isPending && <span className="loading loading-spinner"></span>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-4/5">
        <div
          className={cn(
            "w-full transition-all duration-300 ease-in-out",
            isSimulatorOpen ? "lg:w-2/3" : "w-full"
          )}
        >
       <div
  className="h-[300px] md:h-full lg:cursor-default cursor-pointer relative"
  onClick={() => window.innerWidth < 1024 && setIsChartExpanded(true)}
>
  {/* Tap hint badge — only on mobile/tablet */}
  <div className="absolute top-2 right-2 z-10 lg:hidden">
  
  </div>

  {(isLoading || isRulDataLoading || !rulInputData || Object.keys(rulInputData).length === 0 || getRulPrediction.isPending || rulPredPoints.length === 0) ? (
     <Skeleton type="chart" />
  ) : (
     <RulChart
       currentRulPoint={rulPredPoints}
       simulatedRulPoint={simulatedRul}
       filteredHealthIndexData={filteredHealthIndexData}
       isHealthIndexLoading={isHealthIndexLoading}
     />
  )}
</div>

{/* Fullscreen modal — mobile/tablet only */}
{isChartExpanded && (
  <div className="fixed inset-0 z-50 bg-base-100 flex flex-col lg:hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10 shrink-0">
      <span className="font-semibold text-base">Health Index Deterioration</span>
      <button
        className="btn btn-sm btn-ghost"
        onClick={() => setIsChartExpanded(false)}
      >
        ✕ Close
      </button>
    </div>
    <div className="flex-1 min-h-0 p-2">
      <RulChart
        currentRulPoint={rulPredPoints}
        simulatedRulPoint={simulatedRul}
        filteredHealthIndexData={filteredHealthIndexData}
        isHealthIndexLoading={isHealthIndexLoading}
      />
    </div>
  </div>
)}
        </div>

        <div className="w-full lg:w-auto">
          {isSimulatorOpen && (
            <div className="flex items-center h-full justify-center transition-all duration-300">
              <SimulationSidebar setSimulatedRul={setSimulatedRul} simulatedRul={simulatedRul} />
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-2">
        <div
          className={cn(
            "flex flex-col bg-base-200 text-base-content items-center justify-center w-full sm:w-2/3 lg:w-1/3 p-4",
            "rounded-box shadow-md border border-base-content/5"
          )}
        >
          {(isLoading || isRulDataLoading || !rulInputData || Object.keys(rulInputData).length === 0 || getRulPrediction.isPending || rulPredPoints.length === 0) ? (
            <Skeleton type="stat" />
          ) : (
             <>
              <div className="text-sm md:text-base font-medium text-base-content/70">
                 Remaining Useful Life
               </div>
              <div className="text-3xl md:text-5xl font-bold mt-1 leading-none">
                {remainingHours != null ? remainingHours : "N/A"}
                <span className="text-base md:text-2xl font-normal ml-1 text-base-content/70">hours</span>
               </div>
              {predictedHealthIndex != null && !Number.isNaN(predictedHealthIndex) && (
                <div className="mt-2 text-sm text-base-content/60">
                  Predicted Health Index:{" "}
                  <span className="font-semibold text-base-content/80">{predictedHealthIndex.toFixed(3)}</span>
                </div>
              )}
             </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RUL;