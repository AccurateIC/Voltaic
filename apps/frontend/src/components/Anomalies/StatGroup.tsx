import { UUID } from "node:crypto";
import { useArchive } from "../../hooks/useArchive";
import { StatCard } from "./StatCard";

export const StatGroup = ({
  overallStatistics,
  isLoading,
}: {
  overallStatistics: {
    timezone: string;
    overall: { today: number; week: number; month: number; year: number; total: number };
    byProperty: {
      today: number;
      week: number;
      month: number;
      year: number;
      total: number;
      readablePropertyName: string;
      gensetPropertyId: UUID;
      propertyName: string;
    }[];
  };
  isLoading: boolean;
}) => {
  // const { getAnomalyStatistics } = useArchive();
  // const { data, isLoading, isError } = getAnomalyStatistics;

  return (
    <div className="w-full grid sm:grid-cols-4 grid-cols-2">
      <StatCard title={"Daily Anomalies"} data={overallStatistics?.overall.today} isLoading={isLoading} />
      <StatCard title={"Weekly Anomalies"} data={overallStatistics?.overall.week} isLoading={isLoading} />
      <StatCard title={"Monthly Anomalies"} data={overallStatistics?.overall.month} isLoading={isLoading} />
      <StatCard title={"Total Anomalies"} data={overallStatistics?.overall.total} isLoading={isLoading} />
    </div>
  );
};
