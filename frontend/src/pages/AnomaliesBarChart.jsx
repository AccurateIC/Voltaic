import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register required components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnomaliesBarChart = ({ labels, dataset }) => {
  console.log(dataset);
  
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Property Data",
        data: dataset,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        borderWidth: 1,
        barPercentage: 0.5,       // 👈 controls actual bar width
        categoryPercentage: 0.5,  // 👈 controls spacing between bars in a category
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        // text: "Anomalies By ",
        color: 'White',
        font: {
          weight: 'bold',
          size:22,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Value: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days",
          maxBarThickness: 40,
          color: 'white',
          font: {
            weight: 'bold',
            size: 18,
          },
        },
        ticks: {
          color: 'white',
          font: {
            weight: 'bold',
            size: 16// This makes X-axis tick labels bold
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Anomalies Counts",
          color: 'white',
          font: {
            weight: 'bold',
            size: 18,
          },
        },
        ticks: {
          beginAtZero: true,
          color: 'white',
          font: {
            weight: 'bold',
          },
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
