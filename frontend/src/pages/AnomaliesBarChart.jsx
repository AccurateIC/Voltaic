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
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Anomalies Bar Chart",
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
        },
      },
      y: {
        title: {
          display: true,
          text: "Anomalies Counts",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
