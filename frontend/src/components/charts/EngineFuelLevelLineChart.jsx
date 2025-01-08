import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const EngineFuelLevelLineChart = ({ timeStamp, fuelLevel }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (fuelLevel !== -1) {
      setData(currentData => {
        if (currentData.length > 48) currentData.shift(); // remove the oldest entry

        return [...currentData, { time: new Date(timeStamp).toLocaleTimeString(), fuelLevel: fuelLevel }];
      })
    }
  }, [fuelLevel, timeStamp]);
  return (
    <div className="h-[400px] w-full">
      <h2 className="text-lg font-semibold p-4">Engine Fuel Level Monitor</h2>
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
              label={{ value: 'Fuel Level (%)', angle: -90, position: 'insideLeft' }}
              ticks={[0, 50, 100, 150, 200]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="fuelLevel"
              stroke="#2563eb"
              name="Fuel Level"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
