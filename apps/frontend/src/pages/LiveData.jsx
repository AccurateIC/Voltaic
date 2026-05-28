import React, { useEffect, useMemo, useRef, useState } from "react";
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
import Skeleton from "../components/Skeleton";
import SelectAllCheckboxPopup from "../components/SelectAllCheckboxPopup";

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

  const [pdmData, setPdmData] = useState([]);
  
 

  const archiveTimeoutRef = useRef(null);
  const pdmTimeoutRef = useRef(null);
  const [isInitialArchiveLoad, setIsInitialArchiveLoad] = useState(true);
  const isInitialArchiveLoadRef = useRef(true);
 const [selectedChart, setSelectedChart] = useState(null);
const [activeChart, setActiveChart] = useState(null); // for inline toolbar
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

 const generateEmptyDataPoints = (data) => {
  if (data.length === 0) return [];

  const now = new Date();
  const startTime = new Date(now - 15 * 60 * 1000);

  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const earliestDataTime = new Date(sortedData[0].timestamp);

  if (earliestDataTime <= startTime) {
    return sortedData;
  }

  const missingMinutes = Math.ceil((earliestDataTime - startTime) / (60 * 1000));

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
    if (!msg) return;

    if (archiveTimeoutRef.current) clearTimeout(archiveTimeoutRef.current);

    archiveTimeoutRef.current = setTimeout(() => {
      getArchiveReportData();
      archiveTimeoutRef.current = null;
    }, 500); // was 2000
  });

  useMessageBus("pdm", (msg) => {
    if (!msg) return;

    if (pdmTimeoutRef.current) clearTimeout(pdmTimeoutRef.current);

  pdmTimeoutRef.current = setTimeout(() => {
      getPdmReportData();
      pdmTimeoutRef.current = null;
    }, 500); // was 3000
  });

  // ✅ HELPER: Ensure data is always an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.records && Array.isArray(data.records)) return data.records;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };
const mergeUniqueByTimestamp = (oldData, newData) => {
  const mergedMap = new Map();
  oldData.forEach((item) => mergedMap.set(item.timestamp, item));
  newData.forEach((item) => mergedMap.set(item.timestamp, item));
  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  // ✅ keep only last 15 minutes to prevent infinite memory growth
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  return merged.filter((item) => item.timestamp >= cutoff);
};
  const PROPERTY_NAME_TO_BUCKET = {
    genL1Volts: "l1Voltage",
    genL2Volts: "l2Voltage",
    genL3Volts: "l3Voltage",
    genL1Current: "l1Current",
    genL2Current: "l2Current",
    genL3Current: "l3Current",
    engFuelLevelUnits: "engineFuelLevel",
    engSpeedDisplay: "engineSpeed",
    engOilPress: "oilPress",
    engBatteryVolts: "batteryVolts",
    engChargeAltVolts: "chargeAltVolts",
  };

 const fetchAllArchiveRecordsBetween = async (from, to) => {
  const { data, error } = await tuyau.archive.getBetween.$get({
    query: { from, to, loadAll: "true" },
  });
  if (error) return [];
  return ensureArray(data);
};

  const groupRecordsIntoBuckets = (records) => {
    const buckets = {
      l1Voltage: [],
      l2Voltage: [],
      l3Voltage: [],
      l1Current: [],
      l2Current: [],
      l3Current: [],
      engineFuelLevel: [],
      engineSpeed: [],
      oilPress: [],
      batteryVolts: [],
      chargeAltVolts: [],
    };

    for (const item of records) {
    const propertyName = item?.gensetProperty?.propertyName;
      const bucketKey = PROPERTY_NAME_TO_BUCKET[propertyName];
      if (!bucketKey) {
        continue;
      }
      buckets[bucketKey].push({
        propertyValue: item.propertyValue,
        timestamp: item.timestamp,
        isAnomaly: item.isAnomaly,
      });
    }

    return buckets;
  };

