// frontend/src/components/charts/reports/AnomaliesByProperty.tsx

import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useArchive } from "../../../hooks/useArchive";

import { useState,useEffect} from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

export const AnomaliesByProperty = ({timeDuration}) => {
  // hooks
  const { getAnomalyStatistics } = useArchive();
  const { data, isPending, isError } = getAnomalyStatistics;

  // state
  console.log("timeDuration", timeDuration);
  // const [chartTimeRange, setChartTimeRange] = useState<"today" | "week" | "month" | "total">("total");
    const [chartTimeRange, setChartTimeRange] = useState(timeDuration);

      console.log("chartTimeRange", chartTimeRange);
    useEffect(() => {
  setChartTimeRange(timeDuration);
}, [timeDuration]);

  if (isPending) return isPending && <div className="skeleton h-full w-full"></div>;
  if (isError) return <div className="h-full w-full flex items-center justify-center">N/A</div>;

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
    animation: {
      animateScale: true,
    },
  };
  const chartData: ChartData<"pie"> = {
    labels,
    datasets: [
      {
        data: pieData,
      },
    ],
  };

  return <Pie options={options} data={chartData} />;
};
