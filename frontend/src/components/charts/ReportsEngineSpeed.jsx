// import React from "react";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   TimeSeriesScale,
// } from "chart.js";
// import "chartjs-adapter-luxon";
// import { DateTime } from "luxon";

// // Register ChartJS components
// ChartJS.register(
//   TimeSeriesScale,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const EngineFuelLevelLineChart = ({ engineSpeedData }) => {
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: "top", align: "center" },
//       tooltip: {},
//       title: {
//         display: true,
//         text: "Engine Fuel Level Monitor",
//         color: "#fff",
//         font: { size: 18, weight: "normal" },
//       },
//     },
//     scales: {
//       x: {
//         type: "timeseries",
//         position: "bottom",
//         title: {
//           display: true,
//           text: "Time",
//           font: { size: 18, weight: "normal" },
//         },
//         min: DateTime.now().minus({ hours: 1 }).toISO(),
//         max: DateTime.now().toISO(),
//         grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
//         ticks: { display: true },
//       },
//       y: {
//         type: "linear",
//         title: {
//           display: true,
//           text: "Engine Speed (RPM)",
//           font: { size: 18, weight: "normal" },
//         },
//         min: 0,
//         max: 80,
//         grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
//       },
//     },
//   };

//   const chartData = engineSpeedData.map((item) => ({
//     x: item.timestamp,
//     y: item.propertyValue,
//   }));

//   const data = {
//     datasets: [
//       {
//         fill: true,
//         label: "Engine Speed",
//         data: chartData,
//         borderColor: "rgba(82, 120, 209, 1)",
//         backgroundColor: "rgba(82, 120, 209, 0.5)",
//         pointStyle: "circle",
//         pointRadius: 3,
//         pointHoverRadius: 5,
//         pointHitRadius: 10,
//         borderWidth: 2,
//       },
//     ],
//   };

//   return (
//     <div style={{ height: "450px" }}>
//       <Line options={options} data={data} />
//     </div>
//   );
// };

// export default EngineFuelLevelLineChart;


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

// Register ChartJS components
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

const EngineSpeedLineChart = ({ engineSpeedData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "center" },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Speed Monitor",
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
          font: { size: 18, weight: "normal" },
        },
        grid: { color: "#888", lineWidth: 0.5 },
        ticks: { color: "#fff" },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Engine Speed (RPM)",
          color: "#fff",
          font: { size: 18, weight: "normal" },
        },
        min: 0,
        max: 2000, // increased based on real-world RPM values
        grid: { color: "#888", lineWidth: 0.5 },
        ticks: { color: "#fff" },
      },
    },
  };

  const chartData = engineSpeedData
    .map((item) => ({
      x: item.timestamp,
      y: item.propertyValue,
    }))
    .sort((a, b) => new Date(a.x) - new Date(b.x)); // ensure sorted by time

  const data = {
    datasets: [
      {
        label: "Engine Speed",
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

  return (
    <div style={{ height: "450px" }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default EngineSpeedLineChart;
