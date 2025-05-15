import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const ReportsRulChart = () => {
  const data = {
    labels: Array.from({ length: 100 }, (_, i) => (i + 1) * 100),
    datasets: [
      {
        label: 'Health Index Trend',
        data: Array.from({ length: 100 }, (_, i) =>
          1 / Math.log(i + 2) + Math.random() * 0.01
        ).reverse(),
        borderColor: 'yellow',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time in Hours",
          color: "#fff",
          font: { size: 14 },
        },
        reverse: true,
        ticks: { color: '#fff' },
        grid: { color: '#888' },
      },
      y: {
        title: {
          display: true,
          text: "Time",
          color: "#fff",
          font: { size: 14 },
        },        
        min: 0.1,
        max: 1,
        ticks: { color: '#fff' },
        grid: { color: '#888' },
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  return (
    <div className="bg-[#2f2f2f] rounded-2xl shadow-lg p-4 w-full h-[450px]">
      <h2 className="text-white font-semibold text-md mb-2">RUL</h2>
      <div className="h-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ReportsRulChart;
