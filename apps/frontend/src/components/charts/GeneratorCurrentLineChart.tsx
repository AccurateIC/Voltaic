// src/components/charts/GeneratorCurrentLineChart.tsx
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
import { DateTime } from "luxon";

// Register ChartJS components

export const GeneratorCurrentLineChart = ({ value }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "center" },
      tooltip: {},
      title: {
        display: true,
        text: "Generator Current Monitor",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        type: "timeseries",
        position: "bottom",
        title: { display: true, text: "Time ⟶", font: { size: 18, weight: "normal" } },
        min: DateTime.now().minus({ hours: 1 }).toISO(),
        max: DateTime.now().toISO(),
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        ticks: { display: true },
      },
      y: {
        type: "linear",
        title: { display: true, text: "Current (A) ⟶", font: { size: 18, weight: "normal" } },
        min: 0,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Create an array of { x, y } objects for each line
  const l1Data = value.map((item) => ({ x: item.timestamp, y: item.L1 }));
  const l2Data = value.map((item) => ({ x: item.timestamp, y: item.L2 }));
  const l3Data = value.map((item) => ({ x: item.timestamp, y: item.L3 }));

  

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "L1",
        data: l1Data,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
      {
        fill: false,
        label: "L2",
        data: l2Data,
        borderColor: "rgba(209, 120, 82, 1)",
        backgroundColor: "rgba(209, 120, 82, 0.5)",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
      {
        fill: false,
        label: "L3",
        data: l3Data,
        borderColor: "rgba(82, 209, 120, 1)",
        backgroundColor: "rgba(82, 209, 120, 0.5)",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default GeneratorCurrentLineChart;
