import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { DateTime } from "luxon";

const StatusCard = ({ isLoading, title, isError, errorMessage }) => {
  return (
    <div className="bg-base-200 w-full h-18 shadow-sm flex flex-row text-base-content rounded items-center p-4">
      <div className="font-bold flex flex-row space-x-2">
        {isLoading ? (
          <>
            <div>{`Checking ${title}`}</div>
            <span className="loading loading-infinity loading-md"></span>
          </>
        ) : (
          <div>{title}</div>
        )}
        {!isLoading && isError ? (
          <div className="tooltip tooltip-error" data-tip={errorMessage}>
            <XCircle className="text-error" />
          </div>
        ) : !isLoading && !isError ? (
          <div>
            <CheckCircle className="text-success" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Maintenance = () => {
  const [pdmData, setPdmData] = useState([]);
  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [isPdmError, setIsPdmError] = useState(false);
  const [pdmErrorMessage, setPdmErrorMessage] = useState("");

  // fetch pdm data from server
  const fetchPdm = async () => {
    try {
      setIsPdmLoading(true);
      const response = await fetch(`${import.meta.env.VITE_PDM_BACKEND}/getPdmForecast`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      console.log("PDM data:", data);

      const timestamps = Object.keys(data.last_values);
      const lastValues = Object.values(data.last_values);
      const forecastedValues = data.forecasted_values;

      // Create actual data points
      const actualData = [];
      for (let i = 0; i < timestamps.length; ++i) {
        const ts = DateTime.fromSeconds(Math.round(timestamps[i]));
        const tss = ts.toISO();
        actualData.push({
          timestamp: tss,
          actualValue: lastValues[i],
        });
      }

      // Create forecast data points
      const forecastData = [];
      for (let i = 0; i < timestamps.length; ++i) {
        const ts = DateTime.fromSeconds(Math.round(timestamps[i])).plus({
          seconds: timestamps[timestamps.length - 1] + i,
        });
        const tss = ts.toISO();
        forecastData.push({
          timestamp: tss,
          forecastedValue: forecastedValues[i],
        });
      }

      // Combine all data points
      const combinedData = [...actualData, ...forecastData].sort((a, b) =>
        DateTime.fromISO(a.timestamp) < DateTime.fromISO(b.timestamp) ? -1 : 1
      );

      setPdmData({ pdmData: combinedData, error: data.PDM });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching data");
    } finally {
      setIsPdmLoading(false);
    }
  };

  // initial fetch of PDM
  useEffect(() => {
    fetchPdm();
  }, []);

  //
  useEffect(() => {
    if (pdmData.error === true) {
      setIsPdmError(true);
      setPdmErrorMessage("Problem detected in Vibration Frequency");
    } else {
      setIsPdmError(false);
    }
  }, [pdmData]);

  return (
    <>
      <div className="p-4 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4 text-base-200">Predictive Maintenance</h2>
        {/* Predictive Maintenance */}
        <div className="flex flex-row gap-4">
          <StatusCard
            isLoading={isPdmLoading}
            title={`Vibration Frequency`}
            isError={isPdmError}
            errorMessage={pdmErrorMessage}
          />
          <StatusCard isLoading={isPdmLoading} title={`Temperature`} isError={false} errorMessage={``} />
          <StatusCard isLoading={isPdmLoading} title={`Hydrocarbon Emission`} isError={false} errorMessage={``} />
        </div>
      </div>
      <div>
        {isPdmError && (
          <div className="mt-6 w-full h-128">
            <h3 className="text-xl font-semibold text-base-content">Analysis Graph</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pdmData.pdmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#fff"
                  angle={0}
                  tickFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
                />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }} />
                <Line type="monotone" dataKey="actualValue" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} name="Actual" />
                <Line
                  type="monotone"
                  dataKey="forecastedValue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {!isPdmError && !isPdmLoading && (
          <div className="text-success font-bold text-center mt-4 text-xl">All set - Working in Good Condition</div>
        )}
      </div>
    </>
  );
};

export default Maintenance;
