import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import ChartBox from "./Chartbox";


const ReportsLineChart = () => {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Rpm",
        data: [200, 700, 300, 1800],
        borderColor: "#00d9ff",
        backgroundColor: "#00d9ff",
        tension: 0.1,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: "#fff", callback: (value) => `${value} Rpm` }, grid: { color: "#fff", lineWidth: 0.5 } },
      x: { ticks: { color: "#fff" }, grid: { color: "#fff", lineWidth: 0.5 } },
    },
  };

  return (
    <ChartBox title="ENGINE SPEED">
      <div className="h-[350px]">
        <Line data={data} options={options} />
      </div>
    </ChartBox>
  );
};

export default ReportsLineChart;
