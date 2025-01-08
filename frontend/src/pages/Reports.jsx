import { useCallback, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { useWebSocket } from "../lib/WebSocketConnection";

export const Reports = () => {
  const [stats, setStats] = useState(
    {
      timeStamp: new Date(),
      engineSpeed: 1480,
      l1Voltage: 0,
      l2Voltage: 0,
      l3Voltage: 0,
      engineFuelLevel: -1,
      l1IsAnomaly: undefined,
      l2IsAnomaly: undefined,
      l3IsAnomaly: undefined
    }
  );
  const handleWsMessage = useCallback((message) => {
    console.log(message)
    setStats({
      timeStamp: message?.timestamp,
      engineSpeed: Math.round(message?.engSpeed.value),
      l1Voltage: Math.round(message?.genL1Volts.value),
      l2Voltage: Math.round(message?.genL2Volts.value),
      l3Voltage: Math.round(message?.genL3Volts.value),
      engineFuelLevel: Math.round(message?.engineFuelLevel.value),
      l1IsAnomaly: message?.genL1Volts.is_anomaly,
      l2IsAnomaly: message?.genL2Volts.is_anomaly,
      l3IsAnomaly: message?.genL3Volts.is_anomaly,
    })
  }, [])
  const { send, isConnected } = useWebSocket(handleWsMessage);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200"><EngineSpeedLineChart value={stats.engineSpeed} timeStamp={stats.timeStamp} /></div>
      <div className="min-h-[400px] bg-base-200"><EngineFuelLevelLineChart fuelLevel={stats.engineFuelLevel} timeStamp={stats.timeStamp} /></div>
      <div className="min-h-[400px] bg-base-200">
        <GeneratorVoltageLineChart
          timeStamp={stats.timeStamp}
          l1Voltage={stats.l1Voltage}
          l2Voltage={stats.l2Voltage}
          l3Voltage={stats.l3Voltage}
          l1IsAnomaly={stats.l1IsAnomaly}
          l2IsAnomaly={stats.l2IsAnomaly}
          l3IsAnomaly={stats.l2IsAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <GeneratorVoltageLineChart
          timeStamp={stats.timeStamp}
          l1Voltage={stats.l1Voltage}
          l2Voltage={stats.l2Voltage}
          l3Voltage={stats.l3Voltage}
          l1IsAnomaly={stats.l1IsAnomaly}
          l2IsAnomaly={stats.l2IsAnomaly}
          l3IsAnomaly={stats.l2IsAnomaly}
        />
      </div>
    </div>
  );
}
