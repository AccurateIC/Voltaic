// src/components/charts/GeneratorVoltageLineChart.tsx
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

export const BatteryChargeLineChart = ({ value }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "center" },
      tooltip: {},
      title: {
        display: true,
        text: "Battery Charge Monitor",
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
        title: { display: true, text: "Voltage (V) ⟶", font: { size: 18, weight: "normal" } },
        min: 0,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // timestamp: batteryItem.timestamp,
  const batteryData = value.map((item) => ({ x: item.timestamp, y: item.batteryVolts }));
  const chargeAltData = value.map((item) => ({ x: item.timestamp, y: item.chargeAltVolts }));

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Battery Voltage",
        data: batteryData,
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
        label: "Charging Alternator Voltage",
        data: chargeAltData,
        borderColor: "rgba(209, 120, 82, 1)",
        backgroundColor: "rgba(209, 120, 82, 0.5)",
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
