import { PlugZap, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "../lib/WebSocketConnection";

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

const HalfCircleSpeedometer = ({ value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  const degree = (percentage * 180) / 100;
  const circumference = Math.PI * 90;
  const arcLength = (degree / 360) * circumference;

  return (
<svg
  viewBox="0 0 100 50"
  className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feComponentTransfer in="SourceAlpha">
        <feFuncA type="table" tableValues="1 0" />
      </feComponentTransfer>
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feOffset dx="0" dy="0" result="offsetBlur"/>
      <feFlood flood-color="" result="color"/>
      <feComposite in2="offsetBlur" operator="in" />
      <feComposite in2="SourceAlpha" operator="in" />
      <feComposite operator="over"/>
    </filter>
  </defs>

  <path
    d="M5,50 A45,45 0 0,1 95,50"
    fill="none"
    stroke="#e0e0e0"
    strokeWidth="10"
    filter="url(#inner-shadow)"
  />
  <path
    d="M5,50 A45,45 0 0,1 95,50"
    fill="none"
    stroke={color}
    strokeWidth="10"
    strokeDasharray={`${arcLength} ${circumference - arcLength}`}
    strokeDashoffset="0"
    transform="rotate(-90,50,50)"
    filter="url(#inner-shadow)"
  />
</svg>

  );
};

const VoltageStatCard = ({ value, name, status, kind, color }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (Math.abs(displayValue - value) > 1) {
      smoothTransition(displayValue, value, setDisplayValue, 1500);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  let maxValue;
  let units;
  let icon;

  switch (kind) {
    case "voltage":
      maxValue = 250;
      units = "V";
      icon = <PlugZap size={64} />;
      break;
    case "current":
      maxValue = 20;
      units = "Amp";
      icon = <Zap size={64} />;
      break;
    case "lineVoltage":
      maxValue = 440;
      units = "V";
      icon = <PlugZap size={64} />;
      break;
    default:
      maxValue = 100;
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-gray-700">{name}</div>
      <HalfCircleSpeedometer
        value={Math.round(displayValue)}
        maxValue={maxValue}
        color={color || "#86c232"}
      />
      <div className="text-3xl font-bold text-gray-800">
        {Math.round(displayValue)} {units}
      </div>
    </div>
  );
};

export const Generator = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 15,
    l2Current: 16,
    l3Current: 16,
    l1l2Voltage: 12,
    l2l3Voltage: 10,
    l3l1Voltage: 15,
  });
  console.log(stats.l2Current);

  const handleWsMessage = useCallback((message) => {
    console.log("Ws Message: ", message);
    setStats({
      l1Voltage: Math.round(message?.genL1Volts.value || 0),
      l2Voltage: Math.round(message?.genL2Volts.value || 0),
      l3Voltage: Math.round(message?.genL3Volts.value || 0),
      l1Current: Math.round(message?.genL1Current.value || 0),
      l2Current: Math.round(message?.genL2Current.value || 0),
      l3Current: Math.round(message?.genL3Current.value || 8),
      l1l2Voltage: Math.round(message?.genL1Volts.value || 0),
      l2l3Voltage: Math.round(message?.genL2Volts.value || 0),
      l3l1Voltage: Math.round(message?.genL3Volts.value || 0),
    });
  }, []);

  const { send, isConnected } = useWebSocket(handleWsMessage);

  useEffect(() => {
    console.log("WebSocket connected:", isConnected);
  }, [isConnected]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full lg:h-[45rem] 2xl:h-[53rem]">
      <VoltageStatCard
        kind="voltage"
        name={"L1 Voltage"}
        value={stats.l1Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="voltage"
        name={"L2 Voltage"}
        value={stats.l2Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="voltage"
        name={"L3 Voltage"}
        value={stats.l3Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="voltage"
        name={"L1L2 Voltage"}
        value={stats.l1l2Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="voltage"
        name={"L2L3 Voltage"}
        value={stats.l2l3Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="voltage"
        name={"L3L1 Voltage"}
        value={stats.l3l1Voltage}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="current"
        name={"L1 Current"}
        value={stats.l1Current}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="current"
        name={"L2 Current"}
        value={stats.l2Current}
        color="#B1D5BD"
      />
      <VoltageStatCard
        kind="current"
        name={"L3 Current"}
        value={stats.l3Current}
        color="#B1D5BD"
      />
    </div>
  );
};
