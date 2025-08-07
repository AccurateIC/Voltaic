import React from "react";
import { Line } from "react-chartjs-2";
import ChartBox from "./Chartbox";

const ReportsOilPressure = () => {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Oil Pressure",
        data: [3.3, 4.2, 3.0, 4.8],
        borderColor: "rgba(120, 199, 173, 1)",
        backgroundColor: "#9BE4B4B2",
        tension: 0.1,
        fill: true,
        pointBackgroundColor: "rgba(173, 255, 201, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { ticks: { color: "#fff", font: { size: 12 } }, grid: { color: "#888", lineWidth: 0.3 } },
      y: {
        min: 1,
        max: 5,
        ticks: { color: "#fff", font: { size: 12 }, stepSize: 1, callback: (value) => `${value} Bar` },
        grid: { color: "#888", lineWidth: 0.3 },
      },
    },
  };

  return (
    <ChartBox title="ENGINE OIL PRESSURE">
      <Line data={data} options={options} height={160} />
    </ChartBox>
  );
};

export default ReportsOilPressure;
