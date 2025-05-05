import { useArchive } from "../../shared/hooks/useArchive";
import { StatCard } from "./StatCard";

export const StatGroup = () => {
  const { getAnomalyStatistics } = useArchive();
  const { data, isLoading, isError } = getAnomalyStatistics;

  return (
    <div className="w-full grid sm:grid-cols-4 grid-cols-2">
      <StatCard title={"Daily Anomalies"} data={data?.overall.today} isLoading={isLoading} isError={isError} />
      <StatCard title={"Weekly Anomalies"} data={data?.overall.week} isLoading={isLoading} isError={isError} />
      <StatCard title={"Monthly Anomalies"} data={data?.overall.month} isLoading={isLoading} isError={isError} />
      <StatCard title={"Total Anomalies"} data={data?.overall.total} isLoading={isLoading} isError={isError} />
    </div>
  );
};
