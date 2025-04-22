import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useMessageBus } from "../lib/MessageBus.js";
import { cn } from "../lib/Utils.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import { TransmitChannels } from "../lib/TransmitChannels.js";

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StatusCard = ({ maintenanceNotification }) => {
  return (
    <div className="card bg-base-100 w-1/2 shadow-sm text-base-content">
      <div className="card-body">
        <h2 className="card-title">
          Vibration Frequency
          {maintenanceNotification !== null && <XCircle className="text-error" />}
          {maintenanceNotification === null && <CheckCircle className="text-success" />}
        </h2>
        {maintenanceNotification !== null && (
          <>
            <p className="text-sm text-base-content/70">{maintenanceNotification?.timestamp}</p>
            <p>{maintenanceNotification?.maintenanceReason?.accel_x}</p>
          </>
        )}
      </div>
    </div>
  );
};

const PdmGraph = ({ actualPdmData, forecastedPdmData }) => {
  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {},
      // title: {
      //   display: true,
      //   text: "Vibration Sensor Data",
      //   color: "#fff",
      //   font: {
      //     size: 18,
      //     weight: "normal",
      //   },
      // },
    },
    scales: {
      x: {
        type: "time",
        position: "bottom",
        time: {
          unit: "minute", // or "hour", "day", etc.
          tooltipFormat: "yyyy-MM-dd HH:mm:ss",
          displayFormats: {
            minute: "HH:mm",
            hour: "MMM d, HH:mm",
            day: "MMM d",
          },
        },
        title: {
          display: true,
          text: "Timestamp",
          font: {
            size: 18,
            weight: "normal",
          },
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Vibration Acceleration (g-units)",
          font: {
            size: 18,
            weight: "normal",
          },
        },
      },
    },
  };

  const data = {
    datasets: [
      // ACTUAL
      {
        label: "Actual Vibration Data",
        data: actualPdmData.map((item) => ({
          // x: new Date(item.timestamp).getTime(),
          x: DateTime.fromISO(item.timestamp).toJSDate(),
          y: item.value,
        })),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointRadius: 0,
        pointHitRadius: 10,
      },
      // FORECASTED
      {
        label: "Forecasted Vibration Data",
        data: forecastedPdmData.map((item) => ({
          // x: new Date(item.timestamp).getTime(),
          x: DateTime.fromISO(item.timestamp).toJSDate(),
          y: item.value,
        })),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };

  return <Line key={actualPdmData.length + "-" + forecastedPdmData.length} options={options} data={data} />;
};

const Maintenance = () => {
  const [actualPdmData, setActualPdmData] = useState([]);
  const [forecastedPdmData, setForecastedPdmData] = useState([]);

  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [pdmError, setPdmError] = useState(null);

  const fetchLatestPdmNotification = async () => {
    try {
      setIsPdmLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getLatestUnresolved`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch notification data");
      }
      const data = await response.json();

      if (data.length > 0) {
        setPdmError(data[0]);
        toast.warning(`Maintenance Alert: ${data[0]?.maintenanceReason?.accel_x}`);
      } else {
        setPdmError(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching notification data");
    } finally {
      setIsPdmLoading(false);
    }
  };

  useMessageBus(TransmitChannels.PDM, (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    fetchLatestPdmNotification();
  });

  // fetch pdmData from localstorage
  useEffect(() => {
    fetchPdmVibrationData();
    fetchLatestPdmNotification();
    // const pdmDataString = localStorage.getItem("pdmData");
    // setPdmData(JSON.parse(pdmDataString));
  }, []);

  const fetchPdmVibrationData = async () => {
    try {
      setIsPdmLoading(true);
      // fetch actual data
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/getRecentActual`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch pdm data`);
      }

      const data = await response.json();
      setActualPdmData(data);

      // fetch forecasted data
      const forecastedResponse = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/getRecentForecasted`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!forecastedResponse.ok) {
        const errorData = await forecastedResponse.json();
        throw new Error(errorData.message || `Failed to fetch pdm data`);
      }

      const forecastedData = await forecastedResponse.json();
      setForecastedPdmData(forecastedData);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to fetch vibration data`);
    } finally {
      setIsPdmLoading(false);
    }
  };

  useMessageBus("pdm", (message) => {
    console.log("new pdm data received liveeee");
    // setPdmData(JSON.parse(localStorage.getItem("pdmData")));
    // fetch data from database
    fetchPdmVibrationData();
    fetchLatestPdmNotification();
  });

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 flex flex-col gap-4 shrink-0">
        <h2 className="text-2xl font-bold mb-4 text-base-200">Predictive Maintenance</h2>
        {/* Predictive Maintenance */}
        <div className="flex flex-row gap-4">
          <StatusCard maintenanceNotification={pdmError} />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {actualPdmData.length > 0 && <PdmGraph actualPdmData={actualPdmData} forecastedPdmData={forecastedPdmData} />}
      </div>
    </div>
  );
};

export default Maintenance;
