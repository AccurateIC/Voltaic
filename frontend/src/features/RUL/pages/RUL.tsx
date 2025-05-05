import { cn } from "../../../lib/Utils";
import { useState } from "react";

import { RulChart } from "../../../components/charts/RulTrendChart";
import { rulInputData } from "../../../components/rulData";
import { useAuth } from "../../shared/hooks/useAuth";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { RulPrediction } from "../types/rul.types";
import { SimulationSidebar } from "../components/SimulationSidebar";

const RUL = () => {
  // state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [count, setCount] = useState(0);
  const [apiPoint, setApiPoint] = useState<RulPrediction>({
    Remaining_Useful_Life: undefined,
    Predicted_Health_Index: undefined,
    Time_Hours: undefined,
  });
  const [simulatedRul, setSimulatedRul] = useState<RulPrediction>({
    Remaining_Useful_Life: undefined,
    Predicted_Health_Index: undefined,
    Time_Hours: undefined,
  });

  // hooks
  const { getLoggedInUser } = useAuth();
  const loggedInUser = getLoggedInUser.data;
  const loggedInEmail = loggedInUser?.email;
  const { getRulPrediction } = useRulPrediction();

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

      console.log(entry);
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
          setApiPoint({ ...data, Time_Hours: newEntry.Time_Hours });
          setCount((prevCount) => (prevCount + 1) % userDataArray.length);
        },
        onError: (error) => {
          console.error("Error fetching RUL data:", error);
        },
      });
    } catch (error) {
      console.error("Error fetching RUL data:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex justify-between mb-2">
        <div className="text-base-content text-3xl">Remaining Useful Life</div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}>
            {isSimulatorOpen ? "Close Simulator" : "Open Simulator"}
          </button>

          <button
            onClick={fetchRulPrediction}
            className={cn("btn btn-primary flex justify-center")}
            disabled={getRulPrediction.isPending}>
            Calculate RUL
            {getRulPrediction.isPending && <span className="loading loading-spinner"></span>}
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-4 h-4/5">
        <div className={cn("flex-grow transition-all duration-300 ease-in-out", isSimulatorOpen ? "w-2/3" : "w-full")}>
          <RulChart currentRulPoint={apiPoint} simulatedRulPoint={simulatedRul} />
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
          )}>
          <div className="text-2xl font-semibold">Remaining Useful Life</div>
          <div className="text-xl">{Math.round(apiPoint.Remaining_Useful_Life * 100) / 100 || 15} hours</div>
        </div>
      </div>
    </div>
  );
};

export default RUL;
