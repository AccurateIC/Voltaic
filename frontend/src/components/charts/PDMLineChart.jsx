import { Line } from "react-chartjs-2";
import { DateTime } from "luxon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-luxon";

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const PDMLineChart = ({ value }) => {
  // const value = value.slice(-2000);

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `Vibration: ${context.parsed.y}`,
          title: (tooltipItems) => {
            return DateTime.fromISO(tooltipItems[0].raw.x).toFormat("HH:mm:ss");
          },
        },
      },
      title: {
        display: true,
        text: "Vibration Data",
        color: "#fff",
        font: {
          size: 18,
          weight: "normal",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        position: "bottom",
        title: {
          display: true,
          text: "Time",
          font: {
            size: 18,
            weight: "normal",
          },
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Vibration Acceleration (G-Units)",
          font: {
            size: 18,
            weight: "normal",
          },
        },
      },
    },
  };

  const data = {
    datasets: [
      {
        fill: false,
        label: "Vibration Data",
        data: value.map((item) => ({
          x: DateTime.fromISO(item.timestamp),
          y: item.actual,
        })),
        borderColor: "#ff7300",
        backgroundColor: "rgba(255, 115, 0, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointRadius: 0,
        pointHitRadius: 10,
        // tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default PDMLineChart;
