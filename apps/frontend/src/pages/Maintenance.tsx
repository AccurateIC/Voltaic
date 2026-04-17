import { useEffect, useMemo, useRef, useState } from "react";
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
import { tuyau } from "../lib/Tuyau";
import { Modules } from "../config/extern";
import Skeleton from "../components/Skeleton.jsx";

interface MaintenanceReason {
  accel_x?: string;
  accel_y?: string;
  accel_z?: string;
}

interface MaintenanceNotification {
  id: string;
  timestamp: string | DateTime;
  maintenanceReason: MaintenanceReason;
  predictedDominantFrequency: number;
  predictedDominantAmplitude: number;
  shouldBeDisplayed: boolean;
  resolvedAt: string | null;
}

interface VibrationData {
  id: string;
  timestamp: string | DateTime;
  value: number;
  confidenceScorePercentage: number;
  maintenanceNotificationId?: string | null;
  maintenanceNotification?: any;
}

ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ResetPdmDataButton = () => {
  const handleReset = async () => {
    const { data: user, error: userError } = await tuyau.auth.getLoggedInUser.$get();
    if (userError) {
      throw new Error("Failed to get logged in user");
    }

    // logout
    
    const sendUserToPdmServerResponse = await fetch(Modules.PDM + "/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, logged_in: false }),
    });
    if (!sendUserToPdmServerResponse.ok) {
      // toast.error("Failed to send user details to PDM server");
     
      throw new Error("Failed to send logout notif to PDM server");
    }
    

    // delete pdm vibration data and  notification data
    const { error } = await tuyau.pdm.delete.$delete();
    if (error) throw new Error("Failed to delete PDM Data");
    // pdm data deleted

    // now we need to send login request to PDM server
  
    const sendLogin = await fetch(Modules.PDM + "/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, logged_in: true }),
    });
    if (!sendLogin.ok) {
      // toast.error("Failed to send user details to PDM server");
      throw new Error("Failed to send logout notif to PDM server");
    }
    
  };
  return (
    <button className="btn btn-error" onClick={handleReset}>
      Reset PDM Data
    </button>
  );
};

const StatusCard = ({
  maintenanceNotification,
  show,
}: {
  maintenanceNotification: MaintenanceNotification | null;
  show: boolean;
}) => {
  return (
    <div className="card h-full">
      <div className="card-body">
        <h2 className="card-title">
          Predicted Dominant Frequency
          {maintenanceNotification !== null && show === true && <XCircle className="text-error" />}
          {show === false && <CheckCircle className="text-success" />}
        </h2>
        {maintenanceNotification !== null && show === true ? (
          <>
            <p className="text-sm text-base-content/70">{typeof maintenanceNotification?.timestamp === 'string' ? maintenanceNotification.timestamp : maintenanceNotification?.timestamp?.toString()}</p>
            <p className="text-xl font-bold">{maintenanceNotification?.predictedDominantFrequency} Hz</p>
            <p className="text-sm text-base-content/70">
              Predicted Dominant Amplitude: {maintenanceNotification?.predictedDominantAmplitude} G
            </p>
          </>
        ) : (
          <div className="text-xl flex items-center">No maintenance needed.</div>
        )}
      </div>
    </div>
  );
};

// ─── Downsample utility ─────────────────────────────────────────────────────
// Keeps at most `maxPoints` evenly-spaced items from an array.
// Always keeps the last point so the "live edge" is never clipped.
function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  const result: T[] = [];
  for (let i = 0; i < arr.length; i += step) result.push(arr[i]);
  // always include the very last point
  if (result[result.length - 1] !== arr[arr.length - 1]) result.push(arr[arr.length - 1]);
  return result;
}

const MAX_POINTS = 80; // max points per line rendered on screen

