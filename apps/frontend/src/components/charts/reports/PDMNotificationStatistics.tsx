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
import { DateTime, DateTimeUnit } from "luxon";
import { getWeekRange } from "../../../lib/DateTimeUtils";
import { useMutation } from "@tanstack/react-query";
import { tuyau } from "../../../lib/Tuyau";
import { useEffect } from "react";

export const PDMNotificationStatistics = ({ timeDuration }: { timeDuration: DateTimeUnit }) => {
  //hooks
  const { mutate, data, isError, isPending } = useMutation({
    mutationKey: [],
    mutationFn: (timeDuration: DateTimeUnit) =>
      tuyau.pdm.notification.getStatistics.$post({ timeDuration: timeDuration }).unwrap(),
  });

  useEffect(() => {
    mutate(timeDuration);
  }, [timeDuration]); // Removed mutate from dependencies to prevent infinite loop
  if (isPending) return <div className="skeleton h-full w-full"></div>;
  if (isError || !data || data.data.length === 0)
    return <div className="h-full w-full flex items-center justify-center">N/A</div>;

  let xs = [];
  let ys: number[] = [];
  switch (data.meta.timeDuration) {
    case "week":
      xs = data.data.map((point) => {
        if (point.day)
          return DateTime.fromObject({ year: point.year, month: point.month, day: point.day }).toFormat("ccc, MMM d");
        else throw new Error(`day not defined`);
      });
      ys = data.data.map((point) => point.count);
      break;
    case "month":
      const weekRanges = data.data.map((point) => {
        if (undefined === point || !point.week || !point.month) return;
        const range = getWeekRange(point.week, point.month, point.year);
        return { ...point, rangeStr: `${range.start.toFormat("MMM d")} - ${range.end.toFormat("MMM d")}` };
      });
      xs = weekRanges.map((point) => point?.rangeStr);
      ys = weekRanges.map((point) => point?.count);
      break;
    case "year":
      xs = data.data.map((point) => DateTime.fromObject({ year: point.year, month: point.month }).toFormat("MMM"));
      ys = data.data.map((point) => point.count);
      break;
    default:
      throw new Error(`unhandled time duration`);
  }

  const chartData: ChartData<"bar"> = {
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

  return <Bar data={chartData} options={options} />;
};
