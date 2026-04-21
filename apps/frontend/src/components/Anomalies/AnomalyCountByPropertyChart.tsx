import { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import Skeleton from "../Skeleton";


export type AnomalyStatisticsForCharts = {
  timezone: string;
  overall: { today: number; week: number; month: number; year: number; total: number } | null;
  byProperty: {
    today: number;
    week: number;
    month: number;
    year: number;
    total: number;
    readablePropertyName: string;
    propertyName: string;
    gensetPropertyId: string;
  }[];
};

export const AnomalyCountByPropertyChart = ({
  timeDuration,
  statistics,
}: {
  timeDuration: "1d" | "1w" | "1m" | "*";
  statistics: AnomalyStatisticsForCharts;
}) => {
  if (statistics === undefined || statistics?.overall === null)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  if (!statistics.byProperty || statistics.byProperty.length === 0) {
    return (
      <div className="w-full h-full">
        <Skeleton type="chart" />
      </div>
    );
  }

  let labels: string[] = [];
  let counts: number[] = [];

  switch (timeDuration) {
    case "*":
      labels = statistics.byProperty.map((entry) => entry.readablePropertyName);
      counts = statistics.byProperty.map((entry) => entry.total);
      break;
    case "1d":
      labels = statistics.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = statistics.byProperty.map((entry) => entry.today);
      break;
    case "1w":
      labels = statistics.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = statistics.byProperty.map((entry) => entry.week);
      break;
    case "1m":
      labels = statistics.byProperty.map((entry) => entry.readablePropertyName) || [];
      counts = statistics.byProperty.map((entry) => entry.month);
      break;
    default:
      labels = [];
      counts = [];
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: { display: true, text: `Anomaly Coundsdt By Property (${timeDuration === "*" ? "All Time" : timeDuration})` },
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
