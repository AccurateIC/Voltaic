import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { DateTime } from "luxon";
import { Transmit } from "@adonisjs/transmit-client";
import { TransmitChannels } from "../lib/TransmitChannels.js";
import { useMessageBus } from "../lib/MessageBus.js";

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
    if (!pdmData) {
      toast.error("No Predictive Maintenance Data available.");
      return;
    }
    if (pdmData.maintenance_needed === true) {
      setIsPdmError(true);
      setPdmErrorMessage("Problem detected in Vibration Frequency");

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
    } else {
      setIsPdmError(false);
    }

    setIsPdmLoading(false);
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
              <LineChart data={pdmDataForGraph}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#fff"
                  angle={0}
                  tickFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
                />
                <YAxis stroke="#fff" />
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
