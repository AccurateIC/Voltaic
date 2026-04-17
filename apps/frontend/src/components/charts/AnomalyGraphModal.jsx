// src/components/charts/AnomalyGraphModal.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { GenericAnimatedModal } from "../GenericAnimatedModal";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale);

const AnomalyGraphModal = ({ isOpen, onClose, graphData = [], selectedEntry }) => {

  if (!isOpen || graphData.length === 0) return null;

  const sortedData = useMemo(() => {
    return [...graphData].sort((a, b) => a.x - b.x);
  }, [graphData]);

  // const labels = sortedData.map((point) => DateTime.fromMillis(point.x).toFormat("HH:mm:ss"));
  const labels = sortedData.map((point) => point.x.toFormat("HH:mm:ss"));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Anomaly Event",
        data: sortedData.map((point) => point.y),
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#ff0000",
      },
    ],
  };
  // const xMin = DateTime.fromMillis(sortedData[0].x).minus({ minutes: 2.5 }).toISO();
  // const xMax = DateTime.fromMillis(sortedData[0].x).plus({ minutes: 2.5 }).toISO();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "timeseries",
        position: "bottom",
        // min: DateTime.now().minus({ minutes: 20 }).toMillis(),
        // max: DateTime.now().toMillis(),
        title: { display: true, text: "Timestamp", color: "#fff" },
        ticks: { color: "#fff" },
        grid: { color: "#444" },
        time: { unit: "second", tooltipFormat: "HH:mm:ss", displayFormats: { second: "yyyy-mm-dd HH:mm:ss" } },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: `${selectedEntry?.archive?.gensetProperty?.readablePropertyName || "Property"} (${
            selectedEntry?.archive?.gensetProperty?.physicalQuantity?.unitSymbol || "unit"
          })`,
          color: "#fff",
        },
        ticks: { color: "#fff" },
        grid: { color: "#444" },
      },
    },
    plugins: {
      legend: { labels: { color: "#fff" } },
      tooltip: { callbacks: { label: (context) => `Value: ${context.raw}` } },
    },
  };

  return (
    <GenericAnimatedModal isOpen={isOpen} onClose={onClose}>
      <div className="h-full flex flex-col">
        <h3 className="text-base-content text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>
        <div className="flex-1">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </GenericAnimatedModal>
  );
};

export default AnomalyGraphModal;
