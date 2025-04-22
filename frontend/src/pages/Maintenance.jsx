import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useMessageBus } from "../lib/MessageBus";
import { cn } from "../lib/Utils";
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
import { TransmitChannels } from "../lib/TransmitChannels";

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StatusCard = ({ maintenanceNotification, show }) => {
  return (
    <div className="card bg-base-100 w-1/2 shadow-sm text-base-content">
      <div className="card-body">
        <h2 className="card-title">
          Vibration Frequency
          {maintenanceNotification !== null && show === true && <XCircle className="text-error" />}
          {show === false && <CheckCircle className="text-success" />}
        </h2>
        {maintenanceNotification !== null && show === true && (
          <>
            <p className="text-sm text-base-content/70">{maintenanceNotification?.timestamp}</p>
            <p>{maintenanceNotification?.maintenanceReason?.accel_x}</p>
          </>
        )}
      </div>
    </div>
  );
};

const PdmGraph = ({ actualPdmData, forecastedPdmData, maintenanceNotificationTimestamps }) => {
  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {},
      title: {
        display: true,
        text: "Vibration Sensor Data",
        color: "#fff",
        font: {
          size: 18,
          weight: "normal",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        position: "bottom",
        // time: {
        //   unit: "minute", // or "hour", "day", etc.
        //   tooltipFormat: "yyyy-MM-dd HH:mm:ss",
        //   displayFormats: {
        //     minute: "HH:mm",
        //     hour: "MMM d, HH:mm",
        //     day: "MMM d",
        //   },
        // },
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
        fill: false,
        label: "Actual Vibration Data",
        data: actualPdmData.map((item) => ({
          x: DateTime.fromISO(item.timestamp),
          y: item.value,
        })),
        borderColor: "rgba(255, 246, 39, 0.65)",
        backgroundColor: "rgba(255, 246, 39, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointRadius: 0,
        // pointBorderColor: "rgba(255, 0, 0, 0.5)",
        pointHitRadius: 10,
      },
      // FORECASTED
      {
        fill: false,
        label: "Forecasted Vibration Data",
        data: forecastedPdmData.map((item) => ({
          // x: new Date(item.timestamp).getTime(),
          x: DateTime.fromISO(item.timestamp),
          y: item.value,
          maintenanceId: item.maintenanceNotificationId,
        })),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        pointHitRadius: 10,

        pointRadius: (ctx) => {
          if (!ctx.raw) return 0;
          const pointTime = DateTime.fromISO(ctx.raw.x).toUTC().toISO();
          return maintenanceNotificationTimestamps?.includes(pointTime) ? 10 : 0;
        },

        pointBackgroundColor: (ctx) => {
          if (!ctx.raw) return "rgba(53, 162, 235, 0.5)";
          // const pointTime = DateTime.fromISO(ctx.raw.x).toISO();
          const pointTime = DateTime.fromISO(ctx.raw.x).toUTC().toISO();
          return maintenanceNotificationTimestamps?.includes(pointTime)
            ? "rgba(255, 0, 0, 0.75)"
            : "rgba(53, 162, 235, 0.5)";
        },
      },
    ],
  };

  return <Line options={options} data={data} />;
};

const Maintenance = () => {
  const [actualPdmData, setActualPdmData] = useState([]);
  const [forecastedPdmData, setForecastedPdmData] = useState([]);
  const [maintenanceNotificationTimestamps, setMaintenanceNotificationTimestamps] = useState([]);
  const [isLatestEntryError, setIsLatestEntryError] = useState(false);

  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [pdmError, setPdmError] = useState(null);

  const fetchNotificationTimestamps = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/notification/getAll`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(JSON.stringify(response.json()));
      const data = await response.json();
      setMaintenanceNotificationTimestamps(data.map((item) => item?.timestamp));
    } catch (err) {
      console.error("Error fetching notification data", err);
    }
  };

  const fetchLatestPdmNotification = async () => {
    try {
      setIsPdmLoading(true);
      await fetchLatestPdmEntry();

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
        if (isLatestEntryError) {
          // show toast notification only when latest entry was erroneous
          toast.warning(`Maintenance Alert: ${data[0]?.maintenanceReason?.accel_x}`);
        }
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

  const fetchLatestPdmEntry = async () => {
    try {
      setIsPdmLoading(true);
      const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/getLatestEntry`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch latest PDM entry");
      }
      const data = await response.json();

      if (data.length > 0 && data[0]?.maintenanceNotificationId !== null) {
        // latest entry represented a maintenenace notification
        setIsLatestEntryError(true);
      } else {
        setIsLatestEntryError(false);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // toast.error("Error fetching notification data");
    } finally {
      setIsPdmLoading(false);
    }
  };

  // live update when new data received
  useMessageBus(TransmitChannels.PDM, (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    Promise.all([
      fetchPdmVibrationData(),
      fetchLatestPdmNotification(),
      fetchNotificationTimestamps(),
      // fetchLatestPdmEntry(),
    ]);
  });

  useEffect(() => {
    Promise.all([
      fetchPdmVibrationData(),
      // fetchLatestPdmNotification(),
      fetchNotificationTimestamps(),
      // fetchLatestPdmEntry(),
    ]);
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

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 flex flex-col gap-4 shrink-0">
        <h2 className="text-2xl font-bold mb-4 text-base-200">Predictive Maintenance</h2>
        {/* Predictive Maintenance */}
        <div className="flex flex-row gap-4">
          <StatusCard maintenanceNotification={pdmError} show={isLatestEntryError} />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {actualPdmData.length > 0 && (
          <PdmGraph
            actualPdmData={actualPdmData}
            forecastedPdmData={forecastedPdmData}
            maintenanceNotificationTimestamps={maintenanceNotificationTimestamps}
          />
        )}
      </div>
    </div>
  );
};

export default Maintenance;
