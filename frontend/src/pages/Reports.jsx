import { useEffect, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import EngineSpeedLineChart from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart";
import { BatteryChargeLineChart } from "../components/charts/BatteryChargeLineCart";
import { useMessageBus } from "../lib/MessageBus";

export const Reports = () => {
  const [stats, setStats] = useState({
    l1Voltage: [],
    l2Voltage: [],
    l3Voltage: [],
    l1Current: [],
    l2Current: [],
    l3Current: [],
    engineFuelLevel: [],
    engineSpeed: [],
    oilPress: [],
    chargeAltVolts: [],
    batteryVolts: [],
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

  const getReportData = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_ADONIS_BACKEND
        }/archive/getBetween?from=2025-02-21T05:46:43.377Z&to=2025-02-21T11:41:59.481Z`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.ok) {
        const l1Voltage =
          data
            .filter((item) => item.gensetPropertyId === 13)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l2Voltage =
          data
            .filter((item) => item.gensetPropertyId === 14)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l3Voltage =
          data
            .filter((item) => item.gensetPropertyId === 15)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l1Current =
          data
            .filter((item) => item.gensetPropertyId === 10)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l2Current =
          data
            .filter((item) => item.gensetPropertyId === 11)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l3Current =
          data
            .filter((item) => item.gensetPropertyId === 12)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const engineFuelLevel =
          data
            .filter((item) => item.gensetPropertyId === 4)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const engineSpeed =
          data
            .filter((item) => item.gensetPropertyId === 7)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const oilPress =
          data
            .filter((item) => item.gensetPropertyId === 3)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const batteryVolts =
          data
            .filter((item) => item.gensetPropertyId === 6)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const chargeAltVolts =
          data
            .filter((item) => item.gensetPropertyId === 5)
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];
        setStats({
          l1Voltage,
          l2Voltage,
          l3Voltage,
          l1Current,
          l2Current,
          l3Current,
          engineFuelLevel,
          engineSpeed,
          oilPress,
          batteryVolts,
          chargeAltVolts,
        });
      }
    } catch (error) {
      console.log("Error fetching data", error);
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
            className="bg-white px-15 py-1.5 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040] flex justify-between items-center">
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
            className="bg-white px-15 py-1.5 text-sm 2xl:text-xl text-black font-bold rounded-md w-full md:w-auto shadow-[inset_4px_4px_10px_0px_#00000040] flex justify-between items-center">
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
          <EngineFuelLevelLineChart value={stats.engineFuelLevel} />
        </div>

        <div className="min-h-[400px] bg-base-200">
          <EngineSpeedLineChart value={stats.engineSpeed} />
        </div>

        <div className="min-h-[400px] bg-base-200">
          <GeneratorCurrentLineChart l1Current={stats.l1Current} l2Current={stats.l2Current} l3Current={stats.l3Current} />
        </div>

        <div className="min-h-[400px] bg-base-200">
          <GeneratorVoltageLineChart l1Voltage={stats.l1Voltage} l2Voltage={stats.l2Voltage} l3Voltage={stats.l3Voltage} />
        </div>

        <div className="min-h-[400px] bg-base-200">
          <OilPressureLineChart value={stats.oilPress} />
        </div>

        <div className="min-h-[400px] bg-base-200">
          <BatteryChargeLineChart
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
