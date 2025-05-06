// src/features/RUL/components/SimulationSidebar.tsx
import { useState } from "react";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { RulInputData, RulPrediction } from "../types/rul.types";
import { cn } from "../../../lib/Utils";

type SimulationProps = {
  setSimulatedRul: (rul: RulPrediction) => void;
  simulatedRul: RulPrediction;
};

export const SimulationSidebar = ({ setSimulatedRul, simulatedRul }: SimulationProps) => {
  // hooks
  const { getRulPrediction } = useRulPrediction(); // getRulPrediction is a `mutation`

  // state
  const [form, setForm] = useState<RulInputData>({
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
    console.log("curr form", form);
    e.preventDefault();
    getRulPrediction.mutate(form, {
      onSuccess: (data) => {
        setSimulatedRul(data?.Future_Predictions);
      },
    });
  };

  return (
    <div className="w-96 flex flex-col justify-center bg-base-200 p-4 shadow-lg">
      <fieldset className="fieldset">
        <legend className="fieldset-legend text-2xl">Simulate RUL</legend>
        <form onSubmit={fetchRulData} className="flex flex-col gap-4">
          {/* Running Hours */}
          <div className="form-control w-full">
            <label className="fieldset-label my-2">
              <span>Genset Running Time</span>
              <span className="ml-2 text-base-content/70">{form.Time_Hours} hours</span>
            </label>
            <input
              type="range"
              name="Time_Hours"
              value={form.Time_Hours}
              onChange={handleChange}
              className="range range-primary"
              min="0"
              max="10000"
              step="100"
            />
            <div className="w-full flex justify-between text-xs text-base-content/70 px-2">
              <span>0h</span>
              <span>2500h</span>
              <span>5000h</span>
              <span>7500h</span>
              <span>10000h</span>
            </div>
          </div>

          {/* RPM Deviation */}
          <div className="form-control w-full">
            <label className="fieldset-label my-2">
              <span>RPM Deviation</span>
              <span className="ml-2 text-base-content/70">{form.RPM_Deviation_Percentage}</span>
            </label>
            <input
              type="range"
              name="RPM_Deviation_Percentage"
              value={form.RPM_Deviation_Percentage}
              onChange={handleChange}
              className="range range-primary"
              min="0.06"
              max="4.96"
              step="0.001"
            />
          </div>

          {/* Oil Pressure */}
          <div className="form-control w-full">
            <label className="fieldset-label my-2">
              <span>Engine Oil Pressure (bar)</span>
              <span className="ml-2 text-base-content/70">{form.Oil_Pressure}</span>
            </label>
            <input
              type="range"
              name="Oil_Pressure"
              value={form.Oil_Pressure}
              onChange={handleChange}
              className="range range-primary"
              min="0.0006"
              max="3.5"
              step="0.0001"
            />
          </div>

          {/* Power Output */}
          <div className="form-control w-full">
            <label className="fieldset-label my-2">
              <span>Generator Power Output (kW)</span>
              <span className="ml-2 text-base-content/70">{form.Power_Output_kW}</span>
            </label>
            <input
              type="range"
              name="Power_Output_kW"
              value={form.Power_Output_kW}
              onChange={handleChange}
              className="range range-primary"
              min="0"
              max="12"
              step="0.001"
            />
          </div>

          {/* Inverse Fuel Consumption */}
          <div className="form-control w-full">
            <label className="fieldset-label my-2">
              <span>Inverse Fuel Consumption (H/L)</span>
              <span className="ml-2 text-base-content/70">{form.Inverse_Fuel_Consumption}</span>
            </label>
            <input
              type="range"
              name="Inverse_Fuel_Consumption"
              value={form.Inverse_Fuel_Consumption}
              onChange={handleChange}
              className="range range-primary"
              min="0.03"
              max="1"
              step="0.001"
            />
          </div>

          <button type="submit" className={cn("btn", getRulPrediction.isPending ? "btn-disabled" : "")}>
            {getRulPrediction.isPending ? <span className="loading loading-spinner"></span> : null}
            Calculate
          </button>
        </form>
      </fieldset>
      {getRulPrediction.isSuccess && (
        <div className="text-2xl py-2 bg-base-200 my-2 p-5 rounded">
          Remaining Useful Life: {parseInt(getRulPrediction.data?.Future_Predictions[0]?.Remaining_Useful_Life, 10) || "N/A"}
          hours
        </div>
      )}
    </div>
  );
};
