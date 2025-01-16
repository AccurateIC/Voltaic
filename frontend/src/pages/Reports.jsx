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
    engSpeedIsAnomaly: true,
    engineFuelLevel: -1, //less than 5= low,
    l1Voltage: 1,
    l2Voltage: 2,
    l3Voltage: 3,
    l1Current: 1,
    l2Current: 2,
    l3Current: 3,
    oilPress: 0.0,
    fuelLevelISAnomaly: false,
    l1IsAnomaly: false,
    l2IsAnomaly: false,
    l3IsAnomaly: true,
    l1CIsAnomaly: false,
    l2CIsAnomaly: false,
    l3CIsAnomaly: false,
    oilPressIsAnomaly: true,
  });

  const handleWsMessage = useCallback((message) => {
    console.log(message);
    setStats({
      timeStamp: message?.timestamp,
      engineSpeed: Math.round(message?.engSpeed?.value),
      l1Voltage: Math.round(message?.genL1Volts?.value),
      l2Voltage: Math.round(message?.genL2Volts?.value),
      l3Voltage: Math.round(message?.genL3Volts?.value),
      l1Current: 5,
      l2Current: 6,
      l3Current: 9,
      engineFuelLevel: Math.round(message?.engineFuelLevel?.value),
      fuelLevelISAnomaly: message?.engineFuelLevel?.is_anomaly,
      l1IsAnomaly: message?.genL1Volts?.is_anomaly,
      l2IsAnomaly: message?.genL2Volts?.is_anomaly,
      l3IsAnomaly:true,
      l1CIsAnomaly: true,
      l2CIsAnomaly: true,
      l3CIsAnomaly: true,
      oilPress: message?.engOilPress.value,
      oilPressIsAnomaly: message?.engOilPress.is_anomaly,
      //oilPressIsAnomaly: true,
      engSpeedIsAnomaly: message?.engSpeed?.is_anomaly,
    });
    console.log(stats.l3Current);
    console.log(stats.l3CIsAnomaly);
    console.log(message?.genL3Current?.is_anomaly);
  }, []);

  const { send, isConnected } = useWebSocket(handleWsMessage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200">
        <EngineSpeedLineChart
          timeStamp={stats.timeStamp}
          value={stats.engineSpeed}
          engSpeedIsAnomaly={stats.engSpeedIsAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <EngineFuelLevelLineChart
          timeStamp={stats.timeStamp}
          fuelLevel={stats.engineFuelLevel}
          fuelLevelISAnomaly={stats.fuelLevelISAnomaly}
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
          l1IsAnomaly={stats.l1CIsAnomaly}
          l2IsAnomaly={stats.l2CIsAnomaly}
          l3IsAnomaly={stats.l3CIsAnomaly}
        />
      </div>

      <div className="min-h-[400px] bg-base-200">
        <OilPressureLineChart
          timeStamp={stats.timeStamp}
          oilPressure={stats.oilPress}
          oilPressureIsAnomaly={stats.oilPressIsAnomaly}
        />
      </div>
    </div>
  );
};
