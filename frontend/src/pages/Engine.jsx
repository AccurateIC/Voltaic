import { useEffect, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { FaBatteryThreeQuarters, FaOilCan } from "react-icons/fa";
import { GiElectric } from "react-icons/gi";
import { PanelResizeHandle, PanelGroup, Panel } from "react-resizable-panels";
import { toast } from "sonner";
import { useMessageBus } from "../lib/MessageBus";

const DummyCard = () => {
  return (
    <div className="card bg-base-300 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto">
        <h2 className="card-title text-base-content">Card Title</h2>
        <p className="overflow-auto text-base-content">
          A card component has a figure, a body part, and inside body there are title and actions parts
        </p>
      </div>
    </div>
  );
};

const EngineRPM = ({ engineRpmDetails }) => {
  let engineRpm;
  if (!engineRpmDetails[0]) engineRpm = 0;
  else engineRpm = engineRpmDetails[0].propertyValue;

  return (
    <div className="card bg-base-200 h-full w-full flex flex-col">
      <div className="card-body min-h-0 min-w-0 overflow-auto flex flex-col">
        <h2 className="card-title text-base-content">Engine RPM</h2>
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
              valueLabel: { style: { color: "#000" } }, // For the central value
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

const OilPressureCard = ({ oilPressureDetails }) => {
  let oilPressure;
  if (!oilPressureDetails[0]) oilPressure = 0;
  else oilPressure = oilPressureDetails[0].propertyValue;

  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto">
        <h2 className="card-title text-base-content">Oil Pressure</h2>
        <div className="flex flex-col items-center justify-center h-full ">
          <div className="text-success/20 h-42 mb-10">
            <FaOilCan className="w-full h-full" />
          </div>
          <div className="text-base-content font-semibold text-4xl">{oilPressure} bar</div>
        </div>
      </div>
    </div>
  );
};

const ChargeAltVoltageCard = ({ altVoltageDetails }) => {
  let altVoltage;
  if (!altVoltageDetails[0]) altVoltage = 0;
  else altVoltage = altVoltageDetails[0].propertyValue;

  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto">
        <h2 className="card-title text-base-content">Charge Alt Voltage</h2>
        <div className="flex flex-col items-center justify-center h-full ">
          <div className="text-success/20 h-42 mb-10">
            <GiElectric className="w-full h-full" />
          </div>
          <div className="text-base-content font-semibold text-4xl">{altVoltage} volt</div>
        </div>
      </div>
    </div>
  );
};

const BatteryVoltageCard = ({ batteryVoltageDetails }) => {
  let batteryVoltage;
  if (!batteryVoltageDetails[0]) batteryVoltage = 0;
  else batteryVoltage = batteryVoltageDetails[0].propertyValue;
  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto">
        <h2 className="card-title text-base-content">Battery Voltage</h2>
        <div className="flex flex-col items-center justify-center h-full ">
          <div className="text-success/20 h-42 mb-10">
            <FaBatteryThreeQuarters className="w-full h-full" />
          </div>
          <div className="text-base-content font-semibold text-4xl">{batteryVoltage} volt</div>
        </div>
      </div>
    </div>
  );
};

const VerticalFuelLevelIndicator = ({ fuelDetails }) => {
  let fuelLevel;
  if (!fuelDetails[0]) fuelLevel = 0;
  else fuelLevel = fuelDetails[0].propertyValue;

  const maxFuelLevel = 60;
  const fuelLevelPercentage = (fuelLevel / maxFuelLevel) * 100;

  // Get fuel status color
  const getFuelStatusColor = () => {
    if (fuelLevelPercentage >= 75) return "bg-success/30";
    if (fuelLevelPercentage >= 40) return "bg-warning/30";
    if (fuelLevelPercentage >= 20) return "bg-orange-500/30";
    return "bg-error/30";
  };

  return (
    <div className="card bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto flex flex-col items-center">
        <h2 className="card-title text-base-content mb-4">Fuel Level</h2>

        <div className="flex flex-row items-center gap-4">
          {/* Range Labels */}
          <div className="flex flex-col justify-between h-170 text-base-content font-semibold text-sm">
            <span>60L</span>
            <span>50L</span>
            <span>40L</span>
            <span>30L</span>
            <span>20L</span>
            <span>10L</span>
            <span>0L</span>
          </div>

          {/* Fuel Gauge Container */}
          <div className="relative w-20 h-170 bg-base-200 rounded-full border-2 border-base-content">
            {/* Fuel Level Indicator */}
            <div
              className={`absolute bottom-0 w-full ${getFuelStatusColor()} rounded-b-full transition-all duration-300 ease-in-out`}
              style={{ height: `${fuelLevelPercentage}%` }}
            ></div>

            {/* Fuel Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base-content font-bold text-lg">{fuelLevel} L</span>
            </div>
          </div>
        </div>

        {/* Fuel Status Text */}
        <p className="mt-4 text-base-content font-semibold">
          {fuelLevelPercentage >= 75
            ? "Full"
            : fuelLevelPercentage >= 40
            ? "Medium"
            : fuelLevelPercentage >= 20
            ? "Low"
            : "Critical"}
        </p>
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
      toast.error("Error fetching data");
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
                  {/* <RadialFuelLevelIndicator
                    fuelDetails={archiveData.filter((entry) => entry.gensetProperty.propertyName === "engFuelLevel")}
                  /> */}
                </Panel>
              </PanelGroup>
            </Panel>
            {/* */}
            <PanelResizeHandle />
            {/* */}
            <Panel>
              <PanelGroup direction="horizontal" className="gap-1">
                <Panel>
                  <OilPressureCard
                    oilPressureDetails={archiveData.filter((entry) => entry.gensetProperty.propertyName === "engOilPress")}
                  />
                </Panel>
                <PanelResizeHandle />
                <Panel>
                  <ChargeAltVoltageCard
                    altVoltageDetails={archiveData.filter(
                      (entry) => entry.gensetProperty.propertyName === "engChargeAltVolts"
                    )}
                  />
                </Panel>
                <PanelResizeHandle />
                <Panel>
                  <BatteryVoltageCard
                    batteryVoltageDetails={archiveData.filter(
                      (entry) => entry.gensetProperty.propertyName === "engBatteryVolts"
                    )}
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
            fuelDetails={archiveData.filter((entry) => entry.gensetProperty.propertyName === "engFuelLevel")}
          />
        </Panel>
        {/* */}
      </PanelGroup>
    </div>
  );
};

export default Engine;
