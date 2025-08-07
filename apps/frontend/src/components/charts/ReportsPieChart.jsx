import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartBox from "./Chartbox";

ChartJS.register(ArcElement, Tooltip, Legend);

const ReportsPieChart = () => {
  const pieData = {
    labels: ["Oil Pressure", "Fuel", "Engine Speed"],
    datasets: [
      {
        label: "Anomaly Type",
        data: [483, 1823, 670],
        backgroundColor: ["#4DD0E1", "#FFEB3B", "#A5D6A7"],
        borderColor: ["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.2)"],
        borderWidth: 6,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: "white", font: { size: 12 } } },
      tooltip: { enabled: true },
    },
    layout: { padding: 20 },
  };

  return (
    <ChartBox title="TYPE OF ANOMALY">
      <div className="w-full h-[500px] flex justify-center items-center rounded-lg p-4 -mt-20">
        <div className="relative w-[350px] h-[350px]">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </ChartBox>
  );
};

export default ReportsPieChart;
