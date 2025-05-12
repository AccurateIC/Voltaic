// src/components/charts/RulTrendChart.tsx
import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { filteredHealthIndexData } from "../filteredHealthIndexData";
import { RulPrediction } from "../../types/rul.types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Health Index Deterioration",
      color: "#fff",
      font: {
        size: 18,
        weight: "bold",
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      titleFont: {
        size: 14,
        weight: "bold",
      },
      bodyColor: "#ffffff",
      bodyFont: {
        size: 13,
      },
      padding: 12,
      displayColors: true,
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      cornerRadius: 6,
      callbacks: {
        title: (tooltipItems) => {
          return tooltipItems[0].dataset.label;
        },
        label: (tooltipItems) => {
          const dataset = tooltipItems.datasetIndex;
          const point = tooltipItems.raw;

          switch (dataset) {
            case 0: // trend line dataset
              return [`Health Index: ${point.y.toFixed(3)}`];
            case 1: // current rul dataset
              return [`Health Index: ${point.y.toFixed(3)}`, `Remaining Life: ${parseInt(point?.currentRul)} Hours`];
            case 2: // simulated rul dataset
              return [`Health Index: ${point.y.toFixed(3)}`, `Remaining Life: ${parseInt(point?.simulatedRul)} Hours`];
            default:
              console.log("unexpected dataset");
          }
        },
      },

      yAlign: "top",
      xAlign: "center",

      position: "nearest",

      animation: {
        duration: 200,
      },

      mode: "nearest",
      intersect: false,
    },
  },
  scales: {
    x: {
      type: "linear",
      position: "bottom",
      title: {
        display: true,
        text: "Time (Hours)",
        color: "#ffffff", // Change X-axis title color
      },
      ticks: {
        color: "#ffffff", // Change X-axis tick labels color
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)", // Optional: Change grid line color
      },
      // min: 0,
      // max: 10000,
    },
    y: {
      reverse: false,
      title: {
        display: true,
        text: "Predicted Health Index",
        color: "#ffffff", // Change X-axis title color
      },
      ticks: {
        color: "#ffffff", // Change X-axis tick labels color
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)", // Optional: Change grid line color
      },
      // min: 0,
      // max: 1,
    },
  },
};

export function RulChart({
  currentRulPoint,
  simulatedRulPoint,
}: {
  currentRulPoint: RulPrediction[];
  simulatedRulPoint: RulPrediction[];
}) {
  const data: ChartOptions<"line"> = {
    datasets: [
      {
        label: "Health Index Trend",
        data: filteredHealthIndexData.map((item) => ({
          x: item.Time_Hours,
          y: item.Predicted_Health_Index,
        })),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointStyle: "circle",
      },
      {
        label: "Current Health Index",
        data: currentRulPoint?.map((entry, index) => {
          return {
            x: entry?.Time_Hours,
            y: entry?.Predicted_Health_Index,
            currentRul: entry?.Remaining_Useful_Life,
          };
        }),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        pointRadius: 8,
        pointStyle: "circle",
        showLine: false,
      },
      {
        label: "Simulated Health Index",
        data: simulatedRulPoint?.map((entry, index) => {
          return {
            x: entry?.Time_Hours,
            y: entry?.Predicted_Health_Index,
            simulatedRul: entry?.Remaining_Useful_Life,
          };
        }),
        borderColor: "rgb(162, 53, 235)",
        backgroundColor: "rgba(162, 53, 235, 0.5)",
      },
    ],
  };

  return <Line options={options} data={data} />;
}
