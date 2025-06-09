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
import { useArchive } from "../../../hooks/useArchive";
import { DateTime, DateTimeUnit } from "luxon";
import { getWeekRange } from "../../../lib/DateTimeUtils";
import { GensetPropertyName } from "../../../types/gensetProperty.types";

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
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: chartTitle,
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
  const { getPropertyStatistics } = useArchive();
  const {
    data: apiData,
    isPending,
    isError,
  } = getPropertyStatistics({
    timeDuration: timeDuration,
    propertyName: propertyName,
  });
  if (isError) return <div className="flex h-full items-center justify-center">N/A</div>;
  if (isPending) return <div className="skeleton h-full w-full"></div>;
  const now = DateTime.now();

  switch (timeDuration) {
    case "year":
      return (
        <Bar
          data={getChartData(
            apiData.data.map(
              (monthData) => DateTime.fromObject({ year: monthData.year, month: monthData.month, day: 1 }).monthShort
            ),
            apiData.data.map((monthData) => monthData.avg),
            chartTitle
          )}
          options={getChartOptions(chartTitle)}
        />
      );
      break;
    case "month":
      const weekRanges = apiData.data.map((point) => {
        const range = getWeekRange(point.week, point.month, point.year);
        return {
          ...point,
          rangeStr: `${range.start.toFormat("MMM d")} - ${range.end.toFormat("MMM d")}`,
        };
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
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { autoSkip: false, color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255, 255, 255, 0.1)" },
            ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
            title: {
              display: true,
              text: chartTitle,
              font: { size: 18, weight: "normal" },
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
        apiData.data.map((point) => {
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
              text: chartTitle,
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
