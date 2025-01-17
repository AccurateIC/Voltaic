import { PlugZap, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "../lib/WebSocketConnection";
import ReactSpeedometer from "react-d3-speedometer";

const smoothTransition = (startValue, endValue, setValue, duration = 1500) => {
  const steps = 100; 
  const stepTime = duration / steps; 
  const increment = (endValue - startValue) / steps;

  let currentStep = 0;

  const updateValue = () => {
    currentStep++;
    const newValue = startValue + increment * currentStep;

    setValue(newValue);

    if (currentStep < steps) {
      setTimeout(updateValue, stepTime);
    } else {
      setValue(endValue); 
    }
  };

  updateValue();
};

const VoltageStatCard = ({ value, name, status, kind }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (Math.abs(displayValue - value) > 1) {
      smoothTransition(displayValue, value, setDisplayValue, 1500); // Slow, smooth transition
    }
  }, [value]);

  let maxValue;
  let units;
  let icon;

  switch (kind) {
    case "voltage":
      maxValue = 250;
      units = "Volts";
      icon = <PlugZap size={64} />;
      break;
    case "current":
      maxValue = 20;
      units = "Ampere";
      icon = <Zap size={64} />;
      break;
    case "lineVoltage":
      maxValue = 440;
      units = "Volts";
      icon = <PlugZap size={64} />;
      break;
    default:
      maxValue = 100; 
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="text-3xl font-semibold">{name}</div>
      <div className="flex flex-row items-center gap-2">
        <span>{icon}</span>
        <span className="text-4xl font-bold">
          {value} {units}
        </span>
      </div>
      <div className="text-base-content">{status}</div>

      <ReactSpeedometer
        width={250} 
        height={160}
        maxValue={maxValue}
        value={Math.round(displayValue)}
        segments={5}
        needleColor="#000"
        textColor="#000"
        segmentColors={["#d3d3d3", "#a8d396", "#86c232", "#4CAF50", "#5BE12C"]}
        customSegmentStops={[
          0,
          maxValue * 0.2,
          maxValue * 0.4,
          maxValue * 0.6,
          maxValue * 0.8,
          maxValue,
        ]}
        currentValueText={`${Math.round(displayValue)}${
          units === "Volts" ? "V" : "A"
        }`}
        forceRender={false}
      />
    </div>
  );
};

export const Generator = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
  });
  const handleWsMessage = useCallback((message) => {
    console.log("Ws Message: ", message);
    setStats({
      l1Voltage: Math.round(message?.genL1Volts.value),
      l2Voltage: Math.round(message?.genL2Volts.value),
      l3Voltage: Math.round(message?.genL3Volts.value),
      l1Current: Math.round(message?.genL1Current.value),
      l2Current: Math.round(message?.genL2Current.value),
      l3Current: Math.round(message?.genL3Current.value),
    });
  }, []);
  const { send, isConnected } = useWebSocket(handleWsMessage);

  console.log(isConnected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-2 h-full">
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L1 Voltage"}
          value={stats?.l1Voltage}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L2 Voltage"}
          value={stats?.l2Voltage}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L3 Voltage"}
          value={stats?.l3Voltage}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="current"
          name={"L1 Current"}
          value={stats?.l1Current}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="current"
          name={"L2 Current"}
          value={stats?.l2Current}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="current"
          name={"L3 Current"}
          value={stats?.l3Current}
          // status={"Discharging"}
        />{" "}
      </div>
      {/* <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L1 Voltage"}
          value={12.7}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L1 Voltage"}
          value={12.7}
          // status={"Discharging"}
        />{" "}
      </div>
      <div className="min-h-[400px] bg-base-200 flex items-center justify-center">
        {" "}
        <VoltageStatCard
          kind="voltage"
          name={"L1 Voltage"}
          value={12.7}
          // status={"Discharging"}
        />{" "}
      </div> */}
    </div>
  );
};
