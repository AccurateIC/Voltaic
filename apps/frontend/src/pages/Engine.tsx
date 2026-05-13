// frontend/src/pages/Engine.tsx
import { useEffect, useMemo, useRef } from "react";
import { type Archive } from "../types/archive.types";
import GaugeComponent from "react-gauge-component";
import { FaBatteryThreeQuarters, FaOilCan, FaThermometerHalf } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";
import { MdEnergySavingsLeaf, MdCo2 } from "react-icons/md";
import { cn } from "../lib/Utils";
import { BACKEND_BASE_URL } from "../config/backend";
import Skeleton from "../components/Skeleton";
import { useLatestArchiveData } from "../hooks/useLatestArchiveData";
import { useLoggedInUserQuery } from "../hooks/useLoggedInUserQuery";






const EngineRPM = ({ engineRpmDetails, isLoading }) => {
  if (isLoading || !engineRpmDetails || engineRpmDetails.length === 0) {
    return <div className="w-full h-full min-h-[300px]"><Skeleton type="gauge" /></div>;
  }
  let engineRpm;
  let isAnomaly = false;
  if (!engineRpmDetails[0]) {
    engineRpm = 0;
    isAnomaly = false;
  } else {
    engineRpm = engineRpmDetails[0].propertyValue;
    isAnomaly = engineRpmDetails[0].isAnomaly;
  }
  const unit = engineRpmDetails[0]?.gensetProperty?.physicalQuantity?.unitSymbol;

  const arcColors = isAnomaly ? [
    { limit: 2500, color: "#EA4228", showTick: true }
  ] : [
    { limit: 500, color: "#5BE12C", showTick: true },
    { limit: 1000, color: "#F5CD19", showTick: true },
    { limit: 1500, color: "#F58B19", showTick: true },
    { limit: 2000, color: "#EA4228", showTick: true },
    { limit: 2500, color: "#EA4228", showTick: true },
  ];

  return (
    <div className={cn(
      "card h-full w-full flex flex-col shadow-sm transition-all duration-300",
      isAnomaly ? "bg-red-900 border-2 border-red-500" : "bg-base-200"
    )}>
      <div className="card-body p-4 md:p-6 min-h-0 min-w-0 overflow-auto flex flex-col">
        <h2 className={cn(
          "card-title text-lg md:text-2xl",
          isAnomaly ? "text-red-100" : "text-base-content"
        )}>
          {engineRpmDetails[0]?.gensetProperty?.readablePropertyName || "Engine Speed"}
          {isAnomaly && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">ANOMALY</span>}
        </h2>
        <div className="flex items-center justify-center grow w-full py-2">
          <GaugeComponent
            minValue={0}
            maxValue={2500}
            arc={{
              subArcs: arcColors,
            }}
            labels={{
              valueLabel: {
                style: { color: isAnomaly ? "#fff" : "#000", fontSize: "24px" },
                formatTextValue: (value) => `${value} ${unit?.toUpperCase() || "RPM"} `,
              },
              tickLabels: { defaultTickValueConfig: { style: { fill: isAnomaly ? "#fff" : "#6a7282" } } },
            }}
            value={engineRpm}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

const VerticalFuelLevelIndicator = ({ fuelDetails, isLoading }) => {
  if (isLoading || !fuelDetails || fuelDetails.length === 0) {
    return <div className="w-full h-full min-h-[400px]"><Skeleton type="fuel" /></div>;
  }
  let fuelLevel;
  let isAnomaly = false;
  if (!fuelDetails[0]) {
    fuelLevel = 0;
    isAnomaly = false;
  } else {
    fuelLevel = fuelDetails[0].propertyValue;
    isAnomaly = fuelDetails[0].isAnomaly;
  }

  const maxFuelLevel = 60;
  const fuelLevelPercentage = (fuelLevel / maxFuelLevel) * 100;

  const getFuelStatusColor = () => {
    if (isAnomaly) return "bg-red-500";
    if (fuelLevel >= 40) return "bg-success";
    if (fuelLevel >= 20) return "bg-warning";
    return "bg-error";
  };

  const measurementMarks = [...Array(7)].map((_, index) => {
    const level = (6 - index) * 10;
    return (
      <div
        key={level}
        className="absolute w-full flex items-center"
        style={{
          bottom: `calc(${(level / maxFuelLevel) * 100}% - 8px)`,
          left: "45px",
        }}
      >
        <div className="w-2 h-[1px] bg-base-content/50"></div>
        <span className="text-[10px] text-base-content/70 ml-1">{level}L</span>
      </div>
    );
  });

  return (
    <div className={cn(
      "card h-full w-full shadow-sm transition-all duration-300",
      isAnomaly ? "bg-red-900 border-2 border-red-500" : "bg-base-200"
    )}>
      <div className="card-body p-4 md:p-6 min-h-0 min-w-0 overflow-auto flex flex-col items-center">
        <h2 className={cn(
          "card-title text-lg md:text-2xl mb-2",
          isAnomaly ? "text-red-100" : "text-base-content"
        )}>
          Fuel Level
          {isAnomaly && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">ANOMALY</span>}
        </h2>
        <div className="relative grow flex items-center py-4">
          <div className="relative w-24 h-64 md:h-80 flex items-center">
            <div className={cn("relative w-14 md:w-16 h-full bg-base-300 rounded-full border border-base-content/20 mx-auto overflow-hidden transition-all duration-300",
              isAnomaly && "border-red-400"
            )}>
              <div
                className={cn(
                  `absolute bottom-0 w-full transition-all duration-300 ease-in-out`,
                  getFuelStatusColor()
                )}
                style={{ height: `${fuelLevelPercentage}%` }}
              />
            </div>
            <div className="absolute inset-0 z-10">{measurementMarks}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({ propertyName, propertyValue, PropertyIcon, propertyUnit, isAnomaly, isLoading }) => {
  if (isLoading) {
    return <div className="w-full h-full min-h-[200px]"><Skeleton type="stat" /></div>;
  }
  const displayValue = (propertyValue === undefined || propertyValue === null) ? "--" : propertyValue;
  return (
    <div className={cn(
      "card h-full w-full shadow-sm transition-all duration-300",
      isAnomaly ? "bg-red-900 border-2 border-red-500" : "bg-base-200"
    )}>
      <div className="card-body p-4 md:p-6 min-h-0 min-w-0 flex flex-col">
        <h2 className={cn(
          "card-title text-sm md:text-xl opacity-80",
          isAnomaly ? "text-red-100" : "text-base-content"
        )}>
          {propertyName}
          {isAnomaly && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">ANOMALY</span>}
        </h2>
        <div className="flex flex-col items-center justify-center grow py-2">
          {PropertyIcon && (
            <div className={cn(
              "text-6xl md:text-8xl mb-3 md:mb-5 flex items-center justify-center transition-all duration-300",
              isAnomaly ? "text-red-400" : "text-success/75"
            )}>
              <PropertyIcon className="w-full h-full" />
            </div>
          )}
          <div className={cn(
            "font-bold text-3xl md:text-5xl text-cente",
            isAnomaly ? "text-red-100" : "text-base-content"
          )}>
            {displayValue} <span className="text-lg md:text-2xl font-normal block md:inline">{propertyUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Engine = () => {
  const { latestData, isLoading } = useLatestArchiveData();
  const { data: sessionUser } = useLoggedInUserQuery();
  const mlNotifyOnce = useRef(false);

  const dataMap = useMemo(() => {
    const map = new Map<string, Archive>();
    if (!latestData) return map;
    for (const entry of latestData) {
      map.set(entry.gensetProperty.propertyName, entry);
    }
    return map;
  }, [latestData]);

  const engineRpmData      = useMemo(() => { const e = dataMap.get("engSpeedDisplay");    return e ? [e] : []; }, [dataMap]);
  const powerOutputData    = useMemo(() => { const e = dataMap.get("genTotalVA");          return e ? [e] : []; }, [dataMap]);
  const oilPressureData    = useMemo(() => { const e = dataMap.get("engOilPress");         return e ? [e] : []; }, [dataMap]);
  const altVoltageData     = useMemo(() => { const e = dataMap.get("engChargeAltVolts");   return e ? [e] : []; }, [dataMap]);
  const batteryVoltageData = useMemo(() => { const e = dataMap.get("engBatteryVolts");     return e ? [e] : []; }, [dataMap]);
  const fuelLevelData      = useMemo(() => { const e = dataMap.get("engFuelLevelUnits");   return e ? [e] : []; }, [dataMap]);
  // ── NEW: update property keys below to match your backend ──

const temperatureData = useMemo(() => { 
  const e = dataMap.get("temperature");
  return e ? [e] : []; 
}, [dataMap]);

const co2Data = useMemo(() => {
  const e = dataMap.get("co2_ppm");
  return e ? [e] : [];
}, [dataMap]); 

  useEffect(() => {
    if (!sessionUser || mlNotifyOnce.current) return;
    mlNotifyOnce.current = true;
    (async () => {
      try {
        await fetch(`${BACKEND_BASE_URL}/ml/notify-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...sessionUser, logged_in: true }),
        });
      } catch {
        // ML servers being down must never break the Engine page
      }
    })();
  }, [sessionUser]);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-5">

      {/* ── MOBILE ONLY (< md) ── single column, unchanged */}
      <div className="flex flex-col gap-4 md:hidden">
        <EngineRPM engineRpmDetails={engineRpmData} isLoading={isLoading} />
        <PropertyCard
          propertyName={powerOutputData[0]?.gensetProperty?.readablePropertyName || "Generator Power Output"}
          propertyValue={powerOutputData[0]?.propertyValue}
          PropertyIcon={MdEnergySavingsLeaf}
          propertyUnit={powerOutputData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={powerOutputData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
        <VerticalFuelLevelIndicator fuelDetails={fuelLevelData} isLoading={isLoading} />
        <PropertyCard
          propertyName={temperatureData[0]?.gensetProperty?.readablePropertyName || "Temperature"}
          propertyValue={temperatureData[0]?.propertyValue}
          PropertyIcon={FaThermometerHalf}
          propertyUnit={temperatureData[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "°C"}
          isAnomaly={temperatureData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
        <PropertyCard
          propertyName={oilPressureData[0]?.gensetProperty?.readablePropertyName || "Oil Pressure"}
          propertyValue={oilPressureData[0]?.propertyValue}
          PropertyIcon={FaOilCan}
          propertyUnit={oilPressureData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={oilPressureData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
        <PropertyCard
          propertyName={altVoltageData[0]?.gensetProperty?.readablePropertyName || "Alt Voltage"}
          propertyValue={altVoltageData[0]?.propertyValue}
          PropertyIcon={GiElectric}
          propertyUnit={altVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={altVoltageData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
        <PropertyCard
          propertyName={batteryVoltageData[0]?.gensetProperty?.readablePropertyName || "Battery Volts"}
          propertyValue={batteryVoltageData[0]?.propertyValue}
          PropertyIcon={FaBatteryThreeQuarters}
          propertyUnit={batteryVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={batteryVoltageData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
        <PropertyCard
          propertyName={co2Data[0]?.gensetProperty?.readablePropertyName || "CO₂"}
          propertyValue={co2Data[0]?.propertyValue}
          PropertyIcon={MdCo2}
          propertyUnit={co2Data[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "ppm"}
          isAnomaly={co2Data[0]?.isAnomaly || false}
          isLoading={isLoading}
        />
      </div>

      {/* ── TABLET ONLY (md → lg) ── 2 rows of 2, then new cards below */}
      <div className="hidden md:flex lg:hidden flex-col gap-4 h-auto">
        <div className="grid grid-cols-2 gap-4">
          <EngineRPM engineRpmDetails={engineRpmData} isLoading={isLoading} />
          <PropertyCard
            propertyName={powerOutputData[0]?.gensetProperty?.readablePropertyName || "Generator Power Output"}
            propertyValue={powerOutputData[0]?.propertyValue}
            PropertyIcon={MdEnergySavingsLeaf}
            propertyUnit={powerOutputData[0]?.gensetProperty.physicalQuantity.unitSymbol}
            isAnomaly={powerOutputData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <VerticalFuelLevelIndicator fuelDetails={fuelLevelData} isLoading={isLoading} />
          <PropertyCard
            propertyName={temperatureData[0]?.gensetProperty?.readablePropertyName || "Temperature"}
            propertyValue={temperatureData[0]?.propertyValue}
            PropertyIcon={FaThermometerHalf}
            propertyUnit={temperatureData[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "°C"}
            isAnomaly={temperatureData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PropertyCard
            propertyName={oilPressureData[0]?.gensetProperty?.readablePropertyName || "Oil Pressure"}
            propertyValue={oilPressureData[0]?.propertyValue}
            PropertyIcon={FaOilCan}
            propertyUnit={oilPressureData[0]?.gensetProperty.physicalQuantity.unitSymbol}
            isAnomaly={oilPressureData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
          <PropertyCard
            propertyName={altVoltageData[0]?.gensetProperty?.readablePropertyName || "Alt Voltage"}
            propertyValue={altVoltageData[0]?.propertyValue}
            PropertyIcon={GiElectric}
            propertyUnit={altVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
            isAnomaly={altVoltageData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PropertyCard
            propertyName={batteryVoltageData[0]?.gensetProperty?.readablePropertyName || "Battery Volts"}
            propertyValue={batteryVoltageData[0]?.propertyValue}
            PropertyIcon={FaBatteryThreeQuarters}
            propertyUnit={batteryVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
            isAnomaly={batteryVoltageData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
          <PropertyCard
            propertyName={co2Data[0]?.gensetProperty?.readablePropertyName || "CO₂"}
            propertyValue={co2Data[0]?.propertyValue}
            PropertyIcon={MdCo2}
            propertyUnit={co2Data[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "ppm"}
            isAnomaly={co2Data[0]?.isAnomaly || false}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── DESKTOP ONLY (≥ lg) ── 5 cols, 2 rows ── */}
      <div className="hidden lg:grid grid-cols-5 grid-rows-2 gap-4 h-full">

        {/* ── ROW 1 cols 1-2 ── Engine Speed wider for bigger gauge */}
        <div className="col-span-2">
          <EngineRPM engineRpmDetails={engineRpmData} isLoading={isLoading} />
        </div>

        {/* ── ROW 1 col 3 ── Generator Power Output */}
        <PropertyCard
          propertyName={powerOutputData[0]?.gensetProperty?.readablePropertyName || "Generator Power Output"}
          propertyValue={powerOutputData[0]?.propertyValue}
          PropertyIcon={MdEnergySavingsLeaf}
          propertyUnit={powerOutputData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={powerOutputData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

        {/* ── ROW 1 col 4 ── Temperature (NEW) */}
        <PropertyCard
          propertyName={temperatureData[0]?.gensetProperty?.readablePropertyName || "Temperature"}
          propertyValue={temperatureData[0]?.propertyValue}
          PropertyIcon={FaThermometerHalf}
          propertyUnit={temperatureData[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "°C"}
          isAnomaly={temperatureData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

        {/* ── ROWS 1+2 col 5 ── Fuel Level — original vertical bar, spans both rows */}
        <div className="row-span-2">
          <VerticalFuelLevelIndicator fuelDetails={fuelLevelData} isLoading={isLoading} />
        </div>

        {/* ── ROW 2 col 1 ── Engine Oil Pressure */}
        <PropertyCard
          propertyName={oilPressureData[0]?.gensetProperty?.readablePropertyName || "Oil Pressure"}
          propertyValue={oilPressureData[0]?.propertyValue}
          PropertyIcon={FaOilCan}
          propertyUnit={oilPressureData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={oilPressureData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

        <PropertyCard
          propertyName={altVoltageData[0]?.gensetProperty?.readablePropertyName || "Alt Voltage"}
          propertyValue={altVoltageData[0]?.propertyValue}
          PropertyIcon={GiElectric}
          propertyUnit={altVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={altVoltageData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

        <PropertyCard
          propertyName={batteryVoltageData[0]?.gensetProperty?.readablePropertyName || "Battery Volts"}
          propertyValue={batteryVoltageData[0]?.propertyValue}
          PropertyIcon={FaBatteryThreeQuarters}
          propertyUnit={batteryVoltageData[0]?.gensetProperty.physicalQuantity.unitSymbol}
          isAnomaly={batteryVoltageData[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

        {/* ── ROW 2 col 4 ── CO₂ (NEW) */}
        <PropertyCard
          propertyName={co2Data[0]?.gensetProperty?.readablePropertyName || "CO₂"}
          propertyValue={co2Data[0]?.propertyValue}
          PropertyIcon={MdCo2}
          propertyUnit={co2Data[0]?.gensetProperty?.physicalQuantity?.unitSymbol || "ppm"}
          isAnomaly={co2Data[0]?.isAnomaly || false}
          isLoading={isLoading}
        />

      </div>

    </div>
  );
};

export default Engine;