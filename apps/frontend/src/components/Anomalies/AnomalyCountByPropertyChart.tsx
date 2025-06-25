import { useArchive } from "../../hooks/useArchive";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnomalyCountByPropertyChart = ({ timeDuration }: { timeDuration: "1d" | "1w" | "1m" | "*" }) => {
  const { getAnomalyStatistics } = useArchive();
  const { data: anomalyStatsData, isError, isLoading } = getAnomalyStatistics;
  console.log(anomalyStatsData);

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (isError || !anomalyStatsData || anomalyStatsData.byProperty.length === 0)
    return (
      <div className="h-full flex items-center justify-center">
        <span className="">N/A</span>
      </div>
    );

  let labels: string[] = [];
  let counts: number[] = [];

  switch (timeDuration) {
    case "*":
      labels = anomalyStatsData?.byProperty.map((entry) => entry.readablePropertyName);
      counts = anomalyStatsData.byProperty.map((entry) => entry.counts.total);
      break;
    case "1d":
      labels = anomalyStatsData?.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = anomalyStatsData.byProperty.map((entry) => entry.counts.today);
      break;
    case "1w":
      labels = anomalyStatsData?.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = anomalyStatsData.byProperty.map((entry) => entry.counts.week);
      break;
    case "1m":
      labels = anomalyStatsData?.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = anomalyStatsData.byProperty.map((entry) => entry.counts.month);
      break;
    default:
      labels = [];
      counts = [];
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Anomaly Count By Property (${timeDuration === "*" ? "All Time" : timeDuration})`,
      },
    },
  };

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Anomaly Count",
        data: counts,
        backgroundColor: "rgba(53, 162, 235, 0.25)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};
