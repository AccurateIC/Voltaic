import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const backgroundPlugin = {
  id: "customBackground",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#303030";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    title: {
      display: true,
      color: "#fff",
      font: { size: 14, weight: "bold" },
    },
    legend: {
      labels: { color: "#fff", font: { size: 12 } },
    },
    customBackground: backgroundPlugin,
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Time",
        color: "#fff",
        font: { size: 14 },
      },
      ticks: { color: "#fff", maxRotation: 0, minRotation: 0 },
      grid: { color: "#888", lineWidth: 0.5 },
    },
    y: {
      title: {
        display: true,
        text: "Voltage (V)",
        color: "#fff",
        font: { size: 14 },
      },
      min: 240,
      max: 244,
      ticks: {
        color: "#fff",
        stepSize: 1,
        callback: (value) => `${value} V`,
      },
      grid: { color: "#888", lineWidth: 0.5 },
    },
  },
  plugins: [backgroundPlugin],
};

const ReportsGenVoltage = ({ timeFilter }) => {
  const voltage = useMemo(() => {
    const getLabels = (count) => Array.from({ length: count }, (_, i) => `Day ${i + 1}`);
    const getDataSlice = (data, count) => data.slice(-count);

    const dayCount =
      timeFilter === "Weekly" ? 7 :
      timeFilter === "Monthly" ? 30 :
      timeFilter === "Yearly" ? 365 : 7;

    return {
      labels: getLabels(dayCount),
      datasets: [
        {
          label: "L1",
          data: getDataSlice(new Array(365).fill(0).map(() => +(241.5 + Math.random() * 1.5).toFixed(2)), dayCount),
          borderColor: "#9BE4B4",
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "L2",
          data: getDataSlice(new Array(365).fill(0).map(() => +(241.6 + Math.random() * 1.5).toFixed(2)), dayCount),
          borderColor: "#5EDFFB",
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "L3",
          data: getDataSlice(new Array(365).fill(0).map(() => +(241.7 + Math.random() * 1.5).toFixed(2)), dayCount),
          borderColor: "#FFF627",
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    };
  }, [timeFilter]);

  return (
    <div className="col-span-1">
      <span className="text-white text-sm font-semibold mb-2">GENERATOR VOLTAGE ({timeFilter})</span>
      <div className="aspect-video bg-[#303030] rounded-xl p-2">
        <Line data={voltage} options={chartOptions} />
      </div>
      <p className="text-sm text-gray-300 mt-2 hidden pdf-only">Generator voltage trends across L1, L2, and L3 phases.</p>
    </div>
  );
};            

export default ReportsGenVoltage;
