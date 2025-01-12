import { useCallback, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
<<<<<<< Updated upstream
// import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
=======
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
>>>>>>> Stashed changes
import { useWebSocket } from "../lib/WebSocketConnection";
import { CiBellOn } from 'react-icons/ci';
import { FaBell } from 'react-icons/fa';


export const Reports = () => {
  const [stats, setStats] = useState({
    timeStamp: new Date(),
    engineSpeed: 1480,
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    engineFuelLevel: -1,
<<<<<<< Updated upstream
    l1IsAnomaly: false,
    l2IsAnomaly: false,
    l3IsAnomaly: false,
  });
  const handleWsMessage = useCallback((message) => {
    console.log(message);
  
=======
    l1IsAnomaly: true,
    l2IsAnomaly: false,
    l3IsAnomaly: true,
  });
  const handleWsMessage = useCallback((message) => {
    console.log(message);
>>>>>>> Stashed changes
    setStats({
      timeStamp: message?.timestamp,
      engineSpeed: Math.round(message?.engSpeed?.value),
      l1Voltage: Math.round(message?.genL1Volts?.value),
      l2Voltage: Math.round(message?.genL2Volts?.value),
      l3Voltage: Math.round(message?.genL3Volts?.value),
      l1Current: Math.round(message?.genL1Current?.value),
      l2Current: Math.round(message?.genL2Current?.value),
      l3Current: Math.round(message?.genL3Current?.value),
      engineFuelLevel: Math.round(message?.engineFuelLevel?.value),
      l1IsAnomaly: true,
<<<<<<< Updated upstream
      l2IsAnomaly: false,
=======
      l2IsAnomaly: true,
>>>>>>> Stashed changes
      l3IsAnomaly: true,
    });
  }, []);
  const { send, isConnected } = useWebSocket(handleWsMessage);

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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
    </div>
  );
};
