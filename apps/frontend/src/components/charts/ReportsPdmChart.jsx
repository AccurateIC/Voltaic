import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const ReportsPdmChart = () => {
  const labels = Array.from({ length: 150 }, (_, i) => `17:58:${45 + (i % 15)}`);
  const generateWave = (amp) =>
    Array.from({ length: 150 }, () => Math.sin(Math.random() * 10) * amp + (Math.random() - 0.5) * 2);

  const data = {
    labels,
    datasets: [
      {
        label: "Forecasted Data ",
        data: generateWave(2),
        borderColor: "cyan",
        backgroundColor: "rgba(0,255,255,0.3)",
        borderWidth: 1,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Actual Data",
        data: generateWave(2),
        borderColor: "yellow",
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "#fff" }, grid: { color: "#888" } },
      y: { min: -4, max: 4, ticks: { color: "#fff" }, grid: { color: "#888" } },
    },
    plugins: { legend: { display: true } },
  };

  return (
    <div className="w-full h-[400px] bg-[#2f2f2f] rounded-2xl shadow-lg p-4">
      <h2 className="text-white font-semibold text-md mb-2">PDM</h2>
      <div className="h-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ReportsPdmChart;
