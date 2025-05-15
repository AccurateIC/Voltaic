import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ChartBox from "./Chartbox";

const ReportsFuelLevel = ({ timeFilter }) => {
  const data = useMemo(() => {
    let dayCount = 7;
    if (timeFilter === "Monthly") dayCount = 30;
    else if (timeFilter === "Yearly") dayCount = 365;

    const baseValues = Array.from({ length: dayCount }, () =>
      Math.floor(Math.random() * 20) + 15
    );

    let labels = [];
    let values = [];

    if (timeFilter === "Yearly") {
      labels = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("default", { month: "short" })
      );
      values = labels.map((_, i) => {
        const start = Math.floor((i * dayCount) / 12);
        const end = Math.floor(((i + 1) * dayCount) / 12);
        const chunk = baseValues.slice(start, end);
        return Math.round(chunk.reduce((a, b) => a + b, 0) / chunk.length);
      });
    } else if (timeFilter === "Monthly") {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      values = labels.map((_, i) => {
        const start = i * 1;
        const chunk = baseValues.slice(start, start + 1);
        return Math.round(chunk.reduce((a, b) => a + b, 0) / chunk.length);
      });
    } else {
      labels = Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`);
      values = baseValues;
    }

    return {
      labels,
      datasets: [
        {
          label: "Ltr",
          data: values,
          borderColor: "#00d9ff",
          backgroundColor: "#5EDFFBB2",
          tension: 0.1,
          fill: true,
          pointRadius: 0,
        },
      ],
    };
  }, [timeFilter]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#888", lineWidth: 0.3 },
      },
      y: {
        title: {
          display: true,
          text: "Fuel Level (Ltr)",
          color: "#fff",
          font: { size: 14 },
        },
        min: 0,
        max: 40,
        ticks: {
          color: "#fff",
          font: { size: 12 },
          callback: (value) => `${value} Ltr`,
        },
        grid: { color: "#888", lineWidth: 0.3 },
      },
    },
  };

  return (
    <ChartBox title="ENGINE FUEL LEVEL">
      <Line data={data} options={options} height={180} />
    </ChartBox>
  );
};

export default ReportsFuelLevel;
