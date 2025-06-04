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
import { motion, AnimatePresence } from "motion/react";
import { GenericPropertyStatisticsBarChart } from "../components/charts/reports/GenericPropertyStatisticsBarChart";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const GraphModal = ({ isOpen, onClose, children }: GraphModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="fixed inset-4 z-50 bg-base-200 rounded-lg overflow-hidden m-20">
            <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost">
              ✕
            </button>
            <div className="w-full h-full p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
        <button className="btn">Export</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 h-full">
        {renderGraphCard(<AllAnomaliesCount />)}
        {renderGraphCard(<AnomaliesByProperty />)}
        {renderGraphCard(<PDMNotificationStatistics />)}
        {renderGraphCard(<RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />)}

        {/* All Properties Statistics */}
        {properties.map((property) =>
          renderGraphCard(
            <GenericPropertyStatisticsBarChart
              timeDuration={timeDuration}
              propertyName={property.propertyName}
              chartTitle={property.chartTitle}
            />,
            property.propertyName
          )
        )}
      </div>
      {/* Modal */}
      <GraphModal isOpen={modalContent !== null} onClose={() => setModalContent(null)}>
        {modalContent?.component}
      </GraphModal>
    </div>
  );
};
