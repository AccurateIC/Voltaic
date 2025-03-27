import { useEffect, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart";
import EngineSpeedLineChart from "../components/charts/EngineSpeedLineChart";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart";
import { BatteryChargeLineChart } from "../components/charts/BatteryChargeLineCart";
import { PDMLineChart } from "../components/charts/PDMLineChart";
import { useMessageBus } from "../lib/MessageBus";
import { FaFilter } from "react-icons/fa";

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

  const [selectedTimeRange, setSelectedTimeRange] = useState("01 Day");
  const [selectedProperties, setSelectedProperties] = useState([
    "Engine Fuel Level",
    "Engine Speed",
    "Generator Current",
    "Generator Voltage",
    "Oil Pressure",
    "Battery Charge",
    "PDM",
  ]); // Now an array to support multi-select

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getReportData();
    })();
  });

  const calculateTimeRange = (timeRange) => {
    console.log("time range set here in calculateTimeRang", timeRange);
    const now = new Date();
    let fromDate;
    console.log("now", now.toISOString());
    switch (timeRange) {
      case "15 Minutes":
        fromDate = new Date(now - 15 * 60 * 1000);
        break;
      case "30 Minutes":
        fromDate = new Date(now - 30 * 60 * 1000);
        break;
      case "01 Hour":
        fromDate = new Date(now - 60 * 60 * 1000);
        break;
      case "01 Day":
        fromDate = new Date(now - 3600 * 24 * 1000);
        break;
      default:
        fromDate = new Date(now - 15 * 60 * 1000);
        break;
    }

    const toDate = new Date(now);
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  };

  const getReportData = async () => {
    const { from, to } = calculateTimeRange(selectedTimeRange);

    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getBetween?from=${from}&to=${to}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      console.log(data.length);
      console.log("data response", data);

      if (response.ok) {
        const l1Voltage =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL1Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l2Voltage =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL2Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l3Voltage =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL3Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l1Current =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL1Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l2Current =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL2Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const l3Current =
          data
            .filter((item) => item.gensetProperty.propertyName === "genL3Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const engineFuelLevel =
          data
            .filter((item) => item.gensetProperty.propertyName === "engFuelLevel")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
              isAnomaly: item.isAnomaly,
            })) || [];

        const engineSpeed =
          data
            .filter((item) => item.gensetProperty.propertyName === "engSpeedDisplay")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
              isAnomaly: item.isAnomaly,
            })) || [];

        const oilPress =
          data
            .filter((item) => item.gensetProperty.propertyName === "engOilPress")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
              isAnomaly: item.isAnomaly,
            })) || [];

        const batteryVolts =
          data
            .filter((item) => item.gensetProperty.propertyName === "engBatteryVolts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })) || [];

        const chargeAltVolts =
          data
            .filter((item) => item.gensetProperty.propertyName === "engChargeAltVolts")
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

    console.log("from", from);
    console.log("to", to);
  };

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await getReportData();
    })();
  }, []);

  const [batteryData, setBatteryData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [voltageData, setVoltageData] = useState([]);
  const [fuelLevelData, setFuelLevelData] = useState([]);
  const [engineSpeedData, setEngineSpeedData] = useState([]);
  const [oilPressureData, setOilPressureData] = useState([]);

  useEffect(() => {
    if (
      Array.isArray(stats.batteryVolts) &&
      stats.batteryVolts.length > 0 &&
      Array.isArray(stats.chargeAltVolts) &&
      stats.chargeAltVolts.length > 0
    ) {
      const newData = stats.batteryVolts.map((batteryItem) => {
        const chargeAltItem = stats.chargeAltVolts.find((item) => item.timestamp === batteryItem.timestamp);
        const time = new Date(batteryItem.timestamp);
        return {
          time: time.toLocaleTimeString(),
          batteryVolts: batteryItem.propertyValue,
          chargeAltVolts: chargeAltItem ? chargeAltItem.propertyValue : null,
          batteryVoltsIsAnomaly: batteryItem.isAnomaly,
          chargeAltVoltsIsAnomaly: chargeAltItem ? chargeAltItem.isAnomaly : null,
        };
      });

      setBatteryData(newData);
    }
    if (
      Array.isArray(stats.l1Current) &&
      stats.l1Current.length > 0 &&
      Array.isArray(stats.l2Current) &&
      stats.l2Current.length > 0 &&
      Array.isArray(stats.l3Current) &&
      stats.l3Current.length > 0
    ) {
      const newDataCurrent = stats.l1Current.map((l1Item) => {
        const l2Item = stats.l2Current.find((item) => item.timestamp === l1Item.timestamp);
        const l3Item = stats.l3Current.find((item) => item.timestamp === l1Item.timestamp);
        const time = new Date(l1Item.timestamp);
        return {
          time: time.toLocaleTimeString(),
          L1: l1Item.propertyValue,
          L2: l2Item ? l2Item.propertyValue : null,
          L3: l3Item ? l3Item.propertyValue : null,
          l1CIsAnomaly: l1Item.isAnomaly,
          l2CIsAnomaly: l2Item ? l2Item.isAnomaly : null,
          l3CIsAnomaly: l3Item ? l3Item.isAnomaly : null,
        };
      });
      setCurrentData(newDataCurrent);
    }

    if (
      Array.isArray(stats.l1Voltage) &&
      stats.l1Voltage.length > 0 &&
      Array.isArray(stats.l2Voltage) &&
      stats.l2Voltage.length > 0 &&
      Array.isArray(stats.l3Voltage) &&
      stats.l3Voltage.length > 0
    ) {
      const newDataVoltage = stats.l1Voltage.map((l1Item) => {
        const l2Item = stats.l2Voltage.find((item) => item.timestamp === l1Item.timestamp);
        const l3Item = stats.l3Voltage.find((item) => item.timestamp === l1Item.timestamp);
        const time = new Date(l1Item.timestamp);

        return {
          time: time.toLocaleTimeString(),
          L1: l1Item.propertyValue,
          L2: l2Item ? l2Item.propertyValue : null,
          L3: l3Item ? l3Item.propertyValue : null,
          l1IsAnomaly: l1Item.isAnomaly,
          l2IsAnomaly: l2Item.isAnomaly,
          l3IsAnomaly: l3Item.isAnomaly,
        };
      });

      setVoltageData(newDataVoltage);
    }
    if (Array.isArray(stats.engineFuelLevel) && stats.engineFuelLevel.length > 0) {
      const newData3 = stats.engineFuelLevel.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        engineFuelLevel: item.propertyValue,
        fuelLevelISAnomaly: item.isAnomaly,
      }));
      setFuelLevelData(newData3);
    }

    if (Array.isArray(stats.engineSpeed) && stats.engineSpeed.length > 0) {
      const newData4 = stats.engineSpeed.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        engineSpeed: item.propertyValue,
        engSpeedDisplayIsAnomaly: item.isAnomaly,
      }));
      setEngineSpeedData(newData4);
    }

    if (Array.isArray(stats.oilPress) && stats.oilPress.length > 0) {
      const newData = stats.oilPress.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        oilPressure: item.propertyValue,
        oilPressureIsAnomaly: item.isAnomaly,
      }));
      setOilPressureData(newData);
    }
  }, [
    stats.batteryVolts,
    stats.chargeAltVolts,
    stats.l1Current,
    stats.l2Current,
    stats.l3Current,
    stats.l1Voltage,
    stats.l2Voltage,
    stats.l3Voltage,
    stats.engineFuelLevel,
    stats.engineSpeed,
    stats.oilPress,
  ]);

  useEffect(() => {
    console.log("Engine page mount effect running");
    getReportData();
  }, [selectedTimeRange]);

  const propertyOptions = [
    { value: "Engine Fuel Level", label: "Engine Fuel Level" },
    { value: "Engine Speed", label: "Engine Speed" },
    { value: "Generator Current", label: "Generator Current" },
    { value: "Generator Voltage", label: "Generator Voltage" },
    { value: "Oil Pressure", label: "Oil Pressure" },
    { value: "Battery Charge", label: "Battery Charge" },
    { value: "PDM", label: "PDM" },
  ];

  const handlePropertyChange = (propertyValue) => {
    setSelectedProperties((prev) => {
      if (prev.includes(propertyValue)) {
        return prev.filter((item) => item !== propertyValue);
      } else {
        return [...prev, propertyValue];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === propertyOptions.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(propertyOptions.map((option) => option.value));
    }
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-100px)]">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-40 font-semibold text-xl">Property Name:</div>
          <div className="dropdown dropdown-bottom">
            <div tabIndex={0} role="button" className="btn btn-neutral w-56">
              <FaFilter className="mr-2" />
              {selectedProperties.length > 0 ? `${selectedProperties.length} selected` : "Select properties"}
            </div>
            <div tabIndex={0} className="dropdown-content bg-black z-[1] menu p-2 shadow rounded-box w-56">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary "
                    checked={selectedProperties.length === propertyOptions.length}
                    onChange={toggleSelectAll}
                  />
                  <span className="label-text">Select All</span>
                </label>
              </div>
              {propertyOptions.map((option) => (
                <div key={option.value} className="form-control">
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedProperties.includes(option.value)}
                      onChange={() => handlePropertyChange(option.value)}
                    />
                    <span className="label-text">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(97vh-100px)]">
          {selectedProperties.includes("Engine Fuel Level") && (
            <div className="min-h-[400px] bg-base-200">
              <EngineFuelLevelLineChart fuelLevelData={fuelLevelData} />
            </div>
          )}
          {selectedProperties.includes("Engine Speed") && (
            <div className="min-h-[400px] bg-base-200">
              <EngineSpeedLineChart value={engineSpeedData} />
            </div>
          )}
          {selectedProperties.includes("Generator Current") && (
            <div className="min-h-[400px] bg-base-200">
              <GeneratorCurrentLineChart value={currentData} />
            </div>
          )}
          {selectedProperties.includes("Generator Voltage") && (
            <div className="min-h-[400px] bg-base-200">
              <GeneratorVoltageLineChart value={voltageData} />
            </div>
          )}
          {selectedProperties.includes("Oil Pressure") && (
            <div className="min-h-[400px] bg-base-200">
              <OilPressureLineChart value={oilPressureData} />
            </div>
          )}
          {selectedProperties.includes("Battery Charge") && (
            <div className="min-h-[400px] bg-base-200">
              <BatteryChargeLineChart value={batteryData} />
            </div>
          )}

          {selectedProperties.includes("PDM") && (
            <div className="min-h-[400px] bg-base-200">
              <PDMLineChart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
