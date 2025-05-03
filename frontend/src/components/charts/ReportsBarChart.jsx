import React from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartBox from "./Chartbox";

const ReportsBarChart = () => {
  const data = {
    labels: ["Month", "Week", "Day"],
    datasets: [
      {
        label: "",
        data: [583, 371, 103],
        backgroundColor: ["#9BE4B4", "#5EDFFB", "#FFF72D"],
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
        color: "#fff", 
        anchor: "end",
        align: "end",
        font: { size: 14 },
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
    <ChartBox title="TOTAL ANOMALIES">
      <div className="flex justify-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#9BE4B4] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Month</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#5EDFFB] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#FFF72D] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Day</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </ChartBox>
  );
};

export default ReportsBarChart;
