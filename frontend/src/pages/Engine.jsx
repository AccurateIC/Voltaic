import { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { FaBatteryThreeQuarters, FaOilCan } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";
import { PanelResizeHandle, PanelGroup, Panel } from "react-resizable-panels";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus.ts";
import { MdEnergySavingsLeaf } from "react-icons/md";

// #fff627

const EngineRPM = ({ engineRpmDetails }) => {
  console.log(engineRpmDetails);
  let engineRpm;
  if (!engineRpmDetails[0]) engineRpm = 0;
  else engineRpm = engineRpmDetails[0].propertyValue;
  const unit = engineRpmDetails[0]?.gensetProperty?.physicalQuantity?.unitSymbol;
  if (unit) console.log(unit.toUpperCase());

  return (
    <div className="card bg-base-200 h-full w-full flex flex-col">
      <div className="card-body min-h-0 min-w-0 overflow-auto flex flex-col">
        <h2 className="card-title text-base-content">
          {engineRpmDetails[0]?.gensetProperty?.readablePropertyName || "Engine Speed"}
        </h2>
        <div className="flex items-center justify-center h-full w-full">
          <GaugeComponent
            minValue={0}
            maxValue={2500}
            arc={{
              subArcs: [
                { limit: 500, color: "#5BE12C", showTick: true },
                { limit: 1000, color: "#F5CD19", showTick: true },
                { limit: 1500, color: "#F58B19", showTick: true },
                { limit: 2000, color: "#EA4228", showTick: true },
                { limit: 2500, color: "#EA4228", showTick: true },
              ],
            }}
            labels={{
              valueLabel: {
                style: { color: "#000" },
                formatTextValue: (value) => `${value} ${unit?.toUpperCase() || "RPM"} `,
              }, // For the central value
              tickLabels: { defaultTickValueConfig: { style: { fill: "#6a7282" } } }, // For the tick labels (500, 1000, etc)
            }}
            value={engineRpm}
            style={{
              width: "100%",
              maxWidth: "85%",
              maxHeight: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const VerticalFuelLevelIndicator = ({ fuelDetails }) => {
  let fuelLevel;
  if (!fuelDetails[0]) fuelLevel = 0;
  else fuelLevel = fuelDetails[0].propertyValue;

  const maxFuelLevel = 60; // Changed to 60L
  const fuelLevelPercentage = (fuelLevel / maxFuelLevel) * 100;

  // Get fuel status color
  const getFuelStatusColor = () => {
    if (fuelLevel >= 40) return "#9be4b4";
    if (fuelLevel >= 20) return "#fff627";
    return "#ff0000"; // critical
  };

  // Generate measurement marks
  const measurementMarks = [...Array(7)].map((_, index) => {
    const level = (6 - index) * 10; // Will create marks at 60, 50, 40, 30, 20, 10, 0
    return (
      <div
        key={level}
        className="absolute w-full flex items-center"
        // style={{ bottom: `${(level / maxFuelLevel) * 100}%` }}
        style={{
          // Added a 10px offset to shift marks down and adjusted calculation
          bottom: `calc(${(level / maxFuelLevel) * 100}% - 10px)`,
          left: "60px",
        }}>
        {/* Line mark */}
        <div className="w-3 h-[2px] bg-base-content"></div>
        {/* Level number */}
        <span className="text-xs text-base-content ml-1">{level}L</span>
      </div>
    );
  });

  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto flex flex-col items-center">
        <h2 className="card-title text-base-content mb-4">Fuel Level</h2>

        {/* Fuel gauge container with padding for marks */}
        <div className="relative h-full flex items-center">
          {/* Measurement marks container */}
          <div className="relative w-24 h-full flex items-center">
            {/* Beaker/pill container */}
            <div className="relative w-16 h-full bg-base-200 rounded-full border-2 border-base-content mx-auto">
              {/* Measurement marks */}
              <div className="">{measurementMarks}</div>

              {/* Fuel level indicator */}
              <div
                className={`absolute bottom-0 w-full rounded-b-full transition-all duration-300 ease-in-out`}
                style={{ height: `${fuelLevelPercentage}%`, backgroundColor: getFuelStatusColor() }}
              />

              {/* Current fuel level text
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base-content font-bold text-lg">{fuelLevel}L</span>
              </div>
                */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({ propertyName, propertyValue, PropertyIcon, propertyUnit }) => {
  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0">
        <h2 className="card-title text-base-content">{propertyName}</h2>
        <div className="flex flex-col items-center justify-center h-full">
          {PropertyIcon && (
            <div className="text-success/20 text-9xl mb-10 flex items-center justify-center">
              <PropertyIcon className="w-full h-full" />
            </div>
          )}
          <div className="text-base-content font-semibold text-4xl">
            {propertyValue} {propertyUnit && <span>{propertyUnit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Engine = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await fetchLatestArchiveData();
    })();
  });

  const fetchLatestArchiveData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getLatest`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      console.log("Fetched data:", data);
      setArchiveData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      // toast.error("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await fetchLatestArchiveData();
    })();
  }, []);

  useEffect(() => {
    console.log(
      "84646",
      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engChargeAltVolts")[0]?.gensetProperty
        ?.readablePropertyName
    );
  }, [archiveData]);

  return (
    <div className="h-full w-full min-h-0 min-w-0">
      <PanelGroup direction="horizontal" className="gap-1">
        {/* */}
        <Panel defaultSize={80}>
          <PanelGroup direction="vertical" className="gap-1">
            {/* */}

            <Panel defaultSize={50}>
              <PanelGroup direction="horizontal" className="gap-1">
                <Panel defaultSize={50}>
                  <EngineRPM
                    engineRpmDetails={archiveData.filter((entry) => entry.gensetProperty.propertyName === "engSpeedDisplay")}
                  />
                </Panel>
                <PanelResizeHandle />
                <Panel defaultSize={50}>
                  <PropertyCard
                    propertyName={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "genTotalVA")[0]?.gensetProperty
                        ?.readablePropertyName || "Generator Power Output"
                    }
                    propertyValue={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "genTotalVA")[0]?.propertyValue
                    }
                    PropertyIcon={MdEnergySavingsLeaf}
                    propertyUnit={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "genTotalVA")[0]?.gensetProperty
                        .physicalQuantity.unitSymbol
                    }
                  />
                </Panel>
              </PanelGroup>
            </Panel>
            {/* */}
            <PanelResizeHandle />
            {/* */}
            <Panel>
              <PanelGroup direction="horizontal" className="gap-1">
                <Panel>
                  {/* Engine Oil Pressure */}
                  <PropertyCard
                    propertyName={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engOilPress")[0]?.gensetProperty
                        ?.readablePropertyName || "Engine Oil Pressure"
                    }
                    propertyValue={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engOilPress")[0]?.propertyValue
                    }
                    PropertyIcon={FaOilCan}
                    propertyUnit={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engOilPress")[0]?.gensetProperty
                        .physicalQuantity.unitSymbol
                    }
                  />
                </Panel>
                <PanelResizeHandle />
                <Panel>
                  {/* Charge Alt Voltage */}
                  <PropertyCard
                    propertyName={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engChargeAltVolts")[0]
                        ?.gensetProperty?.readablePropertyName || "Engine Charging Alternator Voltage"
                    }
                    propertyValue={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engChargeAltVolts")[0]
                        ?.propertyValue
                    }
                    PropertyIcon={GiElectric}
                    propertyUnit={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engChargeAltVolts")[0]
                        ?.gensetProperty.physicalQuantity.unitSymbol
                    }
                  />
                </Panel>
                <PanelResizeHandle />
                <Panel>
                  {/* Battery Voltage */}
                  <PropertyCard
                    propertyName={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engBatteryVolts")[0]
                        ?.gensetProperty?.readablePropertyName || "Engine Battery Voltage"
                    }
                    propertyValue={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engBatteryVolts")[0]
                        ?.propertyValue
                    }
                    PropertyIcon={FaBatteryThreeQuarters}
                    propertyUnit={
                      archiveData.filter((entry) => entry.gensetProperty.propertyName === "engBatteryVolts")[0]
                        ?.gensetProperty.physicalQuantity.unitSymbol
                    }
                  />
                </Panel>
              </PanelGroup>
            </Panel>
            {/* */}
          </PanelGroup>
        </Panel>

        {/* */}
        <PanelResizeHandle />
        {/* */}

        <Panel>
          <VerticalFuelLevelIndicator
            fuelDetails={archiveData.filter((entry) => entry.gensetProperty.propertyName === "engFuelLevelUnits")}
          />
        </Panel>
        {/* */}
      </PanelGroup>
    </div>
  );
};

export default Engine;
