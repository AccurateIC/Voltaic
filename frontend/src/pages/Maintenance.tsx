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
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-luxon";
import { TransmitChannels } from "../lib/TransmitChannels";
import { FaRegQuestionCircle } from "react-icons/fa";

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResetPdmDataButton = () => {
  const handleReset = async () => {
    const loggedInUser = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/getLoggedInUser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const user = await loggedInUser.json();

    // logout
    console.log("sending logout to pdm");
    const sendUserToPdmServerResponse = await fetch(`${import.meta.env.VITE_PDM_BACKEND}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, logged_in: false }),
    });
    if (!sendUserToPdmServerResponse.ok) {
      // toast.error("Failed to send user details to PDM server");
      console.error(await sendUserToPdmServerResponse.json());
      throw new Error("Failed to send logout notif to PDM server");
    }
    console.log("sent logout to pdm");

    // delete pdm vibration data and maintenance notification data
    const response = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/pdm/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete PDM Data");
    // pdm data deleted

    // now we need to send login request to PDM server
    console.log("sending logout to pdm");
    const sendLogin = await fetch(`${import.meta.env.VITE_PDM_BACKEND}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, logged_in: true }),
    });
    if (!sendLogin.ok) {
      // toast.error("Failed to send user details to PDM server");
      throw new Error("Failed to send logout notif to PDM server");
    }
    console.log("sent logout to pdm");
  };
  return (
    <button className="btn btn-error" onClick={handleReset}>
      Reset PDM Data
    </button>
  );
};

const StatusCard = ({ maintenanceNotification, show }) => {
  return (
    <div className="card h-full">
      <div className="card-body">
        <h2 className="card-title">
          Vibration Frequency
          {maintenanceNotification !== null && show === true && <XCircle className="text-error" />}
          {show === false && <CheckCircle className="text-success" />}
        </h2>
        {maintenanceNotification !== null && show === true ? (
          <>
            <p className="text-sm text-base-content/70">{maintenanceNotification?.timestamp}</p>
            <p>{maintenanceNotification?.maintenanceReason?.accel_x}</p>
          </>
        ) : (
          <div className="text-xl flex items-center">No maintenance needed.</div>
        )}
      </div>
    </div>
  );
};

const PdmGraph = ({ actualPdmData, forecastedPdmData, maintenanceNotificationTimestamps }) => {
  console.log("forecastedPdmData", forecastedPdmData);
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        callbacks: {
          title(tooltipItems) {
            return tooltipItems[0].dataset.label;
          },

          label: (tooltipItem) => {
            const dataPoint = tooltipItem.raw;
            const pointTime = DateTime.fromISO(dataPoint.x).toUTC().toISO();
            const isMaintenance = maintenanceNotificationTimestamps.includes(pointTime);

            const defaultLabel = `Value ${dataPoint.y} g units`;

            const label = [
              `Value: ${dataPoint.y} g units`,
              `Predicted Dominant Frequency: ${dataPoint.predictedDominantFrequency} (Normal Frequency: 0.1Hz ± 0.005Hz)`,
              `Predicted Dominant Amplitude: ${dataPoint.predictedDominantAmplitude} (Normal Amplitude: -2 to +2 g units)`,
            ];

            if (isMaintenance) {
              return label;
            }
            return defaultLabel;
          },
        },
      },
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
          maintenanceId: item?.maintenanceNotificationId,
          predictedDominantFrequency: item?.maintenanceNotification?.predictedDominantFrequency,
          predictedDominantAmplitude: item?.maintenanceNotification?.predictedDominantAmplitude,
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
      // alert(JSON.stringify(forecastedData, null, 2));
      setForecastedPdmData(forecastedData);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to fetch vibration data`);
    } finally {
      setIsPdmLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-4 text-base-content">Predictive Maintenance</h2>
          <div>
            <ResetPdmDataButton />
          </div>
        </div>
        {/* Predictive Maintenance */}
        <div className="flex flex-row gap-4">
          <div className="w-1/2 bg-base-100 shadow-sm text-base-content">
            <StatusCard maintenanceNotification={pdmError} show={isLatestEntryError} />
          </div>

          {/* Confidence Score */}
          <div className="bg-base-100 w-1/2">
            <div className="card h-full">
              <div className="card-body">
                <div className="flex gap-2 items-center">
                  <h2 className="card-title">Confidence Score</h2>
                  <span className="tooltip tooltip-bottom">
                    <div className="tooltip-content text-base">
                      A confidence score represents a measure of how certain a model is about its prediction.
                    </div>
                    <FaRegQuestionCircle size={18} />
                  </span>
                </div>
                <>
                  <p className="text-sm text-base-content/70">{actualPdmData[0]?.timestamp}</p>
                  <p
                    className={cn(
                      "text-xl",
                      actualPdmData[0]?.confidenceScorePercentage >= 75 ? "text-success" : "text-error"
                    )}>
                    {actualPdmData[0]?.confidenceScorePercentage}%
                  </p>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-base-100">
        {actualPdmData.length > 0 ? (
          <PdmGraph
            actualPdmData={actualPdmData}
            forecastedPdmData={forecastedPdmData}
            maintenanceNotificationTimestamps={maintenanceNotificationTimestamps}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl">No Maintenance Data</div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
