import {  useEffect, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart";
import { BatteryChargeLineChart } from "../components/charts/BatteryChargeLineCart";
import { useMessageBus } from "../lib/MessageBus";
// import { useWebSocket } from "../lib/WebSocketConnection";

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

 
  const [showProperties, setShowProperties] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getReportData();
    })();
  });

const getReportData = async()=>{
  try {
    const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getLatest`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await response.json();
  console.log("reportData ",data);
    if (response.ok) {
      console.log("sds",data.filter((item) => item.gensetPropertyId === 10)[0]?.propertyValue || 0);
      const l1Voltage = data.filter((item) => item.gensetPropertyId === 13)[0]?.propertyValue || 0;
      const l2Voltage = data.filter((item) => item.gensetPropertyId === 14)[0]?.propertyValue || 0;
      const l3Voltage = data.filter((item) => item.gensetPropertyId === 15)[0]?.propertyValue || 0;
      const l1Current = data.filter((item) => item.gensetPropertyId === 10)[0]?.propertyValue || 0;
      const l2Current = data.filter((item) => item.gensetPropertyId === 11)[0]?.propertyValue || 0;
      const l3Current = data.filter((item) => item.gensetPropertyId === 12)[0]?.propertyValue || 0;
      const engineFuelLevel = data.filter((item) => item.gensetPropertyId === 4)[0]?.propertyValue || 0;
      const engineSpeed = data.filter((item) => item.gensetPropertyId === 7)[0]?.propertyValue || 0;
      const oilPress = data.filter((item) => item.gensetPropertyId === 3)[0]?.propertyValue || 0;
      const chargeAltVolts= data.filter((item) => item.gensetPropertyId === 5)[0]?.propertyValue || 0;

      setStats({ l1Voltage, l2Voltage, l3Voltage, l1Current, l2Current, l3Current, engineFuelLevel, engineSpeed, oilPress, chargeAltVolts  });
    }
  } catch (error) {
    console.log("Error fetching notifications", error);
  }
};


useEffect(() => {
  console.log("Engine page mount effect running");
  (async () => {
    await getReportData();
  })();
}, []);

  return (
    <div>
      <div className="flex flex-wrap gap-4">
      <div className="relative w-full md:w-auto">
        <button
          onClick={() => setShowProperties(!showProperties)}
          className="bg-white px-15 py-1.5 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040] flex justify-between items-center"
        >
          Properties ▼
        </button>
        {showProperties && (
          <div className="absolute mt-1 bg-gray-800 p-4 shadow-md rounded-md w-45 z-10">
            <ul className="text-white">
              <li className="p-2 hover:bg-gray-700 cursor-pointer">Property 1</li>
              <li className="p-2 hover:bg-gray-700 cursor-pointer">Property 2</li>
              <li className="p-2 hover:bg-gray-700 cursor-pointer">Property 3</li>
            </ul>
          </div>
        )}
      </div>

      <div className="relative w-full md:w-auto">
        <button
          onClick={() => setShowTimeFilter(!showTimeFilter)}
          className="bg-white px-15 py-1.5 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040] flex justify-between items-center"
        >
          Time Filter ▼
        </button>
        {showTimeFilter && (
          <div className="absolute mt-1 bg-gray-800 p-4 shadow-md rounded-md w-45 z-10">
            <ul className="text-white">
              <li className="p-2 hover:bg-gray-700 cursor-pointer">15 mins</li>
              <li className="p-2 hover:bg-gray-700 cursor-pointer">30 mins</li>
              <li className="p-2 hover:bg-gray-700 cursor-pointer">1 hour</li>
            </ul>
          </div>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full py-5">
     
        <div className="min-h-[400px] bg-base-200">
        <EngineFuelLevelLineChart
          timeStamp={stats.timeStamp}
          fuelLevel={stats.engineFuelLevel}
          fuelLevelISAnomaly={stats.fuelLevelISAnomaly}
        />
      </div>
      <div className="min-h-[400px] bg-base-200">
        <EngineSpeedLineChart
          timeStamp={stats.timeStamp}
          value={stats.engineSpeed}
          engSpeedDisplayIsAnomaly={stats.engSpeedDisplayIsAnomaly}
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
    </div>
  );
};
