import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register required components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnomaliesBarChart = ({ labels, dataset }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Property Data",
        data: dataset,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        borderWidth: 1,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Anomaly Count",
        color: "white",
        font: {
          weight: "bold",
          size: 22,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Value: ${context.raw}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Range ⟶",
          maxBarThickness: 40,
          color: "white",
          font: {
            weight: "bold",
            size: 14,
          },
        },
        ticks: {
          color: "white",
          font: {
            weight: "bold",
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Anomalies Counts ⟶",
          color: "white",
          font: {
            weight: "bold",
            size: 14,
          },
        },
        ticks: {
          beginAtZero: true,
          color: "white",
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
