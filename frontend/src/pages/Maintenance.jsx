import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { useMessageBus } from "../lib/MessageBus.js";
import { cn } from "../lib/Utils.js";

const StatusCard = ({ isLoading, title, isError, errorMessage, disabled }) => {
  return (

    <div className={cn(
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
    </div >
  );
};

const Maintenance = () => {
  const [pdmData, setPdmData] = useState([]);
  const [pdmDataForGraph, setPdmDataForGraph] = useState([]);
  const [isPdmLoading, setIsPdmLoading] = useState(true);
  const [isPdmError, setIsPdmError] = useState(false);
  const [pdmErrorMessage, setPdmErrorMessage] = useState("");

  // fetch pdmData from localstorage
  useEffect(() => {
    const pdmDataString = localStorage.getItem("pdmData");
    setPdmData(JSON.parse(pdmDataString));
  }, []);

  useMessageBus("pdm", (message) => {
    console.log("new pdm data received liveeee");
    setPdmData(JSON.parse(localStorage.getItem("pdmData")));
  });

  useEffect(() => {
    console.log("pdm data changed", pdmData);
    if (!pdmData || !pdmData.last_values) {
      toast.error("No Predictive Maintenance Data available.");
      return;
    }
    //if (pdmData.maintenance_needed === true) {
    //  setIsPdmError(true);
    //  setPdmErrorMessage("Problem detected in Vibration Frequency");
    //} else {
    //  setIsPdmError(false);
    //}

    // transform data for plotting graph
    const numberOfLastValues = pdmData.last_values.accel_x.length;
    const baseTimestamp = DateTime.fromISO(pdmData.time);

    // Create formatted data for the graph
    const formattedData = [];

    // Add last_values data points
    pdmData.last_values.accel_x.forEach((value, index) => {
      formattedData.push({
        timestamp: baseTimestamp.plus({ seconds: index }).toISO(),
        actual: value,
        forecast: null,
      });
    });

    // Add forecasted_values data points
    pdmData.forecasted_values.accel_x.forEach((value, index) => {
      formattedData.push({
        timestamp: baseTimestamp.plus({ seconds: numberOfLastValues + index }).toISO(),
        actual: null,
        forecast: value,
      });
    });

    setPdmDataForGraph(formattedData);

    setIsPdmLoading(false);
  }, [pdmData]);

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
          <StatusCard isLoading={isPdmLoading} title={`Temperature`} isError={false} errorMessage={``} disabled={true} />
          <StatusCard isLoading={isPdmLoading} title={`Hydrocarbon Emission`} isError={false} errorMessage={``} disabled={true} />
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {pdmData && pdmDataForGraph && (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pdmDataForGraph}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }} // Add bottom margin
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#fff"
                  tickFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
                  label={{ value: "Timestamp", position: "insideBottom", offset: -10 }}
                />
                <YAxis stroke="#fff" label={{ value: "Vibration (G-Units)", position: "insideLeft", angle: -90 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }}
                  labelFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#ff7300"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Actual"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#8884d8"
                  strokeWidth={2}
                  strokeDasharray="5 5" // This creates the dotted/dashed line
                  dot={{ r: 4 }}
                  name="Forecast"
                  connectNulls
                />
                <Legend verticalAlign="top" iconType="diamond" height={36} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintenance;
