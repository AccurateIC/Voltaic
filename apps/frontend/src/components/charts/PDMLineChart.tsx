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
import { useChartZoom } from "../../hooks/useChartZoom";
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

export const PDMLineChart = ({ value, showControls = false }: { value: VibrationDataPoint[]; showControls?: boolean }) => {
  const { chartRef, zoomOptions, handleZoom5Min, handleReset, handleZoomIn, handleZoomOut } = useChartZoom();
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
  const raw = tooltipItems[0].raw as { x: any; y: number };
  const x = raw.x;
  if (x && typeof x.toFormat === "function") return x.toFormat("HH:mm:ss");
  if (typeof x === "number") return DateTime.fromMillis(x).toFormat("HH:mm:ss");
  if (typeof x === "string") return DateTime.fromISO(x).toFormat("HH:mm:ss");
  return String(x);
},
        },
      },
      title: {
        display: true,
        text: "Vibration Data",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
      ...zoomOptions.plugins,
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
        x: DateTime.fromISO(item.timestamp),
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
          x: DateTime.fromISO(item.timestamp),
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

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0">
        <Line ref={chartRef} options={options} data={data} />
      </div>
      {showControls && (
        <div className="flex items-center justify-center gap-1 px-3 py-2 bg-base-300 border-t border-base-content/10">
          <div className="flex items-center bg-base-100 rounded border border-base-content/20 overflow-hidden">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="px-3 py-1.5 text-xs font-mono font-semibold text-cyan-400 hover:bg-cyan-400/10 border-r border-base-content/20 transition-colors tracking-wider uppercase"
            >
              + Zoom In
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="px-3 py-1.5 text-xs font-mono font-semibold text-cyan-400 hover:bg-cyan-400/10 border-r border-base-content/20 transition-colors tracking-wider uppercase"
            >
              - Zoom Out
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoom5Min(); }}
              className="px-3 py-1.5 text-xs font-mono font-semibold text-amber-400 hover:bg-amber-400/10 border-r border-base-content/20 transition-colors tracking-wider uppercase"
            >
              5 Min
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="px-3 py-1.5 text-xs font-mono font-semibold text-red-400 hover:bg-red-400/10 transition-colors tracking-wider uppercase"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDMLineChart;
