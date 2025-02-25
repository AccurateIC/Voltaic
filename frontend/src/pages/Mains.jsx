import { useEffect, useState } from "react";
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
  const [stats, setStats] = useState({
    mainsl1Voltage: 0,
    mainsl2Voltage: 0,
    mainsl3Voltage: 0,
    mainsl1Current: 0,
    mainsl2Current: 0,
    mainsl3Current: 0,
  });

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getData();
    })();
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
          mainsl1Voltage: data.filter((item) => item.gensetProperty.propertyName === "mainsL1Volts")[0].propertyValue,
          mainsl2Voltage: data.filter((item) => item.gensetProperty.propertyName === "mainsL2Volts")[0].propertyValue,
          mainsl3Voltage: data.filter((item) => item.gensetProperty.propertyName === "mainsL3Volts")[0].propertyValue,
          mainsl1Current: data.filter((item) => item.gensetProperty.propertyName === "mainsL1Current")[0].propertyValue,
          mainsl2Current: data.filter((item) => item.gensetProperty.propertyName === "mainsL2Current")[0].propertyValue,
          mainsl3Current: data.filter((item) => item.gensetProperty.propertyName === "mainsL3Current")[0].propertyValue,
        });
      }
    } catch (error) {
      console.log("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await getData();
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full">
      <SemiCircularStatCard
        units="V"
        title={"Mains L1 Voltage"}
        value={stats.mainsl1Voltage}
        maxValue={250}
        color="#B1D5BD"
      />
      <SemiCircularStatCard
        units="V"
        title={"Mains L2 Voltage"}
        value={stats.mainsl2Voltage}
        maxValue={250}
        color="#B1D5BD"
      />
      <SemiCircularStatCard
        units="V"
        title={"Mains L3 Voltage"}
        value={stats.mainsl3Voltage}
        maxValue={250}
        color="#B1D5BD"
      />
      <SemiCircularStatCard
        units="A"
        title={"Mains L1 Current"}
        value={stats.mainsl1Current}
        maxValue={40}
        color="#B1D5BD"
      />
      <SemiCircularStatCard
        units="A"
        title={"Mains L2 Current"}
        value={stats.mainsl2Current}
        maxValue={40}
        color="#B1D5BD"
      />
      <SemiCircularStatCard
        units="A"
        title={"Mains L3 Current"}
        value={stats.mainsl3Current}
        maxValue={40}
        color="#B1D5BD"
      />
    </div>
  );
};
