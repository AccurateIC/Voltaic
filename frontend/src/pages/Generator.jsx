import { useState, useEffect } from "react";
import { useMessageBus } from "../lib/MessageBus";

const HalfCircleSpeedometer = ({ value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  const degree = (percentage * 180) / 100;
  const circumference = Math.PI * 90;
  const arcLength = (degree / 360) * circumference;

  return (
    <svg
      viewBox="0 0 100 50"
      className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="#e0e0e0" strokeWidth="10" />
      <path
        className={`transition-all duration-300 ease-in-out`}
        d="M5,50 A45,45 0 0,1 95,50"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset="0"
        transform="rotate(-90,50)"
      />
    </svg>
  );
};

const VoltageStatCard = ({ value, name, kind, color }) => {
  let maxValue;
  let units;
  switch (kind) {
    case "voltage":
      maxValue = 250;
      units = "V";
      break;
    case "current":
      maxValue = 20;
      units = "Amp";
      break;
    case "lineVoltage":
      maxValue = 440;
      units = "V";
      break;
    default:
      maxValue = 300;
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-gray-700">{name}</div>
      <HalfCircleSpeedometer value={Math.round(value)} maxValue={maxValue} color={color || "#86c232"} />
      <div className="text-3xl font-bold text-gray-800">
        {Math.round(value)} {units}
      </div>
    </div>
  );
};

const PhaseTabs = ({ selectedPhase, setSelectedPhase }) => {
  return (
    <div className="flex space-x-4 mb-4 justify-center">
      <button
        className={`px-4 py-2 rounded-md ${selectedPhase === "1 Phase" ? "bg-green-500 text-white" : "bg-gray-300"}`}
        onClick={() => setSelectedPhase("1 Phase")}
      >
        1 Phase
      </button>
      <button
        className={`px-4 py-2 rounded-md ${selectedPhase === "3 Phase" ? "bg-green-500 text-white" : "bg-gray-300"}`}
        onClick={() => setSelectedPhase("3 Phase")}
      >
        3 Phase
      </button>
    </div>
  );
};

export const Generator = () => {
  const [selectedPhase, setSelectedPhase] = useState("3 Phase");
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
  });

  useMessageBus("archive", async () => {
    await getData();
  });

  const getData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getLatest`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setStats({
          l1Voltage: data.find((item) => item.gensetPropertyId === 13)?.propertyValue || 0,
          l2Voltage: data.find((item) => item.gensetPropertyId === 14)?.propertyValue || 0,
          l3Voltage: data.find((item) => item.gensetPropertyId === 15)?.propertyValue || 0,
          l1Current: data.find((item) => item.gensetPropertyId === 10)?.propertyValue || 0,
          l2Current: data.find((item) => item.gensetPropertyId === 11)?.propertyValue || 0,
          l3Current: data.find((item) => item.gensetPropertyId === 12)?.propertyValue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="">
      <PhaseTabs selectedPhase={selectedPhase} setSelectedPhase={setSelectedPhase} />

      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-3">
        {selectedPhase === "3 Phase" ? (
          <>
            <VoltageStatCard kind="voltage" name="L1 Voltage" value={stats.l1Voltage} color="#B1D5BD" />
            <VoltageStatCard kind="voltage" name="L2 Voltage" value={stats.l2Voltage} color="#B1D5BD" />
            <VoltageStatCard kind="voltage" name="L3 Voltage" value={stats.l3Voltage} color="#B1D5BD" />
            <VoltageStatCard kind="current" name="L1 Current" value={stats.l1Current} color="#B1D5BD" />
            <VoltageStatCard kind="current" name="L2 Current" value={stats.l2Current} color="#B1D5BD" />
            <VoltageStatCard kind="current" name="L3 Current" value={stats.l3Current} color="#B1D5BD" />
          </>
        ) : (
          <>
            <VoltageStatCard kind="voltage" name="L1 Voltage" value={stats.l1Voltage} color="#B1D5BD" />
            <VoltageStatCard kind="current" name="L1 Current" value={stats.l1Current} color="#B1D5BD" />
          </>
        )}
      </div>
    </div>
  );
};
