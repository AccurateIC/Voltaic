// src/features/RUL/pages/RUL.tsx
import { cn } from "../lib/Utils";
import { useState, useEffect } from "react";

import { RulChart } from "../components/charts/RulTrendChart";
import { rulInputData } from "../components/rulData";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { RulInputData, RulPrediction, RulResponse } from "../types/rul.types";
import { SimulationSidebar } from "../components/RUL/SimulationSidebar";
import { tuyau } from "../lib/Tuyau";
import { toast } from "sonner";
import User from "../../../backend/app/models/user";
import { UseMutationResult, useQuery } from "@tanstack/react-query";

const fetchRulPrediction = async (
  loggedInUserData: User,
  getRulPrediction: UseMutationResult<RulResponse, Error, RulInputData, unknown>,
  setRulPredPoints: React.Dispatch<React.SetStateAction<RulPrediction[]>>,
  count: number,
  setCount: React.Dispatch<React.SetStateAction<number>>
) => {
  const loggedInUserEmail = loggedInUserData.email;
  try {
    // Check if user email exists and has data
    if (!loggedInUserEmail || !rulInputData[loggedInUserEmail]) {
      console.log("Waiting for user data...");
      return;
    }

    const userDataArray = rulInputData[loggedInUserEmail];
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

    // TODO: get rid of tanstack query. Use fetch calls or custom fetch hooks.
    getRulPrediction.mutate(newEntry, {
      onSuccess: (data) => {
        console.log("RUL data fetched successfully:", data);
        setRulPredPoints(data.Future_Predictions); // if this doesnt exist then what even went wrong lmao
        setCount((prevCount) => (prevCount + 1) % userDataArray.length);
      },
      onError: (error) => {
        setRulPredPoints([]);
        console.error("Error fetching RUL data:", error);
      },
    });
  } catch (error) {
    console.error("Error fetching RUL data:", error);
  }
};

const RUL = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL
  const { getRulPrediction } = useRulPrediction();
  const { data: loggedInUserData, error: loggedInUserError, isLoading } = useQuery({
    queryKey: ["logged-in-user"],
    queryFn: () => tuyau.auth.getLoggedInUser.$get().unwrap(),
  });

  // state
  const initialRulState = { Predicted_Health_Index: 0, Remaining_Useful_Life: 0, User: "", Time_Hours: 0 };
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [rulPredPoints, setRulPredPoints] = useState<RulPrediction[]>([initialRulState]);
  const [simulatedRul, setSimulatedRul] = useState<RulPrediction[]>([initialRulState]);

  // Use useEffect to call fetchRulPrediction when component mounts and data is available
  useEffect(() => {
    if (loggedInUserData && !loggedInUserError) {
      fetchRulPrediction(loggedInUserData, getRulPrediction, setRulPredPoints, count, setCount);
    }
  }, [loggedInUserData, loggedInUserError]); // Note: count is intentionally not included to avoid infinite loop

  // Handle loading and error states AFTER all hooks are called
  if (isLoading) {
    return <div className="h-full w-full flex items-center justify-center">Loading...</div>;
  }

  if (loggedInUserError) {
    toast.error("Failed to fetch logged in user");
    // TODO: maybe clear session data here and return to login page
    return <div className="h-full w-full">Unauthorized</div>;
  }

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex justify-between mb-2">
        <div className="text-base-content text-3xl">Remaining Useful Life</div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}>
            {isSimulatorOpen ? "Close Simulator" : "Open Simulator"}
          </button>

          <button
            onClick={() => fetchRulPrediction(loggedInUserData, getRulPrediction, setRulPredPoints, count, setCount)}
            className={cn("btn btn-primary flex justify-center")}
            disabled={getRulPrediction.isPending}
          >
            Calculate RUL
            {getRulPrediction.isPending && <span className="loading loading-spinner"></span>}
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-4 h-4/5">
        <div className={cn("flex-grow transition-all duration-300 ease-in-out", isSimulatorOpen ? "w-2/3" : "w-full")}>
          <RulChart currentRulPoint={rulPredPoints} simulatedRulPoint={simulatedRul} />
        </div>

        <div>
          {isSimulatorOpen && (
            <div className="flex items-center h-full justify-center transition-all duration-300">
              <SimulationSidebar setSimulatedRul={setSimulatedRul} simulatedRul={simulatedRul} />
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full items-center justify-center">
        <div
          className={cn(
            "flex flex-col bg-base-200 text-base-content items-center justify-center w-1/3 p-2",
            "rounded hover:bg-base-100 hover:text-base-content transition-all duration-200 shadow"
          )}
        >
          <div className="text-2xl font-semibold">Remaining Useful Life</div>
          <div className="text-xl">
            {rulPredPoints.length > 0 && rulPredPoints[0]?.Remaining_Useful_Life != null
              ? parseInt(rulPredPoints[0].Remaining_Useful_Life.toString(), 10)
              : "N/A"}
            hours
          </div>
        </div>
      </div>
    </div>
  );
};

export default RUL;
