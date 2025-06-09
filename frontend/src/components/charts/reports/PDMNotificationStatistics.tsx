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
import { NotificationCount } from "../../../types/pdm.types";
import { DateTime, DateTimeUnit } from "luxon";
import { getWeekRange } from "../../../lib/DateTimeUtils";

export const PDMNotificationStatistics = ({ timeDuration }: { timeDuration: DateTimeUnit }) => {
  //hooks
  const { getPDMStatistics } = usePDM();

  // state
  const [chartData, setChartData] = useState<NotificationCount[]>();

  useEffect(() => {
    getPDMStatistics.mutate(timeDuration, {
      onSuccess: (data) => {
        setChartData(data.data);
      },
      onError: (error) => {
        console.error("Error fetching PDM Statistics", error);
      },
    });
  }, [timeDuration]); // you might include getPDMStatistics if needed

  if (getPDMStatistics.isPending || !chartData) return <div className="skeleton h-full w-full"></div>;
  if (getPDMStatistics.isError) return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  let xs = [];
  let ys = [];
  switch (timeDuration) {
    case "week":
      xs = chartData.map((point) => {
        if (point.day)
          return DateTime.fromObject({ year: point.year, month: point.month, day: point.day }).toFormat("ccc, MMM d");
        else throw new Error(`day not defined`);
      });
      ys = chartData.map((point) => point.count);
      break;
    case "month":
      const weekRanges = chartData.map((point) => {
        if (!point.week || !point.month) return;
        const range = getWeekRange(point.week, point.month, point.year);
        return {
          ...point,
          rangeStr: `${range.start.toFormat("MMM d")} - ${range.end.toFormat("MMM d")}`,
        };
      });
      xs = weekRanges.map((point) => point?.rangeStr);
      ys = weekRanges.map((point) => parseInt(point?.count));
      break;
    case "year":
      xs = chartData.map((point) => DateTime.fromObject({ year: point.year, month: point.month }).toFormat("MMM"));
      ys = chartData.map((point) => point.count);
      break;
    default:
      throw new Error(`unhandled time duration`);
  }

  const data: ChartData<"bar"> = {
    labels: xs,
    datasets: [
      {
        label: "Maintenance Notifications",
        data: ys,
        borderWidth: 1,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        maxBarThickness: 100,
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
        title: {
          display: false,
          text: "Dates ⟶",
          font: { size: 18, weight: "normal" },
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 14 } },
        title: {
          display: true,
          text: "Maintenance Notification Count ⟶",
          font: { size: 18, weight: "normal" },
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};
