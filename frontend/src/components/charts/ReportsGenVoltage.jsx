import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from "chart.js";

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

const voltage = {
  labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
  datasets: [
    {
      label: "L1",
      data: [
        241.8, 241.7, 242.0, 242.1, 241.9, 242.2, 241.8, 241.6, 241.9, 242.0, 241.7, 241.8, 242.1, 241.9, 241.6, 241.7,
        242.3, 242.1, 242.0, 241.8, 241.9, 242.2, 241.7, 241.8, 241.9, 242.1, 241.6, 241.8, 242.0, 241.9,
      ],
      borderColor: "#9BE4B4",
      tension: 0.3,
      pointRadius: 0,
    },
    {
      label: "L2",
      data: [
        242.0, 241.9, 242.1, 242.3, 241.8, 241.9, 242.2, 242.0, 241.7, 241.9, 242.1, 242.2, 241.8, 241.9, 242.0, 242.1,
        242.3, 241.9, 241.7, 241.6, 242.0, 242.1, 241.8, 241.9, 242.0, 241.7, 241.8, 242.2, 242.1, 242.0,
      ],
      borderColor: "#5EDFFB",
      tension: 0.3,
      pointRadius: 0,
    },
    {
      label: "L3",
      data: [
        241.0, 242.2, 241.8, 242.0, 242.0, 242.1, 242.2, 242.0, 241.8, 242.2, 242.1, 242.0, 241.6, 242.3, 242.0, 241.8,
        242.2, 242.2, 241.9, 242.1, 242.0, 242.2, 241.7, 242.0, 242.1, 241.8, 242.1, 242.0, 241.7, 241.3,
      ],
      borderColor: "#FFF627",
      tension: 0.3,
      pointRadius: 0,
    },
  ],
};

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "",
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
      ticks: { color: "#fff", maxRotation: 0, minRotation: 0 },
      grid: { color: "#888", lineWidth: 0.5 },
    },
    y: {
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
};

const ReportsGenVoltage = () => (
  <div className="col-span-1">
    <span className="text-white text-sm font-semibold mb-2">GENERATOR VOLTAGE</span>
    <div className="aspect-video bg-[#303030] rounded-xl p-2">
      <Line data={voltage} options={chartOptions} />
    </div>
  </div>
);

export default ReportsGenVoltage;
