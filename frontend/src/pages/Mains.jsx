import { useEffect, useState } from "react";
import { useMessageBus } from "../lib/MessageBus";

const VoltageCard = ({ voltage }) => {
  let value = voltage || 0;

  // Calculate the circle's properties
  const size = 64; // Size of the circle in pixels
  const strokeWidth = 23; // Width of the progress bar
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Only using PI instead of 2*PI for semi-circle
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="card flex bg-base-200 h-full w-full">
      <div className="card-body min-h-0 min-w-0 overflow-auto flex flex-col items-center">
        <h2 className="card-title text-base-content mb-4">Fuel Level</h2>
        <div className="relative">
          {/* Background semi-circle */}
          <svg
            width={size}
            height={size / 2} // Half height for semi-circle
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-base-300"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference / 2} // This creates the semi-circle
            />
            {/* Progress semi-circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-success"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 0.3s ease-in-out",
              }}
            />
          </svg>
          {/* Display percentage in the middle */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: "10px" }}>
            <span className="text-lg font-bold">{value}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      xmlns="http://www.w3.org/2000/svg">
      {/* Background Arc */}
      <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke="#e0e0e0" strokeWidth="10" />
      {/* Foreground Arc */}
      <path
        d="M5,50 A45,45 0 0,1 95,50"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset="0"
        transform="rotate(-90,50)"
      />
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
  switch (kind) {
    case "voltage":
      maxValue = 250;
      units = "V";
      break;
    case "current":
      maxValue = 20;
      units = "Amp";
      break;
    case "lineVoltage":
      maxValue = 440;
      units = "V";
      break;
    default:
      maxValue = 300;
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-gray-700">{name}</div>
      <HalfCircleSpeedometer value={Math.round(displayValue)} maxValue={maxValue} color={color || "#86c232"} />
      <div className="text-3xl font-bold text-gray-800">
        {Math.round(displayValue)} {units}
      </div>
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
  });

  useMessageBus("archive", (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    (async () => {
      await getData();
    })();
  });

  const getData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getLatest`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        const l1Voltage = data.filter((item) => item.gensetPropertyId === 13)[0]?.propertyValue || 0;
        const l2Voltage = data.filter((item) => item.gensetPropertyId === 14)[0]?.propertyValue || 0;
        const l3Voltage = data.filter((item) => item.gensetPropertyId === 15)[0]?.propertyValue || 0;
        const l1Current = data.filter((item) => item.gensetPropertyId === 10)[0]?.propertyValue || 0;
        const l2Current = data.filter((item) => item.gensetPropertyId === 11)[0]?.propertyValue || 0;
        const l3Current = data.filter((item) => item.gensetPropertyId === 12)[0]?.propertyValue || 0;

        setStats({ l1Voltage, l2Voltage, l3Voltage, l1Current, l2Current, l3Current });
      }
    } catch (error) {
      console.log("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    console.log("Engine page mount effect running");
    (async () => {
      await getData();
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 h-full">
      {/*
      <VoltageStatCard kind="voltage" name={"L1 Voltage"} value={stats.l1Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name={"L2 Voltage"} value={stats.l2Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="voltage" name={"L3 Voltage"} value={stats.l3Voltage} color="#B1D5BD" />
      <VoltageStatCard kind="current" name={"L1 Current"} value={stats.l1Current} color="#B1D5BD" />
      <VoltageStatCard kind="current" name={"L2 Current"} value={stats.l2Current} color="#B1D5BD" />
      <VoltageStatCard kind="current" name={"L3 Current"} value={stats.l3Current} color="#B1D5BD" />
      */}
      <VoltageCard voltage={200} />
    </div>
  );
};
