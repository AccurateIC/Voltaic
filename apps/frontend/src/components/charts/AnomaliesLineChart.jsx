import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";


// 🔁 Updated to include date as well
const formatDateTime12Hour = (timestamp) => {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Jan = 0
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
};

const AnomaliesLineChart = ({ value }) => {
  useEffect(() => {
    
  }, [value]);

  if (!Array.isArray(value) || value.length === 0) return <div>No data available</div>;

  const sortedData = [...value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sortedData.map((item) => formatDateTime12Hour(item.timestamp)); //  Use new formatter
  const dataPoints = sortedData.map((item) => item.propertyValue);
  const anomalyPoints = sortedData.map((item) => item.isAnomaly);

  const yAxisTitle = value[0]?.gensetProperty?.readablePropertyName || "Property Value";

  const data = {
    labels,
    datasets: [
      {
        label: yAxisTitle,
        data: dataPoints,
        borderColor: "#5278d1",
        backgroundColor: "rgba(82, 120, 209, 0.2)",
        pointBackgroundColor: anomalyPoints.map((is) => (is ? "red" : "#5278d1")),
        pointBorderColor: anomalyPoints.map((is) => (is ? "red" : "#5278d1")),
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `${yAxisTitle} Monitor`,
        color: "rgba(255, 255, 255, 0.6)",
        font: { weight: "bold", size: 18 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.parsed.y;
            const isAnomaly = anomalyPoints[context.dataIndex];
            return `${yAxisTitle}: ${val}${isAnomaly ? "  (Anomaly)" : ""}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: { color: "rgba(255, 255, 255, 0.5)", display: true, text: yAxisTitle, font: { size: 16 } },
        ticks: { color: "rgba(255, 255, 255, 0.5)", font: { size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
      x: {
        title: { color: "rgba(255, 255, 255, 0.5)", display: true, text: "Date & Time" },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          font: { size: 10 },
          autoSkip: true,
          maxRotation: 60,
          minRotation: 45,
        },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
    },
  };

  return (
    <div className="flex-1 h-[395px] px-2 bg-base-200">
      <Line data={data} options={options} className="w-full h-full" />
    </div>
  );
};

export default AnomaliesLineChart;
