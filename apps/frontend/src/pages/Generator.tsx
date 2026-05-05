import { useEffect, useState } from "react";
import { VoltageStatCard } from "../components/VoltageStatCard.js";
import { useLatestArchiveData } from "../hooks/useLatestArchiveData";

export const Generator = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
  });
  const { latestData, isLoading, errorMessage } = useLatestArchiveData();

  useEffect(() => {
    if (!latestData.length) return;
    const getVal = (name) => latestData.find((item) => item.gensetProperty.propertyName === name)?.propertyValue || 0;
    setStats({
      l1Voltage: getVal("genL1Volts"),
      l2Voltage: getVal("genL2Volts"),
      l3Voltage: getVal("genL3Volts"),
      l1Current: getVal("genL1Current"),
      l2Current: getVal("genL2Current"),
      l3Current: getVal("genL3Current"),
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
 <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 lg:h-full px-4 py-4 md:px-6 md:py-5">
      <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats.l1Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="voltage" name={"L2 Voltage"} value={stats.l2Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="voltage" name={"L3 Voltage"} value={stats.l3Voltage} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"L1 Current"} value={stats.l1Current} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"L2 Current"} value={stats.l2Current} isLoading={isLoading} />
      <VoltageStatCard kind="current" name={"L3 Current"} value={stats.l3Current} isLoading={isLoading} />
    </div>
  );
};
