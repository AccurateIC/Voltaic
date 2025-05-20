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

const ReportsGenVoltage = ({ voltageData = [] }) => {
  const sortedData = [...voltageData].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const l1Data = sortedData.map((item) => ({ x: item.timestamp, y: item.L1 }));
  const l2Data = sortedData.map((item) => ({ x: item.timestamp, y: item.L2 }));
  const l3Data = sortedData.map((item) => ({ x: item.timestamp, y: item.L3 }));

  const data = {
    datasets: [
      {
        label: "L1",
        data: l1Data,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        fill: false,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: "L2",
        data: l2Data,
        borderColor: "rgba(209, 120, 82, 1)",
        backgroundColor: "rgba(209, 120, 82, 0.5)",
        fill: false,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: "L3",
        data: l3Data,
        borderColor: "rgba(82, 209, 120, 1)",
        backgroundColor: "rgba(82, 209, 120, 0.5)",
        fill: false,
        pointRadius: 3,
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
        labels: { color: "#fff" },
      },
      title: {
        display: true,
        text: "Generator Voltage Monitor",
        color: "rgba(255, 255, 255, 0.8)",
        font: { size: 18 },
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
        ticks: { color: "#fff", maxRotation: 0, minRotation: 0 },
        grid: { color: "#888", lineWidth: 0.5 },
      },
      y: {
        type: "linear",
        min: 0,
        max: 300,
        title: {
          display: true,
          text: "Voltage (Volts)",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: { color: "#fff" },
        grid: { color: "#888", lineWidth: 0.5 },
      },
    },
  };

  return (
    <div style={{ height: "450px" }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default ReportsGenVoltage;
