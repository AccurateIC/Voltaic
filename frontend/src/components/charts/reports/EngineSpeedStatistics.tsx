// frontend/src/components/charts/reports/EngineSpeedStatistics.tsx
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
import { useArchive } from "../../../hooks/useArchive";
import { useEffect, useState } from "react";
import { DateTime, DateTimeUnit } from "luxon";
import { GetPropertyDataBetween } from "../../../api/archive";
import { error } from "console";
import { Archive } from "../../../types/archive.types";
ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const EngineSpeedStatistics = ({ chartData }) => {
  if (!chartData) return <div className="flex items-center justify-center">N/A</div>;

  // chart options
  const options: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Engine Speed (RPM)",
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
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: "Engine Speed (RPM) ⟶",
          font: { size: 18, weight: "normal" },
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  // chart dataset
  const lineData: ChartData<"line"> = {
    datasets: [
      {
        label: "Engine Speed (RPM)",
        data: chartData.map((value) => ({
          x: DateTime.fromISO(value.timestamp).toJSDate(),
          y: value.propertyValue,
        })),
      },
    ],
  };

  return <Line data={lineData} options={options} />;
};
