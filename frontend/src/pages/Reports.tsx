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

  const properties = [
    { propertyName: "engSpeedDisplay", chartTitle: "Engine Speed (RPM)" },
    { propertyName: "engOilPress", chartTitle: "Engine Oil Pressure (bar)" },
    { propertyName: "engFuelLevelUnits", chartTitle: "Engine Fuel Level (L)" },
    { propertyName: "genL1Volts", chartTitle: "Generator Phase 1 Voltage (volts)" },
    { propertyName: "genL2Volts", chartTitle: "Generator Phase 2 Voltage (volts)" },
    { propertyName: "genL3Volts", chartTitle: "Generator Phase 3 Voltage (volts)" },
    { propertyName: "mainsL1Volts", chartTitle: "Mains Phase 1 Voltage (volts)" },
    { propertyName: "mainsL2Volts", chartTitle: "Mains Phase 1 Voltage (volts)" },
    { propertyName: "mainsL3Volts", chartTitle: "Mains Phase 1 Voltage (volts)" },
  ];

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

  return (
    <div>
      <div className="flex items-center justify-between p-2">
        <h1 className="text-2xl">Reports</h1>
        <div className="form-control w-full max-w-xs">
        <label className="label font-bold">Select Time Range</label>
        <select
          className="select select-sm select-bordered"
          value={timeDuration}
          onChange={(e) => setTimeDuration(e.target.value as DateTimeUnit)}
        >
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

        <button className="btn">Export</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 h-full">
        <div className="aspect-4/3 bg-base-200">
        <AllAnomaliesCount/>
        </div>
        <div className="aspect-4/3 bg-base-200">
        <AnomaliesByProperty timeDuration={timeDuration} />
        </div>
        <div className="aspect-4/3 bg-base-200">
        <PDMNotificationStatistics timeDuration={timeDuration} />
        </div>
        {/* RUL */}
        <div className="aspect-4/3 bg-base-200">
          <RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />
        </div>

        {/* All Properties Statistics */}
        {properties.map((property) => {
          return (
            <div className="aspect-4/3 bg-base-200">
              <GenericPropertyStatisticsBarChart
                timeDuration={timeDuration}
                propertyName={property.propertyName}
                chartTitle={property.chartTitle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
