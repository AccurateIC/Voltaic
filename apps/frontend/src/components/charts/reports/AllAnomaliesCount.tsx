// frontend/src/components/charts/reports/AllAnomaliesCount.tsx
import { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useAnomalyStatisticsQuery } from "../../../hooks/useAnomalyStatisticsQuery";
import Skeleton from "../../Skeleton";

export const AllAnomaliesCount = () => {
  const { data, isLoading } = useAnomalyStatisticsQuery();

  if (isLoading || !data || !data.overall || Object.keys(data.overall).length === 0) {
    return <div className="w-full h-full p-2"><Skeleton type="chart" /></div>;
  }

  
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