const PdmGraph = ({
  actualPdmData,
  forecastedPdmData,
  maintenanceNotificationUnixSeconds,
}: {
  actualPdmData: VibrationData[];
  forecastedPdmData: VibrationData[];
  maintenanceNotificationUnixSeconds: number[];
}) => {
  const getMillis = (ts: string | DateTime | any): number => {
    if (typeof ts === "string") return DateTime.fromISO(ts).toMillis();
    if (ts && ts.toMillis) return ts.toMillis();
    return new Date(ts.toString()).getTime();
  };

  const toUnixSeconds = (ts: string | DateTime | any): number | null => {
    const ms = getMillis(ts);
    if (!isFinite(ms)) return null;
    return Math.floor(ms / 1000);
  };

  const maintenanceSecondsSet = useMemo(
    () => new Set(maintenanceNotificationUnixSeconds),
    [maintenanceNotificationUnixSeconds],
  );

  // ── Find the latest timestamp across both datasets ──────────────────────
  const actualSorted = [...actualPdmData].sort((a, b) => getMillis(a.timestamp) - getMillis(b.timestamp));
  const forecastedSorted = [...forecastedPdmData].sort((a, b) => getMillis(a.timestamp) - getMillis(b.timestamp));

  let maxTime = 0;
  [...actualSorted, ...forecastedSorted].forEach((item) => {
    const t = getMillis(item.timestamp);
    if (!isNaN(t) && t > maxTime) maxTime = t;
  });

  // ── Show only the last 2 minutes (reduced from 5) ───────────────────────
  // Narrower window = fewer points per pixel = cleaner, more readable lines
  const twoMinsAgo = maxTime > 0 ? maxTime - 2 * 60 * 1000 : 0;

  const windowedActual     = actualSorted.filter((d)     => getMillis(d.timestamp) >= twoMinsAgo);
  const windowedForecasted = forecastedSorted.filter((d) => getMillis(d.timestamp) >= twoMinsAgo);

  // ── Downsample to MAX_POINTS each ───────────────────────────────────────
  const filteredActual     = downsample(windowedActual,     MAX_POINTS);
  const filteredForecasted = downsample(windowedForecasted, MAX_POINTS);

  // ── Chart.js options ─────────────────────────────────────────────────────
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // keeps updates glitch-free
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, pointStyleWidth: 20 },
      },
      tooltip: {
        titleFont: { size: 13 },
        bodyFont:  { size: 13 },
        callbacks: {
          title: (items) => items[0].dataset.label ?? "",
          label: (tooltipItem) => {
            const raw = tooltipItem.raw as any;
            const pointUnixSeconds =
              typeof raw.x === "number" ? Math.floor(raw.x / 1000) : toUnixSeconds(raw.x);
            const isMaintenance = pointUnixSeconds !== null && maintenanceSecondsSet.has(pointUnixSeconds);
            const base = `Value: ${raw.y} g units`;
            if (isMaintenance) {
              const predictedDominantFrequency = raw.predictedDominantFrequency;
              const predictedDominantAmplitude = raw.predictedDominantAmplitude;
              if (predictedDominantFrequency == null && predictedDominantAmplitude == null) return base;
              return [
                base,
                `Predicted Dominant Frequency: ${predictedDominantFrequency ?? "—"} Hz (Normal: 0.1 ± 0.005 Hz)`,
                `Predicted Dominant Amplitude: ${predictedDominantAmplitude ?? "—"} G (Normal: −2 to +2 G)`,
              ];
            }
            return base;
          },
        },
      },
      title: {
        display: true,
        text: "Vibration Sensor Data  (last 2 min)",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        type: "time",
        position: "bottom",
        time: {
          unit: "second",
          displayFormats: { second: "HH:mm:ss" },
          tooltipFormat: "HH:mm:ss",
        },
        ticks: {
          maxTicksLimit: 8,   // at most 8 x-axis labels → no crowding
          maxRotation: 0,     // keep labels horizontal
          autoSkip: true,
          color: "rgba(180,180,180,0.9)",
          font: { size: 11 },
        },
        grid: { color: "rgba(255,255,255,0.06)" },
        title: {
          display: true,
          text: "Time",
          font: { size: 14, weight: "normal" },
        },
      },
      y: {
        type: "linear",
        ticks: { color: "rgba(180,180,180,0.9)", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.06)" },
        title: {
          display: true,
          text: "Vibration Acceleration (g-units)",
          font: { size: 14, weight: "normal" },
        },
      },
    },
  };

  // ── Dataset definitions ──────────────────────────────────────────────────
  const data = {
    datasets: [
      // ── ACTUAL — solid yellow, slightly thicker ──────────────────────────
      {
        label: "Actual Vibration",
        fill: false,
        data: filteredActual.map((item) => ({
          x: getMillis(item.timestamp),
          y: item.value,
        })),
        borderColor:     "rgba(255, 220, 0, 0.92)",
        backgroundColor: "rgba(255, 220, 0, 0.25)",
        borderWidth: 2,
        tension: 0.3,            // smooth curves — not jagged spikes
        pointRadius: 0,          // no dots → cleaner dense view
        pointHoverRadius: 5,
        pointHitRadius: 10,
        spanGaps: true,
      },
      // ── FORECASTED — dashed blue, slightly thinner ───────────────────────
      // Dashed style makes it immediately distinguishable from Actual
      // even when lines overlap closely
      {
        label: "Forecasted Vibration",
        fill: false,
        data: filteredForecasted.map((item) => ({
          x: getMillis(item.timestamp),
          y: item.value,
          maintenanceId: item?.maintenanceNotificationId,
          predictedDominantFrequency: item?.maintenanceNotification?.predictedDominantFrequency,
          predictedDominantAmplitude: item?.maintenanceNotification?.predictedDominantAmplitude,
        })),
        borderColor:     "rgba(53, 162, 235, 0.88)",
        backgroundColor: "rgba(53, 162, 235, 0.15)",
        borderWidth: 1.5,
        borderDash: [6, 3],      // dashed = visually distinct from solid Actual line
        tension: 0.3,
        pointRadius: (ctx: any) => {
          if (!ctx.raw) return 0;
          const raw = ctx.raw as any;
          const pointUnixSeconds = typeof raw.x === "number" ? Math.floor(raw.x / 1000) : toUnixSeconds(raw.x);
          // Only render a dot on maintenance-alert points (unix-seconds match)
          return pointUnixSeconds !== null && maintenanceSecondsSet.has(pointUnixSeconds) ? 8 : 0;
        },
        pointBackgroundColor: (ctx: any) => {
          if (!ctx.raw) return "rgba(53, 162, 235, 0.5)";
          const raw = ctx.raw as any;
          const pointUnixSeconds = typeof raw.x === "number" ? Math.floor(raw.x / 1000) : toUnixSeconds(raw.x);
          return pointUnixSeconds !== null && maintenanceSecondsSet.has(pointUnixSeconds)
            ? "rgba(255, 60, 60, 0.85)" // red dot = maintenance alert
            : "rgba(53, 162, 235, 0.5)";
        },
        pointHoverRadius: 5,
        pointHitRadius: 10,
        spanGaps: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

const Maintenance = () => {
  const [actualPdmData, setActualPdmData] = useState<VibrationData[]>([]);
  const [forecastedPdmData, setForecastedPdmData] = useState<VibrationData[]>([]);
  const [maintenanceNotificationUnixSeconds, setMaintenanceNotificationUnixSeconds] = useState<number[]>([]);
  const [isLatestEntryError, setIsLatestEntryError] = useState(false);

  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [pdmError, setPdmError] = useState<MaintenanceNotification | null>(null);

  const pdmVibrationFetchSeqRef = useRef(0);

  const latestActualPdm = useMemo(() => {
    if (actualPdmData.length === 0) return null;
    const toMillis = (ts: string | DateTime) => (typeof ts === "string" ? DateTime.fromISO(ts).toMillis() : ts.toMillis());
    return actualPdmData.reduce((best, curr) => {
      if (!best) return curr;
      const bestMs = toMillis(best.timestamp);
      const currMs = toMillis(curr.timestamp);
      return currMs > bestMs ? curr : best;
    }, actualPdmData[0]);
  }, [actualPdmData]);

  const fetchNotificationTimestamps = async () => {
    try {
      const { data, error } = await tuyau.pdm.notification.getAll.$get();
      if (error) throw new Error("Failed to fetch notification timestamps");
      const seconds = (data ?? [])
        .map((item: any) => {
          const ts = item?.timestamp;
          if (!ts) return null;
          let dt: DateTime;
          if (typeof ts === "string") dt = DateTime.fromISO(ts);
          else if (ts?.toMillis) dt = ts as DateTime;
          else dt = DateTime.fromISO(String(ts));

          if (!dt?.isValid) return null;
          return Math.floor(dt.toMillis() / 1000);
        })
        .filter((v: number | null): v is number => typeof v === "number" && isFinite(v));

      setMaintenanceNotificationUnixSeconds(seconds);
    } catch (err) {
      console.error("Failed to fetch notification timestamps", err);
    }
  };

  const fetchLatestPdmNotification = async (isBackground = false) => {
    try {
      if (!isBackground) setIsPdmLoading(true);
      await fetchLatestPdmEntry(isBackground);

      const { data, error } = await tuyau.pdm.notification.getLatestUnresolved.$get();
      if (error) {
        throw new Error((error as any).message || "Failed to fetch notification data");
      }

      if (data.length > 0) {
        setPdmError(data[0] as unknown as MaintenanceNotification);
        if (isLatestEntryError) {
          // show toast notification only when latest entry was erroneous
          toast.warning(`Maintenance Alert: ${data[0]?.maintenanceReason?.accel_x}`);
        }
      } else {
        setPdmError(null);
      }
    } catch {
      toast.error("Error fetching notification data");
    } finally {
      if (!isBackground) setIsPdmLoading(false);
    }
  };

  const fetchLatestPdmEntry = async (isBackground = false) => {
    try {
      if (!isBackground) setIsPdmLoading(true);
      const { data, error } = await tuyau.pdm.getLatestEntry.$get();
      if (error) {
        throw new Error((error as any).message || "Failed to fetch latest PDM entry");
      }

      if (data.length > 0 && data[0]?.maintenanceNotificationId !== null) {
        // latest entry represented a maintenenace notification
        setIsLatestEntryError(true);
      } else {
        setIsLatestEntryError(false);
      }
    } catch (error) {
      console.error("Failed to fetch latest PDM entry", error);
    } finally {
      if (!isBackground) setIsPdmLoading(false);
    }
  };

  // live update when new data received
  useMessageBus(TransmitChannels.PDM, () => {
   
    Promise.all([
      fetchPdmVibrationData(true),
      fetchLatestPdmNotification(true),
      fetchNotificationTimestamps(),
      // fetchLatestPdmEntry(true),
    ]);
  });

  useEffect(() => {
    Promise.all([
      fetchPdmVibrationData(false),
      fetchLatestPdmNotification(),
      fetchNotificationTimestamps(),
      fetchLatestPdmEntry(),
    ]);

    // Fallback polling every 5 seconds in case SSE events are missed
    // const interval = setInterval(() => {
    //   Promise.all([fetchPdmVibrationData(true), fetchNotificationTimestamps()]);
    // }, 5000);
    //here i do 1st chnnage .
    // ✅ Add notification fetch in polling too
let abortController = new AbortController();

const interval = setInterval(() => {
  abortController.abort();
  abortController = new AbortController();
  Promise.all([
    fetchPdmVibrationData(true, abortController.signal),
    fetchLatestPdmNotification(true),
    fetchNotificationTimestamps(),
  ]);
}, 5000);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };


  }, []);
  const fetchPdmVibrationData = async (isBackground = false, signal?: AbortSignal) => {
    try {
      if (signal?.aborted) return;

      const seq = ++pdmVibrationFetchSeqRef.current;

      if (!isBackground && actualPdmData.length === 0) setIsPdmLoading(true);
      // fetch actual data
      const { data, error } = await tuyau.pdm.getRecentActual.$get();
      if (signal?.aborted) return;
      if (error) {
        throw new Error((error as any).message || `Failed to fetch pdm data`);
      }
      if (seq !== pdmVibrationFetchSeqRef.current) return;
      setActualPdmData(data as any);
     

      // fetch forecasted data
      const { data: forecastedData, error: forecastedError } = await tuyau.pdm.getRecentForecasted.$get();
      if (forecastedError) {
        throw new Error((forecastedError as any).message || `Failed to fetch pdm data`);
      }
      // alert(JSON.stringify(forecastedData, null, 2));
      if (seq !== pdmVibrationFetchSeqRef.current) return;
      setForecastedPdmData(forecastedData as any);
    } catch {
      if (!isBackground) toast.error(`Failed to fetch vibration data`);
    } finally {
      if (!isBackground) setIsPdmLoading(false);
    } 
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 overflow-x-hidden">
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-semibold text-base-content">Predictive Maintenance</h2>
          <div className="w-full sm:w-auto">
            <ResetPdmDataButton />
          </div>
        </div>
        {/* Predictive Maintenance */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 bg-base-100 shadow-sm text-base-content rounded-lg">
            <StatusCard maintenanceNotification={pdmError} show={isLatestEntryError} />
          </div>

          {/* Confidence Score */}
          <div className="bg-base-100 w-full md:w-1/2 rounded-lg">
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
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                  <p className="text-sm text-base-content/70">
                    {latestActualPdm
                      ? typeof latestActualPdm.timestamp === "string"
                        ? latestActualPdm.timestamp
                        : latestActualPdm.timestamp.toString()
                      : ""}
                  </p>
                  <p
                    className={cn(
                      "text-xl md:text-2xl font-bold",
                      (latestActualPdm?.confidenceScorePercentage ?? 0) >= 75 ? "text-success" : "text-error",
                    )}
                  >
                    {latestActualPdm?.confidenceScorePercentage ?? 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-base-100 min-h-[300px] md:min-h-auto flex items-stretch justify-center w-full">
        {(isPdmLoading || !actualPdmData || actualPdmData.length === 0) ? (
          <div className="w-full flex-1 p-4">
            <Skeleton type="chart" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PdmGraph
              actualPdmData={actualPdmData}
              forecastedPdmData={forecastedPdmData}
              maintenanceNotificationUnixSeconds={maintenanceNotificationUnixSeconds}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
