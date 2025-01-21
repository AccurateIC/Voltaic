import { useCallback, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart";
import { BatteryChargeLineChart } from "../components/charts/BatteryChargeLineCart";
import { useWebSocket } from "../lib/WebSocketConnection";

export const Reports = () => {
  const [stats, setStats] = useState({
    timeStamp: new Date(),
    batteryVolts: 0,
    chargeAltVolts: 0,
    engineSpeed: 1480,
    engSpeedDisplayIsAnomaly: true,
    engineFuelLevel: 2, //less than 5= low,
    l1Voltage: 1,
    l2Voltage: 2,
    l3Voltage: 3,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
    l1l2l3Current: 0,
    oilPress: 4,
    fuelLevelISAnomaly: false,
    l1IsAnomaly: false,
    l2IsAnomaly: false,
    l3IsAnomaly: true,
    l1CIsAnomaly: false,
    l2CIsAnomaly: false,
    l3CIsAnomaly: false,
    oilPressIsAnomaly: true,
    batteryVoltsIsAnomaly: true,
    chargeAltVoltsIsAnomaly: true,
  });

  const handleWsMessage = useCallback((message) => {
    console.log(message);
    setStats({
      timeStamp: message?.timestamp,
      batteryVolts: Math.round(message?.engBatteryVolts?.value),
      chargeAltVolts: Math.round(message?.engChargeAltVolts?.value),
      engineSpeed: Math.round(message?.engSpeedDisplay?.value),
      l1Voltage: Math.round(message?.genL1Volts?.value),
      l2Voltage: Math.round(message?.genL2Volts?.value),
      l3Voltage: Math.round(message?.genL3Volts?.value),
      l1Current: Math.round(message?.genL1Current?.value),
      l2Current: Math.round(message?.genL2Current?.value),
      l3Current: Math.round(message?.genL3Current?.value),
      l1l2l3Current: Math.round(message?.genL1L2L3Current?.value),
      engineFuelLevel: Math.round(message?.engineFuelLevelUnits?.value),
      fuelLevelISAnomaly: message?.engineFuelLevelUnits?.is_anomaly, 
      l1IsAnomaly: message?.genL1Volts?.is_anomaly,
      l2IsAnomaly: message?.genL2Volts?.is_anomaly,
      l3IsAnomaly: message?.genL3Volts?.is_anomaly,
      l1CIsAnomaly: message?.genL1Current?.is_anomaly,
      l2CIsAnomaly: message?.genL2Current?.is_anomaly,
      l3CIsAnomaly: message?.genL3Current?.is_anomaly,
      oilPress: message?.engOilPress?.value,
      oilPressIsAnomaly: message?.engOilPress?.is_anomaly,
      engSpeedDisplayIsAnomaly: message?.engSpeedDisplay?.is_anomaly,
      batteryVoltsIsAnomaly: message?.engBatteryVolts?.is_anomaly,
      chargeAltVoltsIsAnomaly: message?.engChargeAltVolts?.is_anomaly,
    });
    console.log(message?.engSpeedDisplay?.is_anomaly);
    // console.log(message?.genL2Current?.value);
    // console.log(message?.genL3Current?.value);
    // console.log(message?.genL1Current?.is_anomaly);
    // console.log(message?.genL2Current?.is_anomaly);
    // console.log(typeof(message?.genL1Volts?.value))
  }, []);

  const { send, isConnected } = useWebSocket(handleWsMessage);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200">
        <EngineSpeedLineChart
          timeStamp={stats.timeStamp}
          value={stats.engineSpeed}
          engSpeedDisplayIsAnomaly={stats.engSpeedDisplayIsAnomaly}
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
        <GeneratorCurrentLineChart
          timeStamp={stats.timeStamp}
          l1Current={stats.l1Current}
          l2Current={stats.l2Current}
          l3Current={stats.l3Current}
          l1l2l3Current={stats.l1l2l3Current}
          l1CIsAnomaly={stats.l1CIsAnomaly}
          l2CIsAnomaly={stats.l2CIsAnomaly}
          l3CIsAnomaly={stats.l3CIsAnomaly}
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
        <OilPressureLineChart
          timeStamp={stats.timeStamp}
          oilPressure={stats.oilPress}
          oilPressureIsAnomaly={stats.oilPressIsAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <BatteryChargeLineChart
          timeStamp={stats.timeStamp}
          batteryVolts={stats.batteryVolts}
          chargeAltVolts={stats.chargeAltVolts}
          batteryVoltsIsAnomaly={stats.batteryVoltsIsAnomaly}
          chargeAltVoltsIsAnomaly={stats.chargeAltVoltsIsAnomaly}
        />
      </div>
    </div>
  );
};
