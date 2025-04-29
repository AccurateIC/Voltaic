// import React from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// // Helper to format timestamp in 12-hour format
// const formatTime12Hour = (timestamp) => {
//   const date = new Date(timestamp);
//   let hours = date.getHours();
//   const minutes = date.getMinutes();
//   const seconds = date.getSeconds();
//   const ampm = hours >= 12 ? "PM" : "AM";

//   hours = hours % 12;
//   hours = hours ? hours : 12; // hour 0 should be 12

//   const paddedMinutes = minutes.toString().padStart(2, "0");
//   const paddedSeconds = seconds.toString().padStart(2, "0");

//   return `${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
// };

// // Custom dot for anomaly highlighting
// const CustomDot = (props) => {
//   const { cx, cy, payload } = props;

//   if (payload.isAnomaly) {
//     return <circle cx={cx} cy={cy} r={6} stroke="red" strokeWidth={2} fill="red" />;
//   } else {
//     return <circle cx={cx} cy={cy} r={5} stroke="#5278d1" strokeWidth={2} fill="#5278d1" />;
//   }
// };

// const AnomaliesLineChart = ({ value }) => {
//   if (!value || value.length === 0) return <div></div>;

//   // Find min and max property values
//   const propertyValues = value.map((item) => item.propertyValue);
//   const minY = Math.min(...propertyValues);
//   const maxY = Math.max(...propertyValues);

//   // Y-axis title from propertyName
//   const yAxisTitle = value[0]?.gensetProperty?.propertyName || "Property Value";

//   // 🔥 Sort data by timestamp ascending
//   const sortedData = [...value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//   // Format data: add 'time' field formatted
//   const formattedData = sortedData.map((item) => ({
//     ...item,
//     time: formatTime12Hour(item.timestamp),
//   }));

//   return (
//     <div className="h-[400px] w-full relative">
//       <h2 className="text-lg font-semibold p-4 text-base-content">{yAxisTitle} Monitor</h2>

//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={formattedData} margin={{ top: 10, right: 30, bottom: 30, left: 20 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="time" label={{ value: "Time", position: "bottom", offset: 0 }} interval="preserveStartEnd" />
//             <YAxis
//               label={{
//                 value: yAxisTitle,
//                 angle: -90,
//                 position: "insideLeft",
//                 dy: 50,
//               }}
//               domain={[minY - 5, maxY + 5]}
//             />
//             <Tooltip />
//             <Legend
//               layout="horizontal"
//               verticalAlign="top"
//               align="center"
//               iconType="circle"
//               wrapperStyle={{ paddingBottom: 15 }}
//             />
//             <Line
//               type="monotone"
//               dataKey="propertyValue"
//               stroke="#5278d1"
//               strokeWidth={2}
//               name={yAxisTitle}
//               dot={<CustomDot />}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default AnomaliesLineChart;


import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

// Helper to format timestamp in 12-hour format
const formatTime12Hour = (timestamp) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${hours}:${paddedMinutes}:${paddedSeconds} ${ampm}`;
};

const AnomaliesLineChart = ({ value }) => {
  if (!Array.isArray(value) || value.length === 0) return <div>No data available</div>;

  const sortedData = [...value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sortedData.map((item) => formatTime12Hour(item.timestamp));
  const dataPoints = sortedData.map((item) => item.propertyValue);
  const anomalyPoints = sortedData.map((item) => item.isAnomaly);

  const yAxisTitle = value[0]?.gensetProperty?.readablePropertyName || "Property Value";

  const data = {
    labels,
    datasets: [
      {
        label: yAxisTitle,
        data: dataPoints,
        borderColor: "#5278d1",
        backgroundColor: "rgba(82, 120, 209, 0.2)",
        pointBackgroundColor: anomalyPoints.map((is) => (is ? "red" : "#5278d1")),
        pointBorderColor: anomalyPoints.map((is) => (is ? "red" : "#5278d1")),
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${yAxisTitle} Monitor` ,color: "White",
      font: {
       
        weight: "bold",
        size: 22,
      },},
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.parsed.y;
            const isAnomaly = anomalyPoints[context.dataIndex];
            return `${yAxisTitle}: ${val}${isAnomaly ? "  (Anomaly)" : ""}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
            color: "White",
          display: true,
          text: yAxisTitle,
          font: {
            // weight: "bold",
            size: 16,
          },
        },
        ticks: {
            color: "white",
            font: {
              size: 12,
            },
        
      },
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
    },
      x: {
        title: {
             color: "White",
          display: true,
          text: "Time",
        },
        ticks: {
            color: "white",
            font: {
              size: 12,
            },
        },
        grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
      },
    },
  };

  return (
    // <div className="p-4 w-1/2 h-[400px] bg-[#1d2130] rounded-lg">
    //   <Line data={data} options={options} />
    // </div>
    <div className="flex-1 h-[395px] px-2  bg-[#1d2130] ">
  <Line data={data} options={options} className="w-full h-full" />
</div>

  );
};

export default AnomaliesLineChart;
