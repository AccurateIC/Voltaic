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

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StatusCard = ({ isLoading, title, isError, errorMessage, disabled }) => {
  return (
    <div
      className={cn(
        "w-full h-18 shadow-sm flex flex-row rounded items-center p-4",
        disabled ? "text-gray-600 bg-gray-400" : "text-base-content bg-base-200"
      )}>
      <div className="font-bold flex flex-row space-x-2">
        {isLoading ? (
          <>
            <div>{`Checking ${title}`}</div>
            <span className="loading loading-infinity loading-md"></span>
          </>
        ) : (
          <div>{title}</div>
        )}
        {!isLoading && isError && !disabled ? (
          <div className="tooltip tooltip-error" data-tip={errorMessage}>
            <XCircle className="text-error" />
          </div>
        ) : !isLoading && !isError && !disabled ? (
          <div>
            <CheckCircle className="text-success" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// {
//   "id": 1,
//   "timestamp": "2025-03-27T07:21:22.000Z",
//   "sensorPropertyId": 1,
//   "value": 0,
//   "maintenanceNotificationId": null,
//   "pdmDataKindId": 1,
//   "createdAt": "2025-04-02T11:13:03.418+00:00",
//   "updatedAt": "2025-04-02T11:13:03.418+00:00",
//   "sensorProperty": {
//     "id": 1,
//     "propertyName": "vibration_acceleration_x",
//     "unit": "g",
//     "createdAt": "2025-04-02T11:12:51.769+00:00",
//     "updatedAt": "2025-04-02T11:12:51.770+00:00"
//   },
//   "pdmDataKind": {
//     "id": 1,
//     "kind": "actual",
//     "createdAt": "2025-04-02T11:12:51.763+00:00",
//     "updatedAt": "2025-04-02T11:12:51.763+00:00"
//   }
// }

const PdmGraph = ({ actualPdmData, forecastedPdmData }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Vibration Sensor Data",
        color: "#fff",
        font: {
          size: 18,
          weight: "bold",
        },
      },
      tooltip: {},
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
        },
      },
      y: {
        title: {
          display: true,
          text: "Vibration Acceleration (g-units)",
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

  return <Line options={options} data={data} />;
};

const Maintenance = () => {
  const [actualPdmData, setActualPdmData] = useState([]);
  const [forecastedPdmData, setForecastedPdmData] = useState([]);

  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [isPdmError, setIsPdmError] = useState(false);
  const [pdmErrorMessage, setPdmErrorMessage] = useState("");

  // fetch pdmData from localstorage
  useEffect(() => {
    fetchPdmVibrationData();
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
  });

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-4 flex flex-col gap-4 shrink-0">
        <h2 className="text-2xl font-bold mb-4 text-base-200">Predictive Maintenance</h2>
        {/* Predictive Maintenance */}
        <div className="flex flex-row gap-4">
          <StatusCard
            isLoading={isPdmLoading}
            title={`Vibration Frequency`}
            isError={isPdmError}
            errorMessage={pdmErrorMessage}
            disabled={false}
          />
          {/*
          <StatusCard isLoading={isPdmLoading} title={`Temperature`} isError={false} errorMessage={``} disabled={true} />
          <StatusCard
            isLoading={isPdmLoading}
            title={`Hydrocarbon Emission`}
            isError={false}
            errorMessage={``}
            disabled={true}
          />
          */}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {actualPdmData.length > 0 && <PdmGraph actualPdmData={actualPdmData} forecastedPdmData={forecastedPdmData} />}
      </div>
    </div>
  );
};

export default Maintenance;
