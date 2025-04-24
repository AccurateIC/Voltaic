// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer } from "recharts";
// import { DateTime } from "luxon";

// export const PDMLineChart = ({ value }) => {
//   return (
//     <div className="h-[400px] w-full relative pb-4">
//       <h2 className="text-lg font-semibold p-4 text-black">Vibration</h2>

//       <div className="h-[calc(100%-3rem)]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={value}
//             margin={{ top: 5, right: 30, left: 20, bottom: 25 }} // Add bottom margin
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
//             <XAxis
//               dataKey="timestamp"
//               stroke="#000"
//               tickFormatter={(timestamp) =>
//                 DateTime.fromISO(timestamp).toISOTime({
//                   suppressMilliseconds: true,
//                   includeOffset: false,
//                   suppressSeconds: false,
//                 })
//               }
//               label={{ value: "Time(second)", fill: "#000", dy: 7, dx: -30, position: "insideBottom", offset: -10 }}
//             />
//             <YAxis
//               stroke="#000"
//               tick={{ fill: "#000" }}
//               label={{ value: "Vibration (G-Units)", fill: "#000", dy: 60, position: "insideLeft", angle: -90 }}
//             />
//             <Tooltip
//               contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }}
//               labelFormatter={(timestamp) => DateTime.fromISO(timestamp).toFormat("HH:mm:ss")}
//             />
//             <Line
//               type="monotone"
//               dataKey="actual"
//               stroke="#ff7300"
//               strokeWidth={2}
//               dot={false}
//               name="Vibration Data"
//               connectNulls
//             />
//             {/*
//             <Line
//               type="monotone"
//               dataKey="forecast"
//               stroke="#8884d8"
//               strokeWidth={2}
//               // strokeDasharray="5 5" // This creates the dotted/dashed line
//               dot={false}
//               name="Forecast"
//               connectNulls
//             />
//               */}
//             <Legend verticalAlign="top" iconType="diamond" height={36} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default PDMLineChart;

import { Line } from "react-chartjs-2";
import { DateTime } from "luxon";
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
import "chartjs-adapter-luxon";

// Register ChartJS components
ChartJS.register(CategoryScale, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const PDMLineChart = ({ value }) => {
  const limitedData = value.slice(-2000);

  const options = {
    responsive: true,
    animation: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `Vibration: ${context.parsed.y}`,
          title: (tooltipItems) => {
            return DateTime.fromISO(tooltipItems[0].raw.x).toFormat("HH:mm:ss");
          },
        },
      },
      title: {
        display: true,
        text: "Vibration",
        color: "#000",
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
          text: "Time(second)",
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
          text: "Vibration (G-Units)",
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
      {
        fill: false,
        label: "Vibration Data",
        data: limitedData.map((item) => ({
          x: DateTime.fromISO(item.timestamp),
          y: item.actual,
        })),
        borderColor: "#ff7300",
        backgroundColor: "rgba(255, 115, 0, 0.5)",
        pointStyle: "circle",
        pointHoverRadius: 5,
        // pointRadius: 0,
        pointHitRadius: 10,
        // tension: 0.1,
        spanGaps: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default PDMLineChart;
