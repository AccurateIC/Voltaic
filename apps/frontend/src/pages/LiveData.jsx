import { useEffect, useState } from "react";
import { EngineFuelLevelLineChart } from "../components/charts/EngineFuelLevelLineChart.tsx";
import { EngineSpeedLineChart } from "../components/charts/EngineSpeedLineChart.tsx";
import { GeneratorVoltageLineChart } from "../components/charts/GeneratorVoltageLineChart.tsx";
import { GeneratorCurrentLineChart } from "../components/charts/GeneratorCurrentLineChart.tsx";
import { OilPressureLineChart } from "../components/charts/OilPressureLineChart.tsx";
import { BatteryChargeLineChart } from "../components/charts/BatteryChargeLineChart.tsx";
import { useMessageBus } from "../lib/MessageBus.ts";
import { FaFilter } from "react-icons/fa";
import { PDMLineChart } from "../components/charts/PDMLineChart.tsx";
import { GenericAnimatedModal } from "../components/GenericAnimatedModal.tsx";
import { tuyau } from "../lib/Tuyau";

export const LiveData = () => {
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

  const [selectedTimeRange, setSelectedTimeRange] = useState();
  const [pdmData, setPdmData] = useState([]);
  const [pdmDataForGraph, setPdmDataForGraph] = useState([]);
  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [isPdmError, setIsPdmError] = useState(false);
  const [pdmErrorMessage, setPdmErrorMessage] = useState("");

  const [batteryData, setBatteryData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [voltageData, setVoltageData] = useState([]);
  const [fuelLevelData, setFuelLevelData] = useState([]);
  const [engineSpeedData, setEngineSpeedData] = useState([]);
  const [oilPressureData, setOilPressureData] = useState([]);

  const [showGraph, setShowGraph] = useState(false);

  const [selectedChart, setSelectedChart] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedProperties, setSelectedProperties] = useState([
    "Engine Fuel Level",
    "Engine Speed",
    "Generator Current",
    "Generator Voltage",
    "Oil Pressure",
    "Battery Charge",
    "PDM",
  ]);

  const handleChartClick = (chartType) => {
    setSelectedChart(chartType);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedChart(null);
    setIsModalOpen(false);
  };

  const generateEmptyDataPoints = (data, timeRange) => {
    if (data.length === 0) return [];

    const now = new Date();
    let startTime;

    switch (timeRange) {
      case "15 Minutes":
        startTime = new Date(now - 15 * 60 * 1000);
        break;
      case "30 Minutes":
        startTime = new Date(now - 30 * 60 * 1000);
        break;
      case "01 Hour":
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case "24 Hours":
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 15 * 60 * 1000);
    }

    // Sort data by timestamp (oldest first)
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    //check if all timerange data  available
    const earliestDataTime = new Date(sortedData[0].timestamp);

    if (earliestDataTime <= startTime) {
      return sortedData;
    }

    // Calculate how many minutes are missing at the beginning
    const missingMinutes = Math.ceil((earliestDataTime - startTime) / (60 * 1000));

    // Generate empty data points for the missing period
    const emptyDataPoints = [];
    for (let i = 0; i < missingMinutes; i++) {
      const emptyTime = new Date(startTime.getTime() + i * 60 * 1000);
      emptyDataPoints.push({
        propertyValue: 0,
        timestamp: emptyTime.toISOString(),
        isAnomaly: false,
      });
    }

    return [...emptyDataPoints, ...sortedData];
  };

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getReportData();
    })();
  });

  const calculateTimeRange = (timeRange) => {
    const now = new Date();
    let fromDate;
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
      case "24 Hours":
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
    const now = new Date();
    const hours = 2;
    const from = new Date(now - hours * 60 * 60 * 1000).toISOString();
    const to = now.toISOString();
    // const { from, to } = calculateTimeRange(selectedTimeRange);

    try {
      const { data, error } = await tuyau.archive.getBetween.$get({
        query: { from, to }
      });
      if (!error) {
        const l1Voltage = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL1Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const l2Voltage = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL2Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const l3Voltage = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL3Volts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const l1Current = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL1Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const l2Current = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL2Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const l3Current = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "genL3Current")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            }))
        );

        const engineFuelLevel = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "engFuelLevelUnits")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
              isAnomaly: item.isAnomaly,
            }))
        );

        const engineSpeed = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "engSpeedDisplay")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
            }))
        );

        const oilPress = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "engOilPress")
            .map((item) => ({
              timestamp: item.timestamp,
              propertyValue: item.propertyValue,
            }))
        );

        const batteryVolts = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "engBatteryVolts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })),
          selectedTimeRange
        );

        const chargeAltVolts = generateEmptyDataPoints(
          data
            .filter((item) => item.gensetProperty.propertyName === "engChargeAltVolts")
            .map((item) => ({
              propertyValue: item.propertyValue,
              timestamp: item.timestamp,
              isAnomaly: item.isAnomaly,
            })),
          selectedTimeRange
        );

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
    try {
      const { data, error } = await tuyau.pdm.getRecentActual.$get();
      if (error) {
        console.log("Error fetching PDM data", error);
        return;
      }
      setPdmData(data);
    } catch (error) {
      console.log("Error fetching data", error);
    }
  };

  useEffect(() => {
    // console.log("pdm data changed", pdmData);

    // transform data for plotting graph
    const formattedData = pdmData.map((item) => {
      return {
        timestamp: item.timestamp,
        value: item.value,
        actual: item.pdmDataKind.kind === "actual" ? item.value : null,
        forecast: item.pdmDataKind.kind === "forecasted" ? item.value : null,
        sensorProperty: item.sensorProperty.propertyName,
        unit: item.sensorProperty.unit,
      };
    });
    // formattedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setPdmDataForGraph(formattedData);

    setIsPdmLoading(false);
  }, [pdmData]);

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await getReportData();
    })();
  }, []);

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
          timestamp: batteryItem.timestamp,
          batteryVolts: batteryItem.propertyValue,
          chargeAltVolts: chargeAltItem ? chargeAltItem.propertyValue : null,
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
        return {
          timestamp: l1Item.timestamp,
          L1: l1Item.propertyValue,
          L2: l2Item ? l2Item.propertyValue : null,
          L3: l3Item ? l3Item.propertyValue : null,
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

        return {
          timestamp: l1Item.timestamp,
          L1: l1Item.propertyValue,
          L2: l2Item ? l2Item.propertyValue : null,
          L3: l3Item ? l3Item.propertyValue : null,
        };
      });

      setVoltageData(newDataVoltage);
    }
    if (Array.isArray(stats.engineFuelLevel) && stats.engineFuelLevel.length > 0) {
      setFuelLevelData(stats.engineFuelLevel);
    }

    if (Array.isArray(stats.engineSpeed) && stats.engineSpeed.length > 0) {
      setEngineSpeedData(stats.engineSpeed);
    }

    if (Array.isArray(stats.oilPress) && stats.oilPress.length > 0) {
      setOilPressureData(stats.oilPress);
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
        {/* Property Filter */}
        <div className="flex items-center">
          <div className="font-semibold tex-md">Properties: </div>
          <div className="dropdown dropdown-bottom">
            <div tabIndex={0} role="button" className="btn btn-neutral w-56">
              <FaFilter className="mr-2" />
              {selectedProperties.length > 0 ? `${selectedProperties.length} Property selected` : "Select properties"}
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
        {/* <div className="flex items-center">
          <div className="w-25 font-semibold tex-md">Time:</div>
          <select 
            className="select select-neutral font-semibold text-md bg-black text-white" 
            value={selectedTimeRange} 
            onChange={handleTimefilter}
          >
            <option value="15 Minutes">15 Minutes</option>
            <option value="30 Minutes">30 Minutes</option>
            <option value="01 Hour">01 Hour</option>
            <option value="24 Hours">24 Hours</option>
          </select>
        </div> */}
      </div>

      <div className="py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(97vh-100px)]">
          {selectedProperties.includes("Engine Fuel Level") && (
            <div className="h-[410px] bg-base-200 rounded-lg cursor-pointer" onClick={() => handleChartClick("fuelLevel")}>
              <EngineFuelLevelLineChart fuelLevelData={fuelLevelData} />
            </div>
          )}
          {selectedProperties.includes("Engine Speed") && (
            <div className="h-[410px] bg-base-200 rounded-lg cursor-pointer" onClick={() => handleChartClick("engineSpeed")}>
              <EngineSpeedLineChart value={engineSpeedData} />
            </div>
          )}
          {selectedProperties.includes("Generator Current") && (
            <div
              className="h-[410px] bg-base-200 rounded-lg cursor-pointer"
              onClick={() => handleChartClick("generatorCurrent")}>
              <GeneratorCurrentLineChart value={currentData} />
            </div>
          )}
          {selectedProperties.includes("Generator Voltage") && (
            <div
              className="h-[410px] bg-base-200 rounded-lg cursor-pointer"
              onClick={() => handleChartClick("generatorVoltage")}>
              <GeneratorVoltageLineChart value={voltageData} />
            </div>
          )}
          {selectedProperties.includes("Oil Pressure") && (
            <div className="h-[410px] bg-base-200 rounded-lg cursor-pointer" onClick={() => handleChartClick("oilPressure")}>
              <OilPressureLineChart value={oilPressureData} />
            </div>
          )}
          {selectedProperties.includes("Battery Charge") && (
            <div
              className="h-[410px] bg-base-200 rounded-lg cursor-pointer"
              onClick={() => handleChartClick("batteryCharge")}>
              <BatteryChargeLineChart value={batteryData} />
            </div>
          )}
          {selectedProperties.includes("PDM") && (
            <div className="h-[410px] bg-base-200 rounded-lg cursor-pointer" onClick={() => handleChartClick("pdm")}>
              <PDMLineChart value={pdmDataForGraph} />
            </div>
          )}
        </div>
      </div>

      <GenericAnimatedModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="h-full w-full">
          {selectedChart === "fuelLevel" && <EngineFuelLevelLineChart fuelLevelData={fuelLevelData} />}
          {selectedChart === "engineSpeed" && <EngineSpeedLineChart value={engineSpeedData} />}
          {selectedChart === "generatorCurrent" && <GeneratorCurrentLineChart value={currentData} />}
          {selectedChart === "generatorVoltage" && <GeneratorVoltageLineChart value={voltageData} />}
          {selectedChart === "oilPressure" && <OilPressureLineChart value={oilPressureData} />}
          {selectedChart === "batteryCharge" && <BatteryChargeLineChart value={batteryData} />}
          {selectedChart === "pdm" && <PDMLineChart value={pdmDataForGraph} />}
        </div>
      </GenericAnimatedModal>
    </div>
  );
};

export default LiveData;
