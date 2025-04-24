import { cn } from "../../../lib/Utils";
import { useState } from "react";

import { RulChart } from "../../../components/charts/RulTrendChart";
import { rulInputData } from "../../../components/rulData";
import { useAuth } from "../../shared/hooks/useAuth";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { RulPrediction } from "../types/rul.types";

const SimulateRulModal = ({ setRul, rul }) => {
  const [form, setForm] = useState({
    Time_Hours: 500,
    RPM_Deviation_Percentage: 0.08,
    Oil_Pressure: 1.56,
    Power_Output_kW: 2.5,
    Inverse_Fuel_Consumption: 0.03,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const fetchRulData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_RUL_BACKEND}/predict`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Failed to simulate RUL`);
      const data = await response.json();
      setRul(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <dialog id="simulateRulModal" className="modal text-base-content">
      <div className="modal-box">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Simulate RUL</legend>
          <div>
            <form onSubmit={fetchRulData}>
              {/* Running Hours */}
              <div className="">
                <label className="fieldset-label my-2">Genset Running Time (Hours)</label>
                <input
                  type="number"
                  name="Time_Hours"
                  value={form.Time_Hours}
                  onChange={handleChange}
                  className="input validator"
                  required
                  placeholder="Type Genset's running time in hours"
                  min="0"
                  max="10000"
                  title="Must be between be 0 to 10000"
                />
                <p className="validator-hint">Running hours must be between be 0 & 10,000</p>
              </div>

              {/* RPM Deviation */}
              <div>
                <label className="fieldset-label">RPM Deviation Percentage (%)</label>
                <input
                  type="number"
                  name="RPM_Deviation_Percentage"
                  value={form.RPM_Deviation_Percentage}
                  onChange={handleChange}
                  className="input validator"
                  required
                  placeholder="Type RPM Deviation Percentage"
                  min="0.06"
                  max="4.96"
                  step="0.001"
                  title="Must be between be 0.06 to 4.96"
                />
                <p className="validator-hint">Deviation percentage must be between be 0 & 100</p>
              </div>

              {/* Oil Pressure */}
              <div>
                <label className="fieldset-label">Oil Pressure (Hours)</label>
                <input
                  type="number"
                  name="Oil_Pressure"
                  value={form.Oil_Pressure}
                  onChange={handleChange}
                  className="input validator"
                  required
                  placeholder="Type Oil Pressure in bar"
                  min="0.0006"
                  max="3.5"
                  step="0.0001"
                  title="Oil Pressure"
                />
                <p className="validator-hint">Oil pressure must be between 0.0006 & 3.5</p>
              </div>

              {/* Power Output */}
              <div>
                <label className="fieldset-label">Power Output (kVA)</label>
                <input
                  type="number"
                  name="Power_Output_kW"
                  value={form.Power_Output_kW}
                  onChange={handleChange}
                  className="input validator"
                  required
                  placeholder="Type Power Output in kVA"
                  min="0"
                  max="12"
                  step="0.001"
                  title="Power Output"
                />
                <p className="validator-hint">Power output must be between 0 & 12</p>
              </div>

              {/* Fuel Consumption */}
              <div>
                <label className="fieldset-label">Inverse Fuel Consumption (Hour/Litre)</label>
                <input
                  type="number"
                  name="Inverse_Fuel_Consumption"
                  value={form.Inverse_Fuel_Consumption}
                  onChange={handleChange}
                  className="input validator"
                  required
                  placeholder="Type Inverse Fuel Consumption in Hour/Litre"
                  min="0.03"
                  max="1"
                  step="0.001"
                  title="Inverse Fuel Consumption"
                />
                <p className="validator-hint">Inverse Fuel Consumption must be between 0.03 & 1</p>
              </div>
              {/* Submit Button */}
              <div className="flex">
                <button type="submit" className="btn btn-neutral mt-4">
                  Calculate
                </button>
              </div>

              {/* Add a separate close button */}
              <button
                type="button"
                className="btn btn-ghost mt-4"
                onClick={() => document.getElementById("simulateRulModal").close()}>
                Close
              </button>
            </form>
          </div>
        </fieldset>
        {rul !== null && (
          <div className="text-2xl py-2 bg-base-200 my-2 p-5 rounded">
            Remaining Useful Life: {parseInt(rul?.Remaining_Useful_Life, 10) || "N/A"} hours
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
      {/* <div className="modal-backdrop" onClick={(e) => e.stopPropagation()}></div> */}
    </dialog>
  );
};

const RUL = () => {
  // state
  const [count, setCount] = useState(0);
  const [apiPoint, setApiPoint] = useState<RulPrediction>({
    Remaining_Useful_Life: undefined,
    Predicted_Health_Index: undefined,
    Time_Hours: undefined,
  });
  const [rul, setRul] = useState(null);

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

  // // Add another useEffect to trigger fetchRulData when user data is available
  // useEffect(() => {
  //   if (loggedInUser && loggedInUser.email) {
  //     fetchRulData();
  //   }
  // }, [loggedInUser]); // Run when loggedInUser changes

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex justify-between mb-2">
        <div className="text-base-200 text-3xl">Remaining Useful Life</div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => document.getElementById("simulateRulModal").showModal()}>
            Simulate RUL Calculation
          </button>
          <SimulateRulModal setRul={setRul} rul={rul} />

          <button
            onClick={fetchRulPrediction}
            className={cn("btn btn-primary flex justify-center")}
            disabled={getRulPrediction.isPending}>
            Calculate RUL
            {getRulPrediction.isPending && <span className="loading loading-spinner"></span>}
          </button>
        </div>
      </div>
      <div className="flex flex-col h-4/5 px-15">
        <RulChart currentRulPoint={apiPoint} />
      </div>
      <div></div>
      <div className="flex w-full items-center justify-center">
        <div
          className={cn(
            "flex flex-col bg-base-200 text-base-content items-center justify-center w-1/3 p-2",
            "rounded hover:bg-neutral hover:text-base-200 transition-all duration-200 shadow"
          )}>
          <div className="text-2xl font-semibold">Remaining Useful Life</div>
          <div className="text-xl">{Math.round(apiPoint.Remaining_Useful_Life * 100) / 100 || 15} hours</div>
        </div>
      </div>
    </div>
  );
};

export default RUL;
