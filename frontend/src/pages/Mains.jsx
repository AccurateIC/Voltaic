import { PlugZap, Zap } from "lucide-react";import { useCallback, useEffect, useState } from "react";
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
    <svg viewBox="0 0 100 50" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="#e0e0e0" strokeWidth="10" />
      <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeDashoffset="0"
        transform="rotate(-90,50,50)" />
    </svg>
  );
};

const VoltageStatCard = ({ value, name, kind, color }) => {
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
      maxValue = 440;
      units = "V";
      icon = <PlugZap size={64} />;
      break;
    case "current":
      maxValue = 440;
      units = "Amp";
      icon = <Zap size={64} />;
      break;
    default:
      maxValue = 100;
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-gray-100 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-gray-700">{name}</div>
      <HalfCircleSpeedometer value={Math.round(displayValue)} maxValue={maxValue} color={color || "#86c232"} />
      <div className="text-3xl font-bold text-gray-800">{Math.round(displayValue)} {units}</div>
    </div>
  );
};

export const Mains = () => {
  const [stats, setStats] = useState({
    l1Voltage: 0,
    l2Voltage: 0,
    l3Voltage: 0,
    l1Current: 0,
    l2Current: 0,
    l3Current: 0,
    l1l2Voltage: 0,
    l2l3Voltage: 0,
    l3l1Voltage: 0,
  });

  const handleWsMessage = useCallback((message) => {
    setStats({
      l1Voltage: Math.round(message?.mainsL1Volts.value || 0),
      l2Voltage: Math.round(message?.mainsL2Volts.value || 0),
      l3Voltage: Math.round(message?.mainsL3Volts.value || 0),
      l1Current: Math.round(message?.mainsL1Current.value || 0),
      l2Current: Math.round(message?.mainsL2Current.value || 0),
      l3Current: Math.round(message?.mainsL3Current.value || 0),
      l1l2Voltage: Math.round(message?.mainsL1L2Volts.value || 0),
      l2l3Voltage: Math.round(message?.mainsL2L3Volts.value || 0),
      l3l1Voltage: Math.round(message?.mainsL3L1Volts.value || 0),
    });
  }, []);

  const { isConnected } = useWebSocket(handleWsMessage);

  useEffect(() => {
    console.log("WebSocket connected:", isConnected);
  }, [isConnected]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
      <VoltageStatCard kind="voltage" name="L1 Voltage" value={stats.l1Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name="L2 Voltage" value={stats.l2Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name="L3 Voltage" value={stats.l3Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name="L1L2 Voltage" value={stats.l1l2Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name="L2L3 Voltage" value={stats.l2l3Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name="L3L1 Voltage" value={stats.l3l1Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="current" name="L1 Current" value={stats.l1Current} color="#B1D5BD" />
      <VoltageStatCard kind="current" name="L2 Current" value={stats.l2Current} color="#B1D5BD" />
      <VoltageStatCard kind="current" name="L3 Current" value={stats.l3Current} color="#B1D5BD" />
    </div>
  );
};
