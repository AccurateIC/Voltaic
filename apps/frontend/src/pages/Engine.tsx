// frontend/src/pages/Engine.tsx
import { useEffect, useMemo, useRef } from "react";
import { type Archive } from "../types/archive.types";
import GaugeComponent from "react-gauge-component";
import { FaBatteryThreeQuarters, FaOilCan } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";
import { MdEnergySavingsLeaf } from "react-icons/md";
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

  // Change arc colors based on anomaly state
  const arcColors = isAnomaly ? [
    { limit: 2500, color: "#EA4228", showTick: true } // Red when anomaly
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
  if (isLoading || propertyValue === undefined || propertyValue === null) {
    return <div className="w-full h-full min-h-[200px]"><Skeleton type="stat" /></div>;
  }
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
            {propertyValue} <span className="text-lg md:text-2xl font-normal block md:inline">{propertyUnit}</span>
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

  // ✅ 7.1 — single Map instead of 6 separate .filter() calls
  const dataMap = useMemo(() => {
    const map = new Map<string, Archive>();
    if (!latestData) return map;
    for (const entry of latestData) {
      map.set(entry.gensetProperty.propertyName, entry);
    }
    return map;
  }, [latestData]);

  const engineRpmData   = useMemo(() => { const e = dataMap.get("engSpeedDisplay");    return e ? [e] : []; }, [dataMap]);
  const powerOutputData = useMemo(() => { const e = dataMap.get("genTotalVA");          return e ? [e] : []; }, [dataMap]);
  const oilPressureData = useMemo(() => { const e = dataMap.get("engOilPress");         return e ? [e] : []; }, [dataMap]);
  const altVoltageData  = useMemo(() => { const e = dataMap.get("engChargeAltVolts");   return e ? [e] : []; }, [dataMap]);
  const batteryVoltageData = useMemo(() => { const e = dataMap.get("engBatteryVolts");  return e ? [e] : []; }, [dataMap]);
  const fuelLevelData   = useMemo(() => { const e = dataMap.get("engFuelLevelUnits");   return e ? [e] : []; }, [dataMap]);
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

  // Removed isLoading early return so that individual components show their proper skeletons

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden p-4">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-full">
        {/* Main Gauges Area */}
       <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Row */}
          <EngineRPM
            engineRpmDetails={engineRpmData}
            isLoading={isLoading}
          />
          <PropertyCard
            propertyName={
              powerOutputData[0]
                ?.gensetProperty?.readablePropertyName || "Generator Power Output"
            }
            propertyValue={
              powerOutputData[0]
                ?.propertyValue
            }
            PropertyIcon={MdEnergySavingsLeaf}
            propertyUnit={
              powerOutputData[0]
                ?.gensetProperty.physicalQuantity.unitSymbol
            }
            isAnomaly={powerOutputData[0]?.isAnomaly || false}
            isLoading={isLoading}
          />

          {/* Bottom Row - 3 small cards on desktop, 1 column on mobile */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PropertyCard
              propertyName={
                oilPressureData[0]
                  ?.gensetProperty?.readablePropertyName || "Oil Pressure"
              }
              propertyValue={
                oilPressureData[0]
                  ?.propertyValue
              }
              PropertyIcon={FaOilCan}
              propertyUnit={
                oilPressureData[0]
                  ?.gensetProperty.physicalQuantity.unitSymbol
              }
              isAnomaly={oilPressureData[0]?.isAnomaly || false}
              isLoading={isLoading}
            />
            <PropertyCard
              propertyName={
                altVoltageData[0]
                  ?.gensetProperty?.readablePropertyName || "Alt Voltage"
              }
              propertyValue={
                altVoltageData[0]
                  ?.propertyValue
              }
              PropertyIcon={GiElectric}
              propertyUnit={
                altVoltageData[0]
                  ?.gensetProperty.physicalQuantity.unitSymbol
              }
              isAnomaly={altVoltageData[0]?.isAnomaly || false}
              isLoading={isLoading}
            />
            <PropertyCard
              propertyName={
                batteryVoltageData[0]
                  ?.gensetProperty?.readablePropertyName || "Battery Volts"
              }
              propertyValue={
                batteryVoltageData[0]
                  ?.propertyValue
              }
              PropertyIcon={FaBatteryThreeQuarters}
              propertyUnit={
                batteryVoltageData[0]
                  ?.gensetProperty.physicalQuantity.unitSymbol
              }
              isAnomaly={batteryVoltageData[0]?.isAnomaly || false}
              isLoading={isLoading}
            />
          </div>

        </div>

        {/* Side Area for Fuel */}
        <div className="md:col-span-1">
          <VerticalFuelLevelIndicator
            fuelDetails={fuelLevelData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Engine;
