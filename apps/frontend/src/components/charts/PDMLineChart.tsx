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
interface VibrationDataPoint {
  timestamp: string;
  value: number;
  actual: number | null;
  forecast: number | null;
  sensorProperty: string;
  unit: string;
  hasNotification?: boolean;
}

// Register ChartJS components
ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const PDMLineChart = ({ value }: { value: VibrationDataPoint[] }) => {
  // const value = value.slice(-2000);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `Vibration: ${context.parsed.y}`,
          title: (tooltipItems) => {
            const dataPoint = tooltipItems[0].raw as { x: DateTime; y: number };
            return dataPoint.x.toFormat("HH:mm:ss");
          },
        },
      },
      title: {
        display: true,
        text: "Vibration Data",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        type: "time",
        position: "bottom",
        title: { display: true, text: "Time ⟶", font: { size: 18, weight: "normal" } },
        // min: DateTime.now().minus({ hours: 1 }).toISO(),
        // max: DateTime.now().toISO(),
      },
      y: {
        type: "linear",
        title: { display: true, text: "Vibration Acceleration (G-Units) ⟶", font: { size: 18, weight: "normal" } },
      },
    },
  };

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Vibration Data",
        data: value.map((item) => ({
          x: DateTime.fromISO(item.timestamp).toISO(),
          y: item.actual
        })) as any,  // ✅ Move 'as any' here
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointRadius: 0,
        pointHitRadius: 10,
        spanGaps: true,
      },
      {
        label: "Maintenance Alert",
        data: value
          .filter((item) => item.hasNotification)
          .map((item) => ({
            x: DateTime.fromISO(item.timestamp).toISO(),
            y: item.actual
          })) as any,
        borderColor: "rgba(255, 0, 0, 1)",
        backgroundColor: "rgba(255, 0, 0, 1)",
        pointStyle: "circle",
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default PDMLineChart;
