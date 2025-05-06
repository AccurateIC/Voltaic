import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus.ts";
import { VoltageStatCard } from "../components/VoltageStatCard.tsx";

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
        className="transition-all duration-300 ease-in-out"
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

const SemiCircularStatCard = ({ value, maxValue, title, units, color }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-xl shadow-md w-full h-full">
      <div className="text-lg font-semibold text-gray-700">{title}</div>
      <HalfCircleSpeedometer value={Math.round(value)} maxValue={maxValue} color={color || "#86c232"} />
      <div className="text-2xl font-bold text-gray-800">
        {Math.round(value)} {units}
      </div>
    </div>
  );
};

export const Mains = () => {
  const [stats, setStats] = useState({
    mainsl1Voltage: 0,
    mainsl2Voltage: 0,
    mainsl3Voltage: 0,
    mainsl1Current: 0,
    mainsl2Current: 0,
    mainsl3Current: 0,
  });

  const [selectedPhase, setSelectedPhase] = useState("3 Phase");

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
          mainsl1Voltage: data.find((item) => item.gensetProperty.propertyName === "mainsL1Volts")?.propertyValue || 0,
          mainsl2Voltage: data.find((item) => item.gensetProperty.propertyName === "mainsL2Volts")?.propertyValue || 0,
          mainsl3Voltage: data.find((item) => item.gensetProperty.propertyName === "mainsL3Volts")?.propertyValue || 0,
          mainsl1Current: data.find((item) => item.gensetProperty.propertyName === "mainsL1Current")?.propertyValue || 0,
          mainsl2Current: data.find((item) => item.gensetProperty.propertyName === "mainsL2Current")?.propertyValue || 0,
          mainsl3Current: data.find((item) => item.gensetProperty.propertyName === "mainsL3Current")?.propertyValue || 0,
        });
      }
    } catch (error) {
      console.log("Error fetching mains data", error);
    }
  };

  useMessageBus("archive", async () => {
    await getData();
  });

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center gap-4 mb-2">
        <button
          onClick={() => setSelectedPhase("1 Phase")}
          className={`px-5 py-2 rounded-md font-medium shadow-sm transition ${
            selectedPhase === "1 Phase" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}>
          1 Phase
        </button>
        <button
          onClick={() => setSelectedPhase("3 Phase")}
          className={`px-5 py-2 rounded-md font-medium shadow-sm transition ${
            selectedPhase === "3 Phase" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}>
          3 Phase
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
        {selectedPhase === "1 Phase" ? (
          <>
            <SemiCircularStatCard
              units="V"
              title="Mains L1 Voltage"
              value={stats.mainsl1Voltage}
              maxValue={250}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="A"
              title="Mains L1 Current"
              value={stats.mainsl1Current}
              maxValue={40}
              color="#B1D5BD"
            />
          </>
        ) : (
          <>
            <SemiCircularStatCard
              units="V"
              title="Mains L1 Voltage"
              value={stats.mainsl1Voltage}
              maxValue={250}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="V"
              title="Mains L2 Voltage"
              value={stats.mainsl2Voltage}
              maxValue={250}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="V"
              title="Mains L3 Voltage"
              value={stats.mainsl3Voltage}
              maxValue={250}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="A"
              title="Mains L1 Current"
              value={stats.mainsl1Current}
              maxValue={40}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="A"
              title="Mains L2 Current"
              value={stats.mainsl2Current}
              maxValue={40}
              color="#B1D5BD"
            />
            <SemiCircularStatCard
              units="A"
              title="Mains L3 Current"
              value={stats.mainsl3Current}
              maxValue={40}
              color="#B1D5BD"
            />
          </>
        )}
      </div>
    </div>
  );
};
