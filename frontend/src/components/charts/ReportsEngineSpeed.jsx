import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartBox from "./Chartbox";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const ReportsEngineSpeed = ({ timeFilter }) => {
  const data = useMemo(() => {
    let labels = [];

    if (timeFilter === "Monthly") {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    } else if (timeFilter === "Yearly") {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    } else {
      labels = Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`);
    }

    const rpmData = labels.map(() => Math.floor(Math.random() * (2000 - 200) + 200));

    return {
      labels,
      datasets: [
        {
          label: "RPM",
          data: rpmData,
          borderColor: "#00d9ff",
          backgroundColor: "#00d9ff",
          tension: 0.1,
          pointRadius: 4,
        },
      ],
    };
  }, [timeFilter]);

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Speed in RPM",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: {
          color: "#fff",
          callback: (value) => `${value} RPM`,
        },
        grid: { color: "#fff", lineWidth: 0.5 },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#fff",
          font: { size: 14 },
        },
        ticks: { color: "#fff" },
        grid: { color: "#fff", lineWidth: 0.5 },
      },
    },
  };

  return (
    <ChartBox title="ENGINE SPEED">
      <div className="h-[400px] w-[480px]">
        <Line data={data} options={options} />
      </div>
    </ChartBox>
  );
};

export default ReportsEngineSpeed;
