import React from "react";
import { Line } from "react-chartjs-2";
import ChartBox from "./Chartbox";

const ReportsFuelLevel = () => {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Ltr",
        data: [12, 25, 18, 30],
        borderColor: "#00d9ff",
        backgroundColor: "#5EDFFBB2",
        tension: 0.1,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#888", lineWidth: 0.3 },
      },
      y: {
        min: 0,
        max: 40,
        ticks: {
          color: "#fff",
          font: { size: 12 },
          callback: (value) => `${value} Ltr`,
        },
        grid: { color: "#888", lineWidth: 0.3 },
      },
    },
  };

  return (
    <ChartBox title="ENGINE FUEL LEVEL">
      <Line data={data} options={options} height={160} />
    </ChartBox>
  );
};

export default ReportsFuelLevel;
