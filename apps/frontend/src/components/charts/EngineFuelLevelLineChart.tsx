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
ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const EngineFuelLevelLineChart = ({ fuelLevelData }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "center" },
      tooltip: {},
      title: { display: true, text: "Engine Fuel Level Monitor", color: "#fff", font: { size: 18, weight: "normal" } },
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
        title: { display: true, text: "Fuel Level (Liter) ⟶ ", font: { size: 18, weight: "normal" } },
        min: 0,
        max: 80,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const chartData = fuelLevelData.map((item) => ({ x: item.timestamp, y: item.propertyValue }));

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Fuel Level",
        // data: fuelLevelData.map((item) => item.engineFuelLevel),
        data: chartData,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
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

export default EngineFuelLevelLineChart;
