import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-luxon";


ChartJS.register(
  TimeSeriesScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EngineFuelLevelLineChart = ({ fuelLevelData }) => {
  const chartData = (fuelLevelData || [])
    .map((item) => ({
      x: item.timestamp,
      y: item.propertyValue,
    }))
    .sort((a, b) => new Date(a.x) - new Date(b.x));

  const data = {
    datasets: [
      {
        label: "Fuel Level",
        data: chartData,
        fill: true,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.3)",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff", // for dark background
        },
      },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Fuel Level Monitor",
        color: "#fff",
        font: { size: 18, weight: "normal" },
      },
    },
    scales: {
      x: {
        type: "timeseries",
        title: {
          display: true,
          text: "Time",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        type: "linear",
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Fuel Level (Liter)",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div style={{ height: "450px" }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default EngineFuelLevelLineChart;
