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
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const EngineSpeedLineChart = ({ value }) => {
  const options = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          boxWidth: 12,
          color: "#000",
        },
      },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Speed Monitor",
        color: "#000",
        font: {
          size: 18,
          weight: "normal",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Time",
          font: {
            size: 16,
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "#ccc",
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Engine Speed (RPM)",
          font: {
            size: 16,
          },
        },
        min: 0,
        max: 2000,
        grid: {
          color: "#ccc",
        },
      },
    },
  };

  const data = {
    labels: value.map((item) => item.time),
    datasets: [
      {
        label: "Engine Speed",
        data: value.map((item) => item.engineSpeed),
        borderColor: "#5278d1",
        backgroundColor: "#5278d1",
        fill: false,
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-[400px] w-full relative">
      <Line options={options} data={data} />
    </div>
  );
};

export default EngineSpeedLineChart;
