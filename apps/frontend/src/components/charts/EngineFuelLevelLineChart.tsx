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
// Register ChartJS components

export const EngineFuelLevelLineChart = ({ fuelLevelData, showControls = false }) => {
  const { chartRef, zoomOptions, handleZoom5Min, handleReset, handleZoomIn, handleZoomOut } = useChartZoom();
const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", align: "center" },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Fuel Level Monitor",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
      ...zoomOptions.plugins,
    },
    scales: {
    x: {
        type: "timeseries",
        position: "bottom",
        title: { display: true, text: "Time ⟶", font: { size: 18, weight: "normal" } },
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        ticks: { display: true },
      },
    y: {
        type: "linear",
        title: { display: true, text: "Fuel Level (Liter) ⟶ ", font: { size: 18, weight: "normal" } },
        min: -3,
        max: 80,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Create single dataset with conditional point colors
  const chartData = fuelLevelData.map((item) => ({ 
    x: item.timestamp, 
    y: item.propertyValue
  }));

  // Create point colors array - red for anomalies, blue for normal
const pointColors = fuelLevelData.map((item) => 
  item.isAnomaly || item.propertyValue === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(82, 120, 209, 1)'
);

  // Create point background colors array
const pointBgColors = fuelLevelData.map((item) => 
  item.isAnomaly || item.propertyValue === 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(82, 120, 209, 0.5)'
);

  // Create point styles array - triangle for anomalies, circle for normal
 const pointStyles = fuelLevelData.map(() => 'circle' as const);

  // Create point radius array - larger for anomalies
const anomalyCount = fuelLevelData.filter((item) => item.isAnomaly).length;
  console.log("Total anomaly points:", anomalyCount, "Sample:", fuelLevelData.slice(0, 3));

 const pointRadius = fuelLevelData.map((item) =>
  item.isAnomaly || item.propertyValue === 0 ? 1.5 : 0
);
  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Fuel Level",
        data: chartData,
        borderColor: "rgba(82, 120, 209, 1)", // Keep line blue
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointBackgroundColor: pointBgColors,
        pointBorderColor: pointColors,
        pointStyle: pointStyles,
        pointRadius: pointRadius,
       pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
        tension: 0.1,
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

export default EngineFuelLevelLineChart;
