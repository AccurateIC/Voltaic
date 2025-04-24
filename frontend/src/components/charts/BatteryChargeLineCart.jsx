import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const BatteryChargeLineChart = ({ value }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          boxWidth: 12,
          color: "#000",
        },
      },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Battery Voltage Monitor",
        color: "#000",
        font: {
          size: 18,
          weight: "normal",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Time",
          font: {
            size: 16,
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "#ccc",
        },
      },
      y: {
        type: "linear",
        min: 0,
        max: 150,
        title: {
          display: true,
          text: "Voltage (Volts)",
          font: {
            size: 16,
          },
        },
        grid: {
          color: "#ccc",
        },
      },
    },
  };

  const data = {
    labels: value.map((item) => item.time),
    datasets: [
      {
        label: "Battery Voltage",
        data: value.map((item) => item.batteryVolts),
        borderColor: "#5278d1",
        backgroundColor: "#5278d1",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Charge Alternator Voltage",
        data: value.map((item) => item.chargeAltVolts),
        borderColor: "#5dd12c",
        backgroundColor: "#5dd12c",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  return (
    <div className="h-[400px] w-full relative">
      <Line options={options} data={data} />
    </div>
  );
};

export default BatteryChargeLineChart;
