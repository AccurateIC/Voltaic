import "chartjs-adapter-luxon";
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
import { DateTime } from "luxon";
import { useChartZoom } from "../../hooks/useChartZoom";


export const EngineSpeedLineChart = ({ value }) => {
  const { chartRef, zoomOptions, handleZoom5Min, handleReset, handleZoomIn, handleZoomOut } = useChartZoom();
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
plugins: {
      legend: { display: true },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Speed (RPM)",
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
        title: { display: true, text: "Engine Speed (RPM) ⟶", font: { size: 18, weight: "normal" } },
        min: -100,
        max: 3000,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Create single dataset with conditional point colors
  const chartData = value.map((item) => ({ 
    x: item.timestamp, 
    y: item.propertyValue
  }));

  // Create point colors array - red for anomalies, blue for normal
 const pointColors = value.map((item) => 
    item.isAnomaly || item.propertyValue === 0 ? 'rgba(255, 0, 0, 1)' : 'rgba(82, 120, 209, 1)'
  );
  const pointBgColors = value.map((item) => 
    item.isAnomaly || item.propertyValue === 0 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(82, 120, 209, 0.5)'
  );
  const pointStyles = value.map(() => 'circle' as const);
  const pointRadius = value.map((item) =>
    item.isAnomaly || item.propertyValue === 0 ? 1.5: 0
  );

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Engine Speed (RPM)",
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
      <div className="flex items-center justify-center gap-2 py-2 flex-wrap">
        <button className="btn btn-xs btn-outline" onClick={handleZoomIn}>Zoom In +</button>
        <button className="btn btn-xs btn-outline" onClick={handleZoomOut}>Zoom Out -</button>
        <button className="btn btn-xs btn-outline" onClick={handleZoom5Min}>5 Min</button>
        <button className="btn btn-xs btn-error" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};
