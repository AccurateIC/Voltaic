// src/pages/Engine.jsx

import { PlugZap, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useWebSocket } from "../lib/WebSocketConnection";

const VoltageStatCard = ({ value, name, status, kind }) => {
  let units = undefined;
  let icon = undefined;
  switch (kind) {
    case "voltage":
      units = "Volts"
      icon = <PlugZap size={64} />
      break;
    case "current":
      units = "Ampere"
      icon = <Zap size={64} />
    default:
      break
  }
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="text-3xl">{name}</div>
      <div className="flex flex-row items-center gap-2">
        <span>{icon}</span>
        <span className="text-4xl font-bold">{value} {units}</span>
      </div>
      <div className="text-base-content">{status}</div>
    </div>
  );
}

export const Generator = () => {
  const [stats, setStats] = useState(
    {
      l1Voltage: 0,
      l2Voltage: 0,
      l3Voltage: 0,
      l1Current: 0,
      l2Current: 0,
      l3Current: 0,
    }
  );
  const handleWsMessage = useCallback((message) => {
    console.log("Ws Message: ", message)
    setStats({
      l1Voltage: Math.round(message?.genL1Volts.value),
      l2Voltage: Math.round(message?.genL2Volts.value),
      l3Voltage: Math.round(message?.genL3Volts.value),
      l1Current: Math.round(message?.genL1Current.value),
      l2Current: Math.round(message?.genL2Current.value),
      l3Current: Math.round(message?.genL3Current.value),
    })
  }, [])
  const { send, isConnected } = useWebSocket(handleWsMessage);


  console.log(isConnected)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats?.l1Voltage} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats?.l2Voltage} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L2 Voltage"} value={stats?.l3Voltage} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="current" name={"L1 Current"} value={stats?.l1Current} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="current" name={"L2 Current"} value={stats?.l2Current} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="current" name={"L3 Current"} value={stats?.l3Current} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={12.7} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={12.7} status={"Discharging"} /> </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center"> <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={12.7} status={"Discharging"} /> </div>
    </div>
  );
}
