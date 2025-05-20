// frontend/src/components/charts/reports/AllAnomaliesCount.tsx
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Colors);
import { Bar } from "react-chartjs-2";
import { usePDM } from "../../../hooks/usePdmHook";
import { useEffect, useState } from "react";
import { PDMNotificationCount } from "../../../types/pdm.types";
import { DateTimeUnit } from "luxon";

export const PDMNotificationStatistics = () => {
  //hooks
  const { getPDMStatistics } = usePDM();

  // state
  const [chartData, setChartData] = useState<PDMNotificationCount>();
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("week");

  useEffect(() => {
    getPDMStatistics.mutate(timeDuration, {
      onSuccess: (data) => {
        console.log("pdm stats", data);
        setChartData(data);
      },
      onError: (error) => {
        console.error("Error fetching PDM Statistics", error);
      },
    });
  }, [timeDuration]); // you might include getPDMStatistics if needed

  if (getPDMStatistics.isPending || !chartData) return <div className="skeleton h-full w-full"></div>;
  if (getPDMStatistics.isError) return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  const xs = Object.keys(chartData);
  const ys = Object.values(chartData);

  const data: ChartData<"bar"> = {
    labels: xs,
    datasets: [
      {
        label: "Anomalies",
        data: ys,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Predictive Maintenance Notifications",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
