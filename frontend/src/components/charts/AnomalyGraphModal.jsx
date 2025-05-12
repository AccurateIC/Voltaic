import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { DateTime } from "luxon";
import { useEffect } from "react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const AnomalyGraphModal = ({ isOpen, onClose, graphData, selectedEntry }) => {
  useEffect(() => {
    console.log(graphData);
    console.log(selectedEntry);
  });
  if (!isOpen) return null;

  // Prepare data for Chart.js
  const sortedData = [...graphData].sort((a, b) => a.x - b.x);

  const chartData = {
    labels: sortedData.map((point) => DateTime.fromMillis(point.x).toFormat("HH:mm:ss")),
    datasets: [
      {
        label: "Anomaly Event",
        data: sortedData.map((point) => point.y),
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: "#ff0000",
        pointBorderColor: "#ff0000",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "timeseries",
        position: "bottom",

        min: DateTime.fromMillis(sortedData[0].x).minus({ minutes: 2.5 }).toISO(),
        max: DateTime.fromMillis(sortedData[0].x).plus({ minutes: 2.5 }).toISO(),
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
    <dialog id="my_modal_2" className="modal backdrop-blur-xs " open={isOpen}>
      <div className="modal-box max-w-6xl bg-base-200">
        <h3 className="text-base-content text-xl font-semibold mb-4 text-center">Anomaly Detection Timeline</h3>

        {graphData.length > 0 ? (
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-error text-center mt-4">No data available for graph.</p>
        )}

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
