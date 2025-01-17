import { useCallback, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart";
import { useWebSocket } from "../lib/WebSocketConnection";


export const Reports = () => {
  const [stats, setStats] = useState({
    timeStamp: new Date(),
    engineSpeed: 1480,
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
    oilPress: 0.0,
    engineFuelLevel: -1,
    l1IsAnomaly: false,
    l2IsAnomaly: false,
    l3IsAnomaly: true,
    // oilPressIsAnomaly: true,
  });

  const handleWsMessage = useCallback((message) => {
    console.log(
      "Current oil pressure anomaly flag:",
      message
    );
    setStats({  
      timeStamp: message?.timestamp,
      engineSpeed: Math.round(message?.engSpeed?.value),
      l1Voltage: Math.round(message?.genL1Volts?.value),
      l2Voltage: Math.round(message?.genL2Volts?.value),
      l3Voltage: Math.round(message?.genL3Volts?.value),
      l1Current: Math.round(message?.genL1Current?.value),
      l2Current: Math.round(message?.genL2Current?.value),
      l3Current: Math.round(message?.genL3Current?.value),
      oilPress: message?.oilPress,
      engineFuelLevel: Math.round(message?.engineFuelLevel?.value),
      l1IsAnomaly:message?.genL1Volts?.is_anomaly,
      l2IsAnomaly:message?.genL2Volts?.is_anomaly,
      l3IsAnomaly:message?.genL3Volts?.is_anomaly,
      // oilPressIsAnomaly: true,
    });
  }, []);

  const { send, isConnected } = useWebSocket(handleWsMessage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200">
        <EngineSpeedLineChart
          value={stats.engineSpeed}
          timeStamp={stats.timeStamp}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <EngineFuelLevelLineChart
          fuelLevel={stats.engineFuelLevel}
          timeStamp={stats.timeStamp}
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
          l3IsAnomaly={stats.l3IsAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <GeneratorCurrentLineChart
          timeStamp={stats.timeStamp}
          l1Current={stats.l1Current}
          l2Current={stats.l2Current}
          l3Current={stats.l3Current}
          l1IsAnomaly={stats.l1IsAnomaly}
          l2IsAnomaly={stats.l2IsAnomaly}
          l3IsAnomaly={stats.l3IsAnomaly}
        />
      </div>

      <div className="min-h-[400px] bg-base-200">
        <OilPressureLineChart
          oilPressure={stats.oilPress}
          timeStamp={stats.timeStamp}
          oilPressureIsAnomaly={stats.oilPressIsAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <GeneratorCurrentLineChart
          timeStamp={stats.timeStamp}
          l1Current={stats.l1Current}                   
          l2Current={stats.l2Current}
          l3Current={stats.l3Current}
          l1IsAnomaly={stats.l1IsAnomaly}
          l2IsAnomaly={stats.l2IsAnomaly}
          l3IsAnomaly={stats.l3IsAnomaly}
        />
      </div>
    </div>
  );
};
