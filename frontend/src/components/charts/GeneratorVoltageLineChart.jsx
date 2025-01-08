import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const GeneratorVoltageLineChart = ({ timeStamp, l1Voltage, l2Voltage, l3Voltage, l1IsAnomaly, l2IsAnomaly, l3IsAnomaly, }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (l1Voltage !== 0 && l2Voltage !== 0 && l3Voltage !== 0) {
      setData(currentData => {
        if (currentData.length > 48) currentData.shift(); // remove the oldest entry

        return [...currentData, { time: new Date(timeStamp).toLocaleTimeString(), L1: l1Voltage, L2: l2Voltage, L3: l3Voltage }];
      })
    }
  }, [l1Voltage]);


  return (
    <div className="h-[400px] w-full">
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
              label={{ value: 'Time', position: 'bottom', offset: 0 }}
            />
            <YAxis
              label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
              domain={['auto', 'auto']} // Auto-scale based on data
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="L1"
              stroke="#CAA98F" // Very light terra cotta
              name="L1 Phase"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="L2"
              stroke="#B3CC99" // Very light olive
              name="L2 Phase"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="L3"
              stroke="#99B3CC" // Very light steel blue
              name="L3 Phase"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
