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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, TimeScale);

const AnomalyGraphModal = ({ isOpen, onClose, graphData = [], selectedEntry }) => {
  if (!isOpen || graphData.length === 0) return null;

  const sortedData = useMemo(() => {
    return [...graphData].sort((a, b) => a.x - b.x);
  }, [graphData]);

  const labels = sortedData.map((point) => DateTime.fromMillis(point.x).toFormat("HH:mm:ss"));

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
        min: DateTime.now().minus({ minutes: 5 }).toMillis(),
        max: DateTime.now().toMillis(),
        title: {
          display: true,
          text: "Timestamp",
          color: "#fff",
        },
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "#444",
        },
        time: {
          tooltipFormat: "HH:mm:ss",
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
          },
        },
      },
      y: {
        title: {
          display: true,
          text: `${selectedEntry?.archive?.gensetProperty?.readablePropertyName || "Property"} (${
            selectedEntry?.archive?.gensetProperty?.physicalQuantity?.unitSymbol || "unit"
          })`,
          color: "#fff",
        },
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "#444",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Value: ${context.raw}`,
        },
      },
    },
  };

  return (
    <dialog id="my_modal_2" className="modal backdrop-blur-sm" open={isOpen}>
      <div className="modal-box max-w-6xl bg-base-200">
        <h3 className="text-base-content text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="flex justify-end mt-4">
          <form method="dialog" onClick={onClose}>
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AnomalyGraphModal;
