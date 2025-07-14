import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus.js";
import { VoltageStatCard } from "../components/VoltageStatCard.js";
import Archive from "../../../backend/app/models/archive.js";
import { tuyau } from "../lib/Tuyau.js";

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
  const [archiveData, setArchiveData] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    mainsl1Voltage: 0,
    mainsl2Voltage: 0,
    mainsl3Voltage: 0,
    mainsl1Current: 0,
    mainsl2Current: 0,
    mainsl3Current: 0,
  });

  const getData = async (
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setArchiveData: React.Dispatch<React.SetStateAction<Archive[]>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await tuyau.archive.getLatest.$get();

      if (error) {
        setArchiveData([]);
        setError("Unable to load data. Please try again later.");
        return;
      }
      setArchiveData(data);
    } catch (err) {
      setError("Unable to load data. Please try again later.");
      setArchiveData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial data
    (async () => {
      await getData(setIsLoading, setArchiveData, setError);
    })();
  }, []);

  useEffect(() => {
    if (!archiveData.length) return;
    const getVal = (name) => archiveData.find((item) => item.gensetProperty.propertyName === name)?.propertyValue || 0;
    setStats({
      mainsl1Voltage: getVal("mainsL1Volts"),
      mainsl2Voltage: getVal("mainsL2Volts"),
      mainsl3Voltage: getVal("mainsL3Volts"),
      mainsl1Current: getVal("mainsL1Current"),
      mainsl2Current: getVal("mainsL2Current"),
      mainsl3Current: getVal("mainsL3Current"),
    });
  }, [archiveData]);

  useMessageBus("archive", (msg) => {
    // Update data when new archive message received
    (async () => {
      await getData(setIsLoading, setArchiveData, setError);
    })();
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Unable to load data. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full">
      <VoltageStatCard kind="voltage" name={"Mains L1 Voltage"} value={stats.mainsl1Voltage} />
      <VoltageStatCard kind="voltage" name={"Mains L2 Voltage"} value={stats.mainsl2Voltage} />
      <VoltageStatCard kind="voltage" name={"Mains L3 Voltage"} value={stats.mainsl3Voltage} />
      <VoltageStatCard kind="current" name={"Mains L1 Current"} value={stats.mainsl1Current} />
      <VoltageStatCard kind="current" name={"Mains L2 Current"} value={stats.mainsl2Current} />
      <VoltageStatCard kind="current" name={"Mains L3 Current"} value={stats.mainsl3Current} />
    </div>
  );
};
