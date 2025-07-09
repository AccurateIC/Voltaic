import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus.js";
import { SemiCircleGauge } from "../components/SemiCircleGauge.js";
import { VoltageStatCard } from "../components/VoltageStatCard.js";
import { tuyau } from "../lib/Tuyau.js";
import Archive from "../../../backend/app/models/archive.js";

export const Generator = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
  });
  const [archiveData, setArchiveData] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<Object>({});

  const getData = async (
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setArchiveData: React.Dispatch<React.SetStateAction<Archive[]>>,
    setIsError: React.Dispatch<React.SetStateAction<Object>>
  ) => {
    setIsLoading(true);
    const { data, error } = await tuyau.archive.getLatest.$get();
    console.log("data", data);
    if (error) {
      setArchiveData([]);
      setIsError(error.value);
      throw new Error(`Failed to fetch latest archive entry. Status Code: ${error.status}`);
    }
    setArchiveData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("Generator page mount effect running");
    (async () => {
      await getData(setIsLoading, setArchiveData, setIsError);
    })();
  }, []);

  useEffect(() => {
    if (!archiveData.length) return;
    const getVal = (name) => archiveData.find((item) => item.gensetProperty.propertyName === name)?.propertyValue || 0;
    setStats({
      l1Voltage: getVal("genL1Volts"),
      l2Voltage: getVal("genL2Volts"),
      l3Voltage: getVal("genL3Volts"),
      l1Current: getVal("genL1Current"),
      l2Current: getVal("genL2Current"),
      l3Current: getVal("genL3Current"),
    });
  }, [archiveData]);

  useEffect(() => {
    console.log(archiveData);
  }, [archiveData]);

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getData(setIsLoading, setArchiveData, setIsError);
    })();
  });

  if (isLoading) {
    return <div>Loading...</div>; // You can use a Skeleton here if you want
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full">
      <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats.l1Voltage} />
      <VoltageStatCard kind="voltage" name={"L2 Voltage"} value={stats.l2Voltage} />
      <VoltageStatCard kind="voltage" name={"L3 Voltage"} value={stats.l3Voltage} />
      <VoltageStatCard kind="current" name={"L1 Current"} value={stats.l1Current} />
      <VoltageStatCard kind="current" name={"L2 Current"} value={stats.l2Current} />
      <VoltageStatCard kind="current" name={"L3 Current"} value={stats.l3Current} />
    </div>
  );
};
