import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required components

export const AnomaliesBarChart = ({ labels, dataset }) => {
  // 🎯 Dynamic max calculation
  const maxValue = Math.max(...(dataset?.length ? dataset : [0]), 10);
  const roundedMax = Math.ceil(maxValue / 10) * 10;

  const data = {
    labels: labels?.length ? labels : ["No Data"],
    datasets: [
      {
        label: "Anomaly Count",
        data: dataset?.length ? dataset : [0],
        backgroundColor: "#8884d8",
        borderWidth: 1,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Anomaly Count (Time-wise)",
        color: "rgba(255, 255, 255, 0.6)",
        font: { weight: "bold", size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Count: ${context.raw}`,
        },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Range ⟶",
          color: "white",
          font: { weight: "bold", size: 14 },
        },
        ticks: {
          color: "white",
          font: { size: 12 },
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        min: 0,
        max: roundedMax,
        ticks: {
          stepSize: 10,
          color: "white",
        },
        title: {
          display: true,
          text: "No. of Anomalies ⟶",
          color: "white",
          font: { weight: "bold", size: 14 },
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return <Bar data={data} options={options} />;
};