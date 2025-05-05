import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus.ts";
import { SemiCircleGauge } from "../components/SemiCircleGauge";
import { VoltageStatCard } from "../components/VoltageStatCard";

export const Generator = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
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
        const l1Voltage = data.filter((item) => item.gensetPropertyId === 13)[0]?.propertyValue || 0;
        const l2Voltage = data.filter((item) => item.gensetPropertyId === 14)[0]?.propertyValue || 0;
        const l3Voltage = data.filter((item) => item.gensetPropertyId === 15)[0]?.propertyValue || 0;
        const l1Current = data.filter((item) => item.gensetPropertyId === 10)[0]?.propertyValue || 0;
        const l2Current = data.filter((item) => item.gensetPropertyId === 11)[0]?.propertyValue || 0;
        const l3Current = data.filter((item) => item.gensetPropertyId === 12)[0]?.propertyValue || 0;

        setStats({ l1Voltage, l2Voltage, l3Voltage, l1Current, l2Current, l3Current });
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
      <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats.l1Voltage} />
      <VoltageStatCard kind="voltage" name={"L2 Voltage"} value={stats.l2Voltage} />
      <VoltageStatCard kind="voltage" name={"L3 Voltage"} value={stats.l3Voltage} />
      <VoltageStatCard kind="current" name={"L1 Current"} value={stats.l1Current} />
      <VoltageStatCard kind="current" name={"L2 Current"} value={stats.l2Current} />
      <VoltageStatCard kind="current" name={"L3 Current"} value={stats.l3Current} />
    </div>
  );
};
