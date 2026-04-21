import { ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { DateTime } from "luxon";
import Skeleton from "../Skeleton";
import type { AnomalyStatisticsForCharts } from "./AnomalyCountByPropertyChart";


interface Props {
  timeDuration: "*" | "1d" | "1w" | "1m";
  selectedProperties: string[];
  statistics: AnomalyStatisticsForCharts;
}

export const AnomalyCountByTimeChart = ({ timeDuration, selectedProperties, statistics }: Props) => {
  if (statistics === undefined || statistics?.overall === null)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  if (!statistics.byProperty || statistics.byProperty.length === 0) {
    return (
      <div className="w-full h-full">
        <Skeleton type="chart" />
      </div>
    );
  }

  const filteredData =
    selectedProperties.length > 0
      ? statistics.byProperty.filter((prop) => selectedProperties.includes(prop.readablePropertyName))
      : statistics.byProperty;

  let labels: string[] = [];
  let counts: number[] = [];

  switch (timeDuration) {
    case "*": {
      const now = DateTime.now();
      const monthsData = new Map<string, number>();

      for (let i = 11; i >= 0; i--) {
        const month = now.minus({ months: i });
        monthsData.set(month.toFormat("yyyy-MM"), 0);
      }

      filteredData.forEach((property) => {
        monthsData.forEach((_, month) => {
          monthsData.set(month, (monthsData.get(month) || 0) + property.total / 12);
        });
      });

      labels = Array.from(monthsData.keys()).map((month) => DateTime.fromFormat(month, "yyyy-MM").toFormat("MMM yyyy"));
      counts = Array.from(monthsData.values());
      break;
    }

    case "1m": {
      const weeksInMonth = new Map<number, number>();

      for (let week = 1; week <= 5; week++) {
        weeksInMonth.set(week, 0);
      }

      filteredData.forEach((property) => {
        const monthlyCount = property.month;
        weeksInMonth.forEach((_, week) => {
          weeksInMonth.set(week, (weeksInMonth.get(week) || 0) + monthlyCount / 4);
        });
      });

      labels = Array.from(weeksInMonth.keys()).map((week) => `Week ${week}`);
      counts = Array.from(weeksInMonth.values());
      break;
    }

    case "1w": {
      const now = DateTime.now();
      const startOfWeek = now.startOf("week");
      const daysData = new Map<string, number>();

      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.plus({ days: i });
        daysData.set(day.toFormat("ccc"), 0);
      }

      filteredData.forEach((property) => {
        const weeklyCount = property.week;
        daysData.forEach((_, day) => {
          daysData.set(day, (daysData.get(day) || 0) + weeklyCount / 7);
        });
      });

      labels = Array.from(daysData.keys());
      counts = Array.from(daysData.values());
      break;
    }

    case "1d": {
      labels = filteredData.map((p) => p.readablePropertyName);
      counts = filteredData.map((p) => p.today);
      break;
    }
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Anomaly Count Over Time (${timeDuration === "*"
          ? "All Time"
          : timeDuration === "1m"
            ? "This Month"
            : timeDuration === "1w"
              ? "This Week"
              : timeDuration === "1d"
                ? "Last Day"
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
