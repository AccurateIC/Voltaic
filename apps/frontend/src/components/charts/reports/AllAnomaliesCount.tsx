// frontend/src/components/charts/reports/AllAnomaliesCount.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Colors);
import { Bar } from "react-chartjs-2";
import { tuyau } from "../../../lib/Tuyau";

export const AllAnomaliesCount = () => {
  //hooks
  const { data, isLoading, isError } = useQuery({
    queryKey: ["archive", "get-anomaly-statistics"],
    queryFn: () => tuyau.archive.getAnomalyStatistics.$get().unwrap(),
  });

  if (isLoading) return <div className="skeleton h-full w-full"></div>;
  if (isError || !data || !data.overall)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  console.log(data.overall);
  const xs = Object.keys(data.overall);
  const ys = Object.values(data.overall) as number[];

  const chartData: ChartData<"bar"> = {
    labels: xs,
    datasets: [
      {
        label: "Anomalies",
        data: ys,
        borderWidth: 1,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Anomaly Count",
        color: "rgba(255, 255, 255, 0.6)",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        // title: {
        //   display: true,
        //   text: "Time ⟶",
        //   font: { size: 18, weight: "normal" },
        // },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: "Anomaly Count ⟶",
          font: { size: 18, weight: "normal" },
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};
