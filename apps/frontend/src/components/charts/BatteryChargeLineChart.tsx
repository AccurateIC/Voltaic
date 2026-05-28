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
import { useChartZoom } from "../../hooks/useChartZoom";

// Register ChartJS components

export const BatteryChargeLineChart = ({ value, showControls = false }) => {
  const { chartRef, zoomOptions, handleZoom5Min, handleReset, handleZoomIn, handleZoomOut } = useChartZoom();
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
        title: { display: true, text: "Voltage (V) ⟶", font: { size: 18, weight: "normal" } },
        min: -5,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // timestamp: batteryItem.timestamp,
 const batteryData = value.map((item) => ({ x: item.timestamp, y: item.batteryVolts }));
  const chargeAltData = value.map((item) => ({ x: item.timestamp, y: item.chargeAltVolts }));

  const batteryRadius = value.map((item) => item.batteryIsAnomaly || item.batteryVolts === 0 ? 1.5 : 0);
  const chargeAltRadius = value.map((item) => item.chargeAltIsAnomaly || item.chargeAltVolts === 0 ? 1.5 : 0);

  const batteryBgColors = value.map((item) => item.batteryIsAnomaly || item.batteryVolts === 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(82, 120, 209, 0.5)');
  const chargeAltBgColors = value.map((item) => item.chargeAltIsAnomaly || item.chargeAltVolts === 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(209, 120, 82, 0.5)');

  const batteryBorderColors = value.map((item) => item.batteryIsAnomaly || item.batteryVolts === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(82, 120, 209, 1)');
  const chargeAltBorderColors = value.map((item) => item.chargeAltIsAnomaly || item.chargeAltVolts === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(209, 120, 82, 1)');

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Battery Voltage",
        data: batteryData,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointStyle: "circle",
        pointRadius: batteryRadius,
        pointBackgroundColor: batteryBgColors,
        pointBorderColor: batteryBorderColors,
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
        pointRadius: chargeAltRadius,
        pointBackgroundColor: chargeAltBgColors,
        pointBorderColor: chargeAltBorderColors,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
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
