// frontend/src/components/charts/reports/GenericPropertyStatisticsBarChart.tsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-luxon";
import { DateTime, DateTimeUnit } from "luxon";
import { getWeekRange } from "../../../lib/DateTimeUtils";
import { GensetPropertyName } from "../../../types/gensetProperty.types";
import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../../../lib/Tuyau";
import Skeleton from "../../Skeleton";

ChartJS.register(TimeSeriesScale, CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend);

const getChartData = (xs: string[], ys: number[], chartTitle: string): ChartData<"bar"> => {
  return {
    labels: xs,
    datasets: [
      {
        label: chartTitle,
        data: ys,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 1,
        maxBarThickness: 100,
      },
    ],
  };
};

const getChartOptions = (chartTitle: string): ChartOptions<"bar"> => {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: chartTitle, color: "rgba(255, 255, 255, 0.6)", font: { size: 18, weight: "bold" } },
      tooltip: {},
    },
    scales: {
      x: {
        title: { display: true, text: "Months ⟶", font: { weight: "bold", size: 16 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: chartTitle + " ⟶",
          font: { size: 18, weight: "normal" },
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };
};

export const GenericPropertyStatisticsBarChart = ({
  timeDuration,
  propertyName,
  chartTitle,
}: {
  timeDuration: DateTimeUnit;
  propertyName: GensetPropertyName;
  chartTitle: string;
}) => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["archive", "get-property-statistics"],
    queryFn: () =>
      tuyau.archive.getPropertyStatistics
        .$get({ query: { propertyName: propertyName, timeDuration: timeDuration } })
        .unwrap(),
  });
  if (isLoading || data === undefined || !data.data || data.data.length === 0) {
    return <div className="w-full h-full p-2"><Skeleton type="chart" /></div>;
  }
  const now = DateTime.now();

  switch (timeDuration) {
    case "year":
      return (
        <Bar
          data={getChartData(
            data?.data.map(
              (monthData) => DateTime.fromObject({ year: monthData.year, month: monthData.month, day: 1 }).monthShort
            ),
            data.data.map((monthData) => monthData.avg),
            chartTitle
          )}
          options={getChartOptions(chartTitle)}
        />
      );
      break;
    case "month":
      const weekRanges = data.data.map((point) => {
        const range = getWeekRange(point.week, point.month, point.year);
        return { ...point, rangeStr: `${range.start.toFormat("MMM d")} - ${range.end.toFormat("MMM d")}` };
      });

      const monthOptions: ChartOptions<"bar"> = {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: chartTitle,
            color: "rgba(255, 255, 255, 0.6)",
            font: { size: 18, weight: "bold" },
          },
          tooltip: {},
        },
        scales: {
          x: {
            title: { display: true, text: "Weeks ⟶", font: { weight: "bold", size: 16 } },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
            title: {
              display: true,
              text: chartTitle + " ⟶",
              font: { size: 20, weight: "normal" },
              color: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      };

      const monthChartData: ChartData<"bar"> = {
        labels: weekRanges.map((week) => week.rangeStr),
        datasets: [
          {
            label: chartTitle,
            data: weekRanges.map((week) => week.avg),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderWidth: 1,
            maxBarThickness: 75,
          },
        ],
      };
      return <Bar data={monthChartData} options={monthOptions} />;
      break;
    case "week":
      const startOfWeek = now.startOf("week");
      const allDays = Array.from({ length: 7 }, (_, i) => {
        return startOfWeek.plus({ day: i });
      });

      const dataMap = new Map(
        data.data.map((point) => {
          const date = DateTime.fromObject({ year: point.year, month: point.month, day: point.day });
          return [date.toISODate(), point.avg];
        })
      );

      const options: ChartOptions<"bar"> = {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: chartTitle,
            color: "rgba(255, 255, 255, 0.6)",
            font: { size: 18, weight: "bold" },
          },
          tooltip: {},
        },
        scales: {
          x: {
            title: { display: true, text: "Days ⟶", font: { weight: "bold", size: 16 } },

            type: "time",
            time: {
              unit: "day", // or "hour", "minute", "week", etc., depending on your use case
              tooltipFormat: "DD T", // Format for tooltip, e.g., 'May 20, 2025, 12:30 PM'
              displayFormats: {
                day: "ccc, MMM dd", // x-axis label format, e.g., 'Mon, May 20'
              },
            },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
            title: {
              display: true,
              text: chartTitle + " ⟶",
              font: { size: 18, weight: "normal" },
              color: "rgba(255, 255, 255, 0.5)",
            },
          },
        },
      };

      return (
        <Bar
          data={getChartData(
            allDays.map((day) => day.toISO()),
            allDays.map((day) => dataMap.get(day.toISODate()) ?? null),
            chartTitle
          )}
          options={options}
        />
      );
      break;
    default:
      return <div className="">N/A</div>;
      break;
  }
};
