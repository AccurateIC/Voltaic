import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const PropertyBarChart = ({ labels, dataset }) => {
  // 🎯 Dynamic max calculation (rounded to 10)
  const maxValue = Math.max(...(dataset?.length ? dataset : [0]), 10);
  const roundedMax = Math.ceil(maxValue / 10) * 10;

  const backgroundColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC24A",
    "#EA5F89",
    "#00BBD6",
    "#F06292",
  ];

  const getBackgroundColor = (index) => {
    return backgroundColors[index % backgroundColors.length];
  };

  const data = {
    labels: labels?.length ? labels : ["No Data"],
    datasets: [
      {
        label: "Anomaly Count",
        data: dataset?.length ? dataset : [0],
        backgroundColor: labels?.map((_, i) => getBackgroundColor(i)),
        borderColor: labels?.map((_, i) => getBackgroundColor(i)),
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
        text: "Anomaly Count by Property",
        color: "rgba(255, 255, 255, 0.6)",
        font: { weight: "bold", size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Count: ${context.raw}`,
        },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Properties ⟶",
          color: "white",
          font: { weight: "bold", size: 16 },
        },
        ticks: {
          color: "white",
          autoSkip: false,
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        min: 0,
        max: roundedMax,
        ticks: {
          stepSize: 10,
          color: "white",
        },
        title: {
          display: true,
          text: "No. of Anomalies ⟶",
          color: "rgba(255,255,255,0.7)",
          font: { weight: "bold", size: 14 },
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return <Bar data={data} options={options} />;
};