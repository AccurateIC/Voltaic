// src/pages/Reports.tsx
import { useState, useEffect } from "react";
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

export const Reports = () => {
  // hooks
  const { getRulPrediction } = useRulPrediction();
  const { getLoggedInUser } = useAuth();

  const loggedInUser = getLoggedInUser?.data;
  const loggedInEmail = loggedInUser?.email;

  //state
  const [count, setCount] = useState(0);
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("month");

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

  const TimeRangeSelector = ({ value, onChange }) => {
    const options = ["year", "month", "week"];

    return (
      <div className="flex flex-row items-center gap-2">
        <label className="text-m">Time Range:</label>

        <div className="dropdown dropdown-start">
          <div tabIndex={0} role="button" className="btn btn-m bg-base-100">
            {value.charAt(0).toUpperCase() + value.slice(1)} ⬇️
          </div>

          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
            {/* <li>
              <a onClick={() => onChange("year")}>Year</a>
            </li>
            <li>
              <a onClick={() => onChange("month")}>Month</a>
            </li>
            <li>
              <a onClick={() => onChange("week")}>Week</a>
            </li> */}
            {options.map((option) => (
              <li key={option}>
                <a onClick={() => onChange(option)}>{option.charAt(0).toUpperCase() + option.slice(1)}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  console.log("timeDuration", timeDuration);
  return (
    <div>
      <div className="flex items-center justify-between p-2">
        <div className="items-start flex gap-10 ">
          <h1 className="text-2xl">Reports</h1>
          <div className="  text-xl">
            <TimeRangeSelector value={timeDuration} onChange={setTimeDuration} />
          </div>
        </div>
        <button className="btn">Export</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 h-full">
        {renderGraphCard(<AllAnomaliesCount />)}
        {renderGraphCard(<AnomaliesByProperty timeDuration={timeDuration} />)}
        {renderGraphCard(<PDMNotificationStatistics timeDuration={timeDuration} />)}
        {renderGraphCard(<RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />)}

        {/* All Properties Statistics */}
        {properties.map((property) =>
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