const getArchiveReportData = async () => {
const now = new Date();

let from;
if (isInitialArchiveLoadRef.current) {
  from = new Date(now - 15 * 60 * 1000).toISOString();
} else {
  from = new Date(now - 2 * 60 * 1000).toISOString();
}

const to = now.toISOString();
  try {
    const records = await fetchAllArchiveRecordsBetween(from, to);
    const buckets = groupRecordsIntoBuckets(records);

    const l1Voltage = generateEmptyDataPoints(buckets.l1Voltage);
    const l2Voltage = generateEmptyDataPoints(buckets.l2Voltage);
    const l3Voltage = generateEmptyDataPoints(buckets.l3Voltage);
    const l1Current = generateEmptyDataPoints(buckets.l1Current);
    const l2Current = generateEmptyDataPoints(buckets.l2Current);
    const l3Current = generateEmptyDataPoints(buckets.l3Current);
    const engineFuelLevel = generateEmptyDataPoints(buckets.engineFuelLevel);
    const engineSpeed = generateEmptyDataPoints(buckets.engineSpeed);
    const oilPress = generateEmptyDataPoints(buckets.oilPress);
    const batteryVolts = generateEmptyDataPoints(buckets.batteryVolts);
    const chargeAltVolts = generateEmptyDataPoints(buckets.chargeAltVolts);

    if (isInitialArchiveLoadRef.current) {  // ✅ using ref
      setStats((prev) => ({
        ...prev,
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
      }));

     isInitialArchiveLoadRef.current = false;
setIsInitialArchiveLoad(false);
    } else {
      setStats((prev) => ({
        ...prev,
        l1Voltage: mergeUniqueByTimestamp(prev.l1Voltage, l1Voltage),
        l2Voltage: mergeUniqueByTimestamp(prev.l2Voltage, l2Voltage),
        l3Voltage: mergeUniqueByTimestamp(prev.l3Voltage, l3Voltage),
        l1Current: mergeUniqueByTimestamp(prev.l1Current, l1Current),
        l2Current: mergeUniqueByTimestamp(prev.l2Current, l2Current),
        l3Current: mergeUniqueByTimestamp(prev.l3Current, l3Current),
        engineFuelLevel: mergeUniqueByTimestamp(prev.engineFuelLevel, engineFuelLevel),
        engineSpeed: mergeUniqueByTimestamp(prev.engineSpeed, engineSpeed),
        oilPress: mergeUniqueByTimestamp(prev.oilPress, oilPress),
        batteryVolts: mergeUniqueByTimestamp(prev.batteryVolts, batteryVolts),
        chargeAltVolts: mergeUniqueByTimestamp(prev.chargeAltVolts, chargeAltVolts),
      }));
    }
  } catch (error) {
  
  }
};

const getPdmReportData = async (page = 1) => {
  try {
    const { data, error } = await tuyau.pdm.getRecentActual.$get({
      query: { page, limit: 500 },
    });
    if (error) {
      return;
    }
    const pdmRecords = ensureArray(data);
    setPdmData(pdmRecords);
  } catch (error) {
   
  }
};

 const pdmDataForGraph = useMemo(() => {
  return pdmData.map((item) => ({
    timestamp: item.timestamp,
    value: item.value,
    actual: item.pdmDataKind.kind === "actual" ? item.value : null,
    forecast: item.pdmDataKind.kind === "forecasted" ? item.value : null,
    sensorProperty: item.sensorProperty.propertyName,
    unit: item.sensorProperty.unit,
    hasNotification: item.maintenanceNotificationId ? true : false,
  }));
}, [pdmData]);

useEffect(() => {
  (async () => {
    await Promise.all([getArchiveReportData(), getPdmReportData()]);
  })();
}, []);

const batteryData = useMemo(() => {
  if (!stats.batteryVolts.length || !stats.chargeAltVolts.length) return [];
  const chargeAltMap = new Map(stats.chargeAltVolts.map((item) => [item.timestamp, item]));
  return stats.batteryVolts.map((batteryItem) => {
    const chargeAltItem = chargeAltMap.get(batteryItem.timestamp);
   return {
      timestamp: batteryItem.timestamp,
      batteryVolts: batteryItem.propertyValue,
      chargeAltVolts: chargeAltItem ? chargeAltItem.propertyValue : null,
      batteryIsAnomaly: batteryItem.isAnomaly,
      chargeAltIsAnomaly: chargeAltItem ? chargeAltItem.isAnomaly : false,
    };
  });
}, [stats.batteryVolts, stats.chargeAltVolts]);

const currentData = useMemo(() => {
  if (!stats.l1Current.length || !stats.l2Current.length || !stats.l3Current.length) return [];
  const l2CurrentMap = new Map(stats.l2Current.map((item) => [item.timestamp, item]));
  const l3CurrentMap = new Map(stats.l3Current.map((item) => [item.timestamp, item]));
return stats.l1Current.map((l1Item) => {
    const l2Item = l2CurrentMap.get(l1Item.timestamp);
    const l3Item = l3CurrentMap.get(l1Item.timestamp);
    return {
      timestamp: l1Item.timestamp,
      L1: l1Item.propertyValue,
      L2: l2Item ? l2Item.propertyValue : null,
      L3: l3Item ? l3Item.propertyValue : null,
      L1isAnomaly: l1Item.isAnomaly,
      L2isAnomaly: l2Item ? l2Item.isAnomaly : false,
      L3isAnomaly: l3Item ? l3Item.isAnomaly : false,
    };
  });
}, [stats.l1Current, stats.l2Current, stats.l3Current]);

const voltageData = useMemo(() => {
  if (!stats.l1Voltage.length || !stats.l2Voltage.length || !stats.l3Voltage.length) return [];
  const l2VoltageMap = new Map(stats.l2Voltage.map((item) => [item.timestamp, item]));
  const l3VoltageMap = new Map(stats.l3Voltage.map((item) => [item.timestamp, item]));
 return stats.l1Voltage.map((l1Item) => {
    const l2Item = l2VoltageMap.get(l1Item.timestamp);
    const l3Item = l3VoltageMap.get(l1Item.timestamp);
    return {
      timestamp: l1Item.timestamp,
      L1: l1Item.propertyValue,
      L2: l2Item ? l2Item.propertyValue : null,
      L3: l3Item ? l3Item.propertyValue : null,
      L1isAnomaly: l1Item.isAnomaly,
      L2isAnomaly: l2Item ? l2Item.isAnomaly : false,
      L3isAnomaly: l3Item ? l3Item.isAnomaly : false,
    };
  });
}, [stats.l1Voltage, stats.l2Voltage, stats.l3Voltage]);

