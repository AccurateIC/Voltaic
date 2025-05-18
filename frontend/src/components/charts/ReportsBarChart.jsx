import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartBox from "./Chartbox";

const ReportsBarChart = () => {
  const [chartDataFromAPI, setChartDataFromAPI] = useState({
    week: 0,
    month: 0,
    total: 0,
  });

  const fetchAnomalyStatistics = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/archive/getAnomalyStatistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
  
      setChartDataFromAPI({
        week: data.overall.week,
        month: data.overall.month,
        total: data.overall.total,
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  

  useEffect(() => {
    fetchAnomalyStatistics();
  }, []);

  const data = {
    labels: ["Weekly", "Monthly", "Yearly"],
    datasets: [
      {
        label: "Anomalies",
        data: [chartDataFromAPI.week, chartDataFromAPI.month, chartDataFromAPI.total],
        backgroundColor: ["#FFF72D", "#5EDFFB", "#9BE4B4"],
        borderRadius: 4,
        barThickness: 80,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#000",
        anchor: "center",
        align: "center",
        font: { size: 14, weight: "bold" },
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#fff",
          font: { size: 12, weight: "bold" },
        },
        grid: { color: "#333", lineWidth: 0.5 },
      },
    },
  };

  return (
    <ChartBox title={`TOTAL ANOMALIES`}>
      <div className="flex justify-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#FFF72D] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Weekly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#5EDFFB] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Monthly</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#9BE4B4] rounded-sm"></span>
          <span className="text-white text-sm font-semibold">Yearly</span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
    </ChartBox>
  );
};

export default ReportsBarChart;
