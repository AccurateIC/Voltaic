import "chartjs-adapter-luxon";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TimeSeriesScale,
} from "chart.js";
import { DateTime } from "luxon";

ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const OilPressureLineChart = ({ value }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {},
      title: {
        display: true,
        text: "Oil Pressure (bar)",
        color: "rgba(255, 255, 255, 0.8)",
        font: { size: 18, weight: "normal" },
      },
    },

    scales: {
      x: {
        type: "timeseries",
        position: "bottom",
        title: {
          display: true,
          text: "Time",
          font: { size: 18, weight: "normal" },
        },
        min: DateTime.now().minus({ hours: 1 }).toISO(),
        max: DateTime.now().toISO(),
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        ticks: { display: true },
          time: {
          unit: "second",
          tooltipFormat: "HH:mm:ss",
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm:ss",
          },
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "Oil Pressure (bar)",
          font: { size: 18, weight: "normal" },
        },
        min: 0,
        max: 8,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const chartData = value.map((item) => ({ x: item.timestamp, y: item.propertyValue }));
  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Oil Pressure (bar)",
        data: chartData,
        borderColor: "rgba(82, 120, 209, 1)",
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
      },
    ],
  };
  return <Line options={options} data={data} />;
};
