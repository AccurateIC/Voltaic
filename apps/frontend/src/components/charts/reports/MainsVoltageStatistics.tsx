// frontend/src/components/charts/reports/MainsVoltageStatistics.tsx
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
  ChartOptions,
  ChartData,
  TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const MainsVoltageStatistics = ({ chartData }) => {
  console.log("cd", chartData);
  if (!chartData) return <div className="flex items-center justify-center">N/A</div>;

  // chart options
  const options: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "Mains Voltages",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
      tooltip: {},
    },
    scales: {
      x: {
        time: {
          unit: "second", // or "hour", "minute", "week", etc., depending on your use case
          tooltipFormat: "DD T", // Format for tooltip, e.g., 'May 20, 2025, 12:30 PM'
          displayFormats: {
            // day: "MMM dd", // x-axis label format, e.g., 'May 20'
            second: "yyyy-mm-dd hh:mm:ss",
          },
        },
        type: "timeseries",
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: "Time ⟶",
          font: { size: 18, weight: "normal" },
        },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: "Voltage (V) ⟶",
          font: { size: 18, weight: "normal" },
        },
      },
    },
  };

  // chart dataset
  const lineData: ChartData<"line"> = {
    datasets: [
      {
        label: "Mains L1 Volts",
        data: chartData
          .filter((value) => value.gensetProperty.propertyName === "mainsL1Volts")
          .map((value) => ({
            x: DateTime.fromISO(value.timestamp).toJSDate(),
            y: value.propertyValue,
          })),
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
      },

      {
        label: "Mains L2 Volts",
        data: chartData
          .filter((value) => value.gensetProperty.propertyName === "mainsL2Volts")
          .map((value) => ({
            x: DateTime.fromISO(value.timestamp).toJSDate(),
            y: value.propertyValue,
          })),
        borderColor: "rgba(209, 120, 82, 1)",
        backgroundColor: "rgba(209, 120, 82, 0.5)",
      },

      {
        label: "Mains L3 Volts",
        data: chartData
          .filter((value) => value.gensetProperty.propertyName === "mainsL3Volts")
          .map((value) => ({
            x: DateTime.fromISO(value.timestamp).toJSDate(),
            y: value.propertyValue,
          })),
        borderColor: "rgba(82, 209, 120, 1)",
        backgroundColor: "rgba(82, 209, 120, 0.5)",
      },
    ],
  };

  return <Line data={lineData} options={options} />;
};
