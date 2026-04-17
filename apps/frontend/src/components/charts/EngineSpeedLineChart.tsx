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

export const EngineSpeedLineChart = ({ value }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {},
      title: {
        display: true,
        text: "Engine Speed (RPM)",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },

    scales: {
      x: {
        type: "timeseries",
        position: "bottom",
        title: { display: true, text: "Time ⟶", font: { size: 18, weight: "normal" } },
        min: DateTime.now().minus({ hours: 1 }).toISO(),
        max: DateTime.now().toISO(),
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
        ticks: { display: true },
      },
      y: {
        type: "linear",
        title: { display: true, text: "Engine Speed (RPM) ⟶", font: { size: 18, weight: "normal" } },
        min: 0,
        max: 3000,
        grid: { display: true, color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Create single dataset with conditional point colors
  const chartData = value.map((item) => ({ 
    x: item.timestamp, 
    y: item.propertyValue
  }));

  // Create point colors array - red for anomalies, blue for normal
  const pointColors = value.map((item) => 
    item.isAnomaly ? 'rgba(255, 0, 0, 1)' : 'rgba(82, 120, 209, 1)'
  );

  // Create point background colors array
  const pointBgColors = value.map((item) => 
    item.isAnomaly ? 'rgba(255, 0, 0, 0.8)' : 'rgba(82, 120, 209, 0.5)'
  );

  // Create point styles array - triangle for anomalies, circle for normal
  const pointStyles = value.map((item) => 
    item.isAnomaly ? 'triangle' : 'circle'
  );

  // Create point radius array - larger for anomalies
  const pointRadius = value.map((item) => 
    item.isAnomaly ? 6 : 3
  );

  const data: ChartData<"line"> = {
    datasets: [
      {
        fill: false,
        label: "Engine Speed (RPM)",
        data: chartData,
        borderColor: "rgba(82, 120, 209, 1)", // Keep line blue
        backgroundColor: "rgba(82, 120, 209, 0.5)",
        pointBackgroundColor: pointBgColors,
        pointBorderColor: pointColors,
        pointStyle: pointStyles,
        pointRadius: pointRadius,
        pointHoverRadius: 5,
        pointHitRadius: 10,
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };
  return <Line options={options} data={data} />;
};
