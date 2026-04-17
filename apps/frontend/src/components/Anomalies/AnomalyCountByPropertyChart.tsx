
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
import { tuyau } from "../../lib/Tuyau";
import { useQuery } from "@tanstack/react-query";
import { useMessageBus } from "../../lib/MessageBus";
import { TransmitChannels } from "../../lib/TransmitChannels";
import Skeleton from "../Skeleton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnomalyCountByPropertyChart = ({ timeDuration }: { timeDuration: "1d" | "1w" | "1m" | "*" }) => {
  // const { data, isLoading, isError, refetch } = useQuery({
  //   queryKey: ["archive", "get-anomaly-statistics"],
  //   queryFn: async () => await tuyau.archive.getAnomalyStatistics.$get(),
  //   refetchInterval: 5000,
  // });
  //-------here is 1st chnage ------------------------------
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["archive", "get-anomaly-statistics"],
    queryFn: async () => await tuyau.archive.getAnomalyStatistics.$get(),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
  //---------------upto here-------------------
  useMessageBus(TransmitChannels.ARCHIVE, () => {
    // Re-fetch data instantly when a new archive is inserted
    refetch();
  });

  if (isError || data === undefined || data?.data === null || data.data.overall === null)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  if (isLoading || !data || !data.data || !data.data.byProperty || data.data.byProperty.length === 0) {
    return <div className="w-full h-full"><Skeleton type="chart" /></div>;
  }

  if (isError || !data)
    return (
      <div className="h-full flex items-center justify-center">
        <span className="">N/A</span>
      </div>
    );

  let labels: string[] = [];
  let counts: number[] = [];

  switch (timeDuration) {
    case "*":
      labels = data.data?.byProperty.map((entry: any) => entry.readablePropertyName);
      counts = data.data.byProperty.map((entry: any) => entry.counts.total);
      break;
    case "1d":
      labels = data.data?.byProperty.map((entry: any) => entry.readablePropertyName) || [];
      counts = data.data.byProperty.map((entry: any) => entry.counts.today);
      break;
    case "1w":
      labels = data.data?.byProperty.map((entry: any) => entry.readablePropertyName) || [];
      counts = data.data.byProperty.map((entry: any) => entry.counts.week);
      break;
    case "1m":
      labels = data.data?.byProperty.map((entry: any) => entry.readablePropertyName) || [];
      counts = data.data.byProperty.map((entry: any) => entry.counts.month);
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
