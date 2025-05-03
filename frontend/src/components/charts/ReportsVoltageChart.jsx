import React from "react";
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

// ✅ Custom background plugin
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
      data: [241.8, 241.7, 242.0, 242.1, 241.9, 242.2, 241.8, 241.6, 241.9, 242.0, 241.7, 241.8, 242.1, 241.9, 241.6, 241.7, 242.3, 242.1, 242.0, 241.8, 241.9, 242.2, 241.7, 241.8, 241.9, 242.1, 241.6, 241.8, 242.0, 241.9],
      borderColor: "#9BE4B4",
      tension: 0.3,
      pointRadius: 0,
    },
    {
      label: "L2",
      data: [242.0, 241.9, 242.1, 242.3, 241.8, 241.9, 242.2, 242.0, 241.7, 241.9, 242.1, 242.2, 241.8, 241.9, 242.0, 242.1, 242.3, 241.9, 241.7, 241.6, 242.0, 242.1, 241.8, 241.9, 242.0, 241.7, 241.8, 242.2, 242.1, 242.0],
      borderColor: "#5EDFFB",
      tension: 0.3,
      pointRadius: 0,
    },
    {
      label: "L3",
      data: [241.0, 242.2, 241.8, 242.0, 242.0, 242.1, 242.2, 242.0, 241.8, 242.2, 242.1, 242.0, 241.6, 242.3, 242.0, 241.8, 242.2, 242.2, 241.9, 242.1, 242.0, 242.2, 241.7, 242.0, 242.1, 241.8, 242.1, 242.0, 241.7, 241.3],
      borderColor: "#FFF627",
      tension: 0.3,
      pointRadius: 0,
    },
  ],
};

const chartOptions = (title) => ({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: title,
      color: "#fff",
      font: { size: 14, weight: "bold" },
    },
    legend: { labels: { color: "#fff", font: { size: 12 } } },
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
  plugins: [backgroundPlugin], 
});

const ReportsVoltageChart = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#303030] p-4 rounded-xl">
      <div className="aspect-video bg-[#303030] rounded-xl p-2">
        <Line data={voltage} options={chartOptions("GENERATOR VOLTAGE")} />
      </div>

      {/* <ChartBox title="GENERATOR VOLTAGE">
        <div className="flex items-center space-x-6 px-4 pt-3 pb-1">
          {["#9BE4B4", "#5EDFFB", "#FFF627"].map((color, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className={`h-4 w-6 bg-[${color}] rounded-sm`} />
              <span className="text-white text-xs font-bold">L{i + 1}</span>
            </div>
          ))}
        </div>
      </ChartBox> */}

      <div className="aspect-video bg-[#303030] rounded-xl p-2">
        <Line data={voltage} options={chartOptions("MAINS VOLTAGE")} />
      </div>

      {/* <ChartBox title="MAINS VOLTAGE">
        <div className="flex items-center space-x-6 px-4 pt-2 pb-1">
          {["#9BE4B4", "#5EDFFB", "#FFF627"].map((color, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className={`h-4 w-6 bg-[${color}] rounded-sm`} />
              <span className="text-white text-xs font-bold">L{i + 1}</span>
            </div>
          ))}
        </div>
      </ChartBox> */}
    </div>
  );
};

export default ReportsVoltageChart;
