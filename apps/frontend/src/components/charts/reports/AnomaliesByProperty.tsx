// frontend/src/components/charts/reports/AnomaliesByProperty.tsx

import { ChartData, ChartOptions } from "chart.js";
import { Pie } from "react-chartjs-2";

import { useState, useEffect } from "react";
import type { DateTimeUnit } from "luxon";
import { useAnomalyStatisticsQuery } from "../../../hooks/useAnomalyStatisticsQuery";
import Skeleton from "../../Skeleton";

export const AnomaliesByProperty = ({ timeDuration }: { timeDuration: DateTimeUnit }) => {
  const { data, isLoading } = useAnomalyStatisticsQuery();

  // state
  
  // const [chartTimeRange, setChartTimeRange] = useState<"today" | "week" | "month" | "total">("total");
  const [chartTimeRange, setChartTimeRange] = useState(timeDuration);

  
  useEffect(() => {
    setChartTimeRange(timeDuration);
  }, [timeDuration]);

  if (isLoading || !data || !data.byProperty || data.byProperty.length === 0) {
    return <div className="w-full h-full p-2"><Skeleton type="chart" /></div>;
  }

  const labels = data.byProperty.map((value) => value.readablePropertyName);
  const pieData = data.byProperty.map((value) => value[chartTimeRange]);

  const options: ChartOptions<"pie"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
      title: {
        display: true,
        text: "Anomalies By Property",
        color: "rgba(255, 255, 255, 0.5)",
        font: { size: 18, weight: "bold" },
      },
    },
    animation: { animateScale: true },
  };
  const chartData: ChartData<"pie"> = { labels, datasets: [{ data: pieData }] };

  return <Pie options={options} data={chartData} />;
};