const fuelLevelData = useMemo(() => stats.engineFuelLevel, [stats.engineFuelLevel]);
const engineSpeedData = useMemo(() => stats.engineSpeed, [stats.engineSpeed]);
const oilPressureData = useMemo(() => stats.oilPress, [stats.oilPress]);

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

  const chartCardClass =
    "min-h-[320px] md:min-h-[410px] bg-base-200 rounded-lg cursor-pointer flex flex-col overflow-hidden";

  const renderChartCard = (propertyLabel, chartType, data, chartNode, dependsOnArchiveLoad = true) => {
    if (!selectedProperties.includes(propertyLabel)) return null;

    const hasData = Array.isArray(data) && data.length > 0;
    const showLoading = dependsOnArchiveLoad ? isInitialArchiveLoad || !hasData : !hasData;
    const canOpenModal = dependsOnArchiveLoad ? !isInitialArchiveLoad && hasData : hasData;

    return (
  <div className={chartCardClass} onClick={() => {
    if (!canOpenModal) return;
   handleChartClick(chartType) // toggle
  }}>
        {showLoading ? (
          <div className="flex-1 w-full p-2">
            <Skeleton type="chart" />
          </div>
        ) : (
         <div className="flex-1 min-h-0">
 {chartNode}
</div>
        )}
      </div>
    );
  };

  return (
  <div className="h-full w-full flex flex-col gap-3 overflow-hidden px-4 py-4 md:px-6 md:py-5">
    <div className="flex flex-wrap gap-3 justify-end shrink-0">
  <div className="flex items-center gap-2 rounded-box px-2 py-1 bg-base-100/70 border border-base-content/10 w-full lg:w-auto">
    <div className="font-semibold text-sm whitespace-nowrap text-base-content/80">Properties</div>
    <SelectAllCheckboxPopup
      trigger={
        <div tabIndex={0} role="button" className="btn btn-sm btn-outline w-full lg:min-w-[220px] lg:w-auto justify-between">
                <span className="flex items-center gap-2">
                  <FaFilter />
                  {selectedProperties.length > 0 ? `${selectedProperties.length} selected` : "Select properties"}
                </span>
              </div>
            }
            widthClassName="w-[min(90vw,24rem)] max-w-[24rem]"
            selectAllChecked={selectedProperties.length === propertyOptions.length}
            onToggleSelectAll={toggleSelectAll}
            options={propertyOptions}
            getOptionChecked={(value) => selectedProperties.includes(value)}
            onToggleOption={(value) => handlePropertyChange(value)}
          />
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

   <div className="flex-1 min-h-0 overflow-y-auto pb-2">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {renderChartCard(
            "Engine Fuel Level",
            "fuelLevel",
            fuelLevelData,
            <EngineFuelLevelLineChart fuelLevelData={fuelLevelData} />
          )}
          {renderChartCard("Engine Speed", "engineSpeed", engineSpeedData, <EngineSpeedLineChart value={engineSpeedData} />)}
          {renderChartCard(
            "Generator Current",
            "generatorCurrent",
            currentData,
            <GeneratorCurrentLineChart value={currentData} />
          )}
          {renderChartCard(
            "Generator Voltage",
            "generatorVoltage",
            voltageData,
            <GeneratorVoltageLineChart value={voltageData} />
          )}
          {renderChartCard("Oil Pressure", "oilPressure", oilPressureData, <OilPressureLineChart value={oilPressureData} />)}
          {renderChartCard(
            "Battery Charge",
            "batteryCharge",
            batteryData,
            <BatteryChargeLineChart value={batteryData} />
          )}
          {renderChartCard("PDM", "pdm", pdmDataForGraph, <PDMLineChart value={pdmDataForGraph} />, false)}
        </div>
      </div>

      <GenericAnimatedModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="h-full w-full">
          {selectedChart === "fuelLevel" && <EngineFuelLevelLineChart fuelLevelData={fuelLevelData} showControls={true} />}
          {selectedChart === "engineSpeed" && <EngineSpeedLineChart value={engineSpeedData} showControls={true} />}
          {selectedChart === "generatorCurrent" && <GeneratorCurrentLineChart value={currentData} showControls={true} />}
          {selectedChart === "generatorVoltage" && <GeneratorVoltageLineChart value={voltageData} showControls={true} />}
          {selectedChart === "oilPressure" && <OilPressureLineChart value={oilPressureData} showControls={true} />}
          {selectedChart === "batteryCharge" && <BatteryChargeLineChart value={batteryData} showControls={true} />}
          {selectedChart === "pdm" && <PDMLineChart value={pdmDataForGraph} showControls={true} />}
        </div>
      </GenericAnimatedModal>
    </div>
  );
};

export default LiveData;