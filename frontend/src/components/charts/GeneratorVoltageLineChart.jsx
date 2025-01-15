import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  addNotification,
  removeNotification,
} from "../../redux/notificationSlice";
import renderCustomDot from "./renderCustomDot";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const GeneratorVoltageLineChart = ({
  timeStamp,
  l1Voltage,
  l2Voltage,
  l3Voltage,
  l1IsAnomaly,
  l2IsAnomaly,
  l3IsAnomaly,
}) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);  // chart datahold

  useEffect(() => {
    if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
      setData((voltageData) => {
        if (voltageData.length > 48) voltageData.shift();

        return [
          ...voltageData,
          {
            time: new Date(timeStamp).toLocaleTimeString(),
            L1: l1Voltage,
            L2: l2Voltage,
            L3: l3Voltage,
          },
        ];
      });
    }

    if (l1IsAnomaly) {
      dispatch(
        addNotification({ id: "L1", message: "Anomaly detected in L1 phase!" })
      );
      console.log("Anomaly detected in L1 phase!");
    } else {
      dispatch(removeNotification("L1"));
    }

    if (l2IsAnomaly) {
      dispatch(
        addNotification({ id: "L2", message: "Anomaly detected in L2 phase!" })
        
      );
      console.log("Anomaly detected in L2 phase!");
    } else {
      dispatch(removeNotification("L2"));
    }

    if (l3IsAnomaly) {
      dispatch(
        addNotification({ id: "L3", message: "Anomaly detected in L3 phase!" })
      );
      console.log("Anomaly detected in L3 phase!");
    } else {
      dispatch(removeNotification("L3"));
    }
  }, [
    timeStamp,
    l1Voltage,
    l2Voltage,
    l3Voltage,
    l1IsAnomaly,
    l2IsAnomaly,
    l3IsAnomaly,
    dispatch,
  ]);

  return (
    <div className="h-[400px] w-full relative">
      <h2 className="text-lg font-semibold p-4">Generator Voltage Monitor</h2>
      <div className="h-[calc(100%-3rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: "Time", position: "bottom", offset: 0 }}
            />
            <YAxis
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip />
            <Legend />
            <Line
  type="line"
  dataKey="L1"
  stroke="#CAA98F"
  name="L1 Phase"
  strokeWidth={2}
  dot={(props) => renderCustomDot(props, l1IsAnomaly)}  
/>
<Line
  type="line"
  dataKey="L2"
  stroke="#B3CC99"
  name="L2 Phase"
  strokeWidth={2}
  dot={(props) => renderCustomDot(props, l2IsAnomaly)}  
/>
<Line
  type="line"
  dataKey="L3"
  stroke="#99B3CC"
  name="L3 Phase"
  strokeWidth={2}
  dot={(props) => renderCustomDot(props, l3IsAnomaly)}  
/>

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
