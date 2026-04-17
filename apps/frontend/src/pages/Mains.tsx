import { useEffect, useState } from "react";
import { VoltageStatCard } from "../components/VoltageStatCard.js";
import { useLatestArchiveData } from "../hooks/useLatestArchiveData";

const HalfCircleSpeedometer = ({ value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  const degree = (percentage * 180) / 100;
  const circumference = Math.PI * 90;
  const arcLength = (degree / 360) * circumference;

  return (
    <svg
      viewBox="0 0 100 50"
      className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Arc */}
      <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="#e0e0e0" strokeWidth="10" />
      {/* Foreground Arc */}
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

const SemiCircularStatCard = ({ value, maxValue, title, units, color }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-gray-700">{title}</div>
      <HalfCircleSpeedometer value={Math.round(value)} maxValue={maxValue} color={color || "#86c232"} />
      <div className="text-3xl font-bold text-gray-800">
        {Math.round(value)} {units}
      </div>
    </div>
  );
};

export const Mains = () => {
  const { latestData, isLoading, errorMessage } = useLatestArchiveData();

  const [stats, setStats] = useState({
    mainsl1Voltage: 0,
    mainsl2Voltage: 0,
    mainsl3Voltage: 0,
    mainsl1Current: 0,
    mainsl2Current: 0,
    mainsl3Current: 0,
  });

  useEffect(() => {
    if (!latestData.length) return;
    const getVal = (name) => latestData.find((item) => item.gensetProperty.propertyName === name)?.propertyValue || 0;
    setStats({
      mainsl1Voltage: getVal("mainsL1Volts"),
      mainsl2Voltage: getVal("mainsL2Volts"),
      mainsl3Voltage: getVal("mainsL3Volts"),
      mainsl1Current: getVal("mainsL1Current"),
      mainsl2Current: getVal("mainsL2Current"),
      mainsl3Current: getVal("mainsL3Current"),
    });
  }, [latestData]);

  // if (isLoading) {
  //   return <div className="flex justify-center items-center h-full">Loading...</div>;
  // }

  if (errorMessage) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Unable to load data. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full">
      <VoltageStatCard kind="voltage" name={"Mains L1 Voltage"} value={stats.mainsl1Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="voltage" name={"Mains L2 Voltage"} value={stats.mainsl2Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="voltage" name={"Mains L3 Voltage"} value={stats.mainsl3Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"Mains L1 Current"} value={stats.mainsl1Current} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"Mains L2 Current"} value={stats.mainsl2Current} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"Mains L3 Current"} value={stats.mainsl3Current} isLoading={isLoading} />
    </div>
  );
};
