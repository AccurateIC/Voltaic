import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartBox from "./Chartbox";

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate a color palette for each segment
const generateColors = (count) => {
  const baseColors = [
    "#4DD0E1", "#FFEB3B", "#A5D6A7", "#F48FB1", "#CE93D8",
    "#FFAB91", "#81D4FA", "#FFD54F", "#C5E1A5", "#90CAF9",
  ];
  if (count <= baseColors.length) return baseColors.slice(0, count);
  while (baseColors.length < count) {
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
    baseColors.push(color);
  }
  return baseColors;
};

const ReportsPieChart = () => {
  const [anomalyData, setAnomalyData] = useState({});

  const fetchAnomalyData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getAnomalyStatistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch anomaly data");

      const result = await res.json();
      const dataFromBackend = result.byProperty || [];

      const formattedData = {};
      dataFromBackend.forEach((item) => {
        formattedData[item.readablePropertyName] = item.week || 0;
      });

      setAnomalyData(formattedData);
    } catch (error) {
      console.error("Error fetching pie chart data:", error);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const labels = Object.keys(anomalyData);
  const dataValues = Object.values(anomalyData);
  const backgroundColors = generateColors(labels.length);

  const pieData = {
    labels,
    datasets: [
      {
        label: "Anomaly Type",
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(() => "rgba(0, 0, 0, 0.2)"),
        borderWidth: 6,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          font: { size: 12 },
        },
      },
      tooltip: { enabled: true },
    },
    layout: { padding: 20 },
  };

  return (
    <ChartBox title="TYPE OF ANOMALY">
      <div className="w-full h-[550px] flex justify-center items-center rounded-lg p-4 -mt-20">
        <div className="relative w-[550px] h-[350px]">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </ChartBox>
  );
};

export default ReportsPieChart;
