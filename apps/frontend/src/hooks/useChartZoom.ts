import { useRef } from "react";
import { Chart } from "chart.js";
import ZoomPlugin from "chartjs-plugin-zoom";

Chart.register(ZoomPlugin);

export const useChartZoom = () => {
  const chartRef = useRef<Chart | null>(null);

  const zoomOptions = {
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x" as const,
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: "x" as const,
        },
      },
    },
  };

  const handleZoom5Min = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const now = Date.now();
    const fiveMinAgo = now - 5 * 60 * 1000;
    chart.zoomScale("x", { min: fiveMinAgo, max: now }, "default");
  };

  const handleReset = () => {
    chartRef.current?.resetZoom();
  };

  const handleZoomIn = () => {
    chartRef.current?.zoom(1.5);
  };

  const handleZoomOut = () => {
    chartRef.current?.zoom(0.5);
  };

  return {
    chartRef,
    zoomOptions,
    handleZoom5Min,
    handleReset,
    handleZoomIn,
    handleZoomOut,
  };
};