import React from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartBox from "./Chartbox";

const ReportsBarChart = ({ timeFilter }) => {
  const chartData = {
    Weekly: [103, 371, 583],
    Monthly: [300, 1150, 1620],
    Yearly: [960, 4330, 6820],
  };

  const data = {
    labels: ["Weekly", "Monthly", "Yearly"],
    datasets: [
      {
        label: "",
        data: chartData[timeFilter],
        backgroundColor: ["#FFF72D", "#5EDFFB", "#9BE4B4"],
        borderRadius: 4,
        barThickness: 80,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#000",
        anchor: "center",
        align: "center",
        font: { size: 14, weight: "bold" },
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#fff",
          font: { size: 12, weight: "bold" },
        },
        grid: { color: "#333", lineWidth: 0.5 },
      },
    },
  };

  return (
    <ChartBox title={`TOTAL ANOMALIES`}>
      <div className="flex justify-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#FFF72D] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Weekly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#5EDFFB] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Monthly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#9BE4B4] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Yearly</span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </ChartBox>
  );
};

export default ReportsBarChart;
