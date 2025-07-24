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
import { DateTime } from "luxon";
import { tuyau } from "../../lib/Tuyau";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  timeDuration: "*" | "1d" | "1w" | "1m";
  selectedProperties: string[];
}

export const AnomalyCountByTimeChart = ({ timeDuration, selectedProperties }: Props) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["archive", "get-anomaly-statistics"],
    queryFn: async () => await tuyau.archive.getAnomalyStatistics.$get(),
  });

  if (isError || data === undefined || data?.data === null || data.data.overall === null)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (isError || !data)
    return (
      <div className="h-full flex items-center justify-center">
        <span className="">N/A</span>
      </div>
    );

  // Filter data based on selected properties
  const filteredData =
    selectedProperties.length > 0
      ? data.data.byProperty.filter((prop) => selectedProperties.includes(prop.readablePropertyName))
      : data.byProperty;

  let labels: string[] = [];
  let counts: number[] = [];

  switch (timeDuration) {
    case "*": {
      // Group by months for all time
      const now = DateTime.now();
      const monthsData = new Map<string, number>();

      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = now.minus({ months: i });
        monthsData.set(month.toFormat("yyyy-MM"), 0);
      }

      // Aggregate counts
      filteredData.forEach((property) => {
        // Here we'd need to modify the API to get monthly breakdowns
        // For now, we'll just show total counts
        monthsData.forEach((_, month) => {
          monthsData.set(month, (monthsData.get(month) || 0) + property.counts.total / 12);
        });
      });

      labels = Array.from(monthsData.keys()).map((month) => DateTime.fromFormat(month, "yyyy-MM").toFormat("MMM yyyy"));
      counts = Array.from(monthsData.values());
      break;
    }

    case "1m": {
      // Group by weeks in current month
      const weeksInMonth = new Map<number, number>();

      // Initialize weeks
      for (let week = 1; week <= 5; week++) {
        weeksInMonth.set(week, 0);
      }

      // Aggregate counts
      filteredData.forEach((property) => {
        const monthlyCount = property.counts.month;
        // Distribute monthly count across weeks (simplified)
        weeksInMonth.forEach((_, week) => {
          weeksInMonth.set(week, (weeksInMonth.get(week) || 0) + monthlyCount / 4);
        });
      });

      labels = Array.from(weeksInMonth.keys()).map((week) => `Week ${week}`);
      counts = Array.from(weeksInMonth.values());
      break;
    }

    case "1w": {
      // Group by days in current week
      const now = DateTime.now();
      const startOfWeek = now.startOf("week");
      const daysData = new Map<string, number>();

      // Initialize days
      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.plus({ days: i });
        daysData.set(day.toFormat("ccc"), 0);
      }

      // Aggregate counts
      filteredData.forEach((property) => {
        const weeklyCount = property.counts.week;
        // Distribute weekly count across days (simplified)
        daysData.forEach((_, day) => {
          daysData.set(day, (daysData.get(day) || 0) + weeklyCount / 7);
        });
      });

      labels = Array.from(daysData.keys());
      counts = Array.from(daysData.values());
      break;
    }
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Anomaly Count Over Time (${
          timeDuration === "*"
            ? "All Time"
            : timeDuration === "1m"
              ? "This Month"
              : timeDuration === "1w"
                ? "This Week"
                : timeDuration
        })`,
      },
      tooltip: { callbacks: { label: (context) => `Count: ${Math.round(context.parsed.y)}` } },
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (value) => Math.round(Number(value)) } } },
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
