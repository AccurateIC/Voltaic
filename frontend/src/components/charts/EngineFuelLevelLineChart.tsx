import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { DateTime } from "luxon";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const EngineFuelLevelLineChart = ({ fuelLevelData }) => {
  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
      },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Fuel Level Monitor",
        color: "#fff",
        font: {
          size: 18,
          weight: "normal",
        },
      },
    },
    scales: {
      x: {
        type: "category",
        position: "bottom",
        title: {
          display: true,
          text: "Time",
          font: {
            size: 18,
            weight: "normal",
          },
        },
        grid: {
          display: true,
          color: "#404040",
        },
        ticks: {
          display: true,
        },
        // This ensures axis is displayed even with no data
        min: 0,
        max: 75,
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Fuel Level (Liter)",
          font: {
            size: 18,
            weight: "normal",
          },
        },
        min: 0,
        max: 80,
        grid: {
          display: true,
          color: "#404040",
        },
      },
    },
  };

  const data = {
    labels: fuelLevelData.map((item) => item.time),
    datasets: [
      {
        fill: false,
        label: "Fuel Level",
        data: fuelLevelData.map((item) => item.engineFuelLevel),
        borderColor: "#5278d1",
        backgroundColor: "#5278d1",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default EngineFuelLevelLineChart;

