import { useState } from "react";
import { AnomalyCountByPropertyChart } from "../components/Anomalies/AnomalyCountByPropertyChart";
import { AnomalyNotificationTable } from "../components/Anomalies/AnomalyNotificationTable";
import { StatGroup } from "../components/Anomalies/StatGroup";
import { FaFilter } from "react-icons/fa6";
import { AnomalyCountByTimeChart } from "../components/Anomalies/AnomalyCountByTimeRangeChart";
import { tuyau } from "../lib/Tuyau";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "../components/Skeleton";
import { useMessageBus } from "../lib/MessageBus";
import { TransmitChannels } from "../lib/TransmitChannels";

// types
type TimeRange = "*" | "1d" | "1w" | "1m";
interface AnomalyCombinedFilterProps {
  setTimeRangeFilter: (value: TimeRange) => void;
  timeRange: TimeRange;

  selectedProperties: string[];
  setSelectedProperties: (value: string[]) => void;

  allGensetProperties: string[];
}

const AnomalyCombinedFilter = ({
  setTimeRangeFilter,
  timeRange,
  allGensetProperties,
  selectedProperties,
  setSelectedProperties,
}: AnomalyCombinedFilterProps) => {
 
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
      <div className="flex items-center gap-2">
        <FaFilter size={16} className="md:w-[20px]" />
        <span className="sm:hidden font-bold">Filters</span>
      </div>

      {/* Time Filter */}
      <div className="flex flex-row items-center justify-center w-full sm:w-auto gap-2">
        <span className="whitespace-nowrap">Time: </span>
        <select value={timeRange} onChange={(e) => setTimeRangeFilter((e.target as any).value as TimeRange)} className="select select-sm md:select-md flex-1">
          <option disabled={true}>Choose a Time Frame</option>
          <option value="1d">Last Day</option>
          <option value="1w">Last Week</option>
          <option value="1m">Last Month</option>
          <option value="*">All Time</option>
        </select>
      </div>

      {/* Property Filter */}
      <div className="dropdown w-full sm:w-auto">
        <label tabIndex={0} className="btn btn-sm md:btn-md w-full">
          Properties
          <span className="badge badge-sm ml-2">{selectedProperties.length}</span>
        </label>
        {/* className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 max-h-60 overflow-y-auto"> */}

        <ul
          tabIndex={0}
          className="dropdown-content z-10 menu shadow bg-base-200 rounded h-72 w-64 flex flex-row overflow-y-scroll"
        >
          {allGensetProperties?.length > 0 &&
            allGensetProperties.map((property, index) => (
              <li key={index} className="w-full">
                <label className="label cursor-pointer flex w-full items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedProperties.includes(property)}
                    onChange={(e) => {
                      if ((e.target as any).checked) {
                        setSelectedProperties([...selectedProperties, property]);
                      } else {
                        setSelectedProperties(selectedProperties.filter((p) => p !== property));
                      }
                    }}
                  />
                  <span className="label-text">{property}</span>
                </label>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};



export const Anomalies = () => {
  const {
    data: anomalyStatisticsData,
    isLoading: anomalyStatisticsIsLoading,
    isError: anomalyStatisticsIsError,
    refetch: anomalyStatisticsRefetch,
  } = useQuery({ queryKey: ["anomaly-statistics"], queryFn: () => tuyau.archive.getAnomalyStatistics.$get().unwrap(), refetchInterval: 5000, refetchIntervalInBackground: false });

  // Instantly refetch stats when backend broadcasts a new archive entry
  // Charts have their own useMessageBus(ARCHIVE, refetch) subscriptions
  useMessageBus(TransmitChannels.ARCHIVE, () => {
    anomalyStatisticsRefetch();
  });
const {
  data: allGensetPropertiesData,
  isLoading: allGensetPropertiesIsLoading,
  isError: allGensetPropertiesIsError,
} = useQuery({ queryKey: ["all-genset-properties"], queryFn: () => tuyau.property.getAll.$get().unwrap(), refetchInterval: 30000 });

const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRange>("*");
const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

// --- guards AFTER all hooks ---
if (anomalyStatisticsIsError || allGensetPropertiesIsError) {
  toast.error("Failed to fetch data");
  return <div className="h-full w-full">N/A</div>;
}

if (anomalyStatisticsIsLoading || allGensetPropertiesIsLoading || !anomalyStatisticsData || !allGensetPropertiesData) {
  return (
    <div className="flex flex-col gap-4 min-h-full p-2 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Skeleton type="stat" />
         <Skeleton type="stat" />
         <Skeleton type="stat" />
         <Skeleton type="stat" />
      </div>
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <Skeleton type="chart" />
          <Skeleton type="chart" />
        </div>
        <div className="w-full md:w-1/2">
          <Skeleton type="table" rows={6} columns={4} />
        </div>
      </div>
    </div>
  );
}

  const count = [1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <section>
        <div className="h-auto w-full">
          <StatGroup overallStatistics={anomalyStatisticsData || { timezone: "", overall: { today: 0, week: 0, month: 0, year: 0, total: 0 }, byProperty: [] }} isLoading={anomalyStatisticsIsLoading} />
        </div>
      </section>

      <section className="flex-none h-auto bg-base-200 w-full shadow rounded-lg p-2 sm:p-3">
        <div className="h-full flex items-center px-1 sm:px-2">
          <AnomalyCombinedFilter
            setTimeRangeFilter={setTimeRangeFilter}
            timeRange={timeRangeFilter}
            selectedProperties={selectedProperties}
            setSelectedProperties={setSelectedProperties}
            allGensetProperties={allGensetPropertiesData?.map((entry) => entry.readablePropertyName) || []}
          />
        </div>
      </section>

      <section className="flex-none h-auto md:h-192 w-full gap-4 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 gap-4 flex flex-col">
          <div className="w-full bg-base-200 h-[250px] md:h-1/2 rounded-lg shadow min-h-[200px]">
            <AnomalyCountByPropertyChart timeDuration={timeRangeFilter} />
          </div>
          <div className="w-full bg-base-200 h-[250px] md:h-1/2 rounded-lg shadow min-h-[200px]">
            <AnomalyCountByTimeChart timeDuration={timeRangeFilter} selectedProperties={selectedProperties} />
          </div>
        </div>

        {/* Anomaly Notifications Table */}
        <div className="w-full md:w-1/2 bg-base-200 shadow rounded-lg h-[400px] md:h-full flex flex-col">
          <AnomalyNotificationTable />
        </div>
      </section>

      <section className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-4">
          {count.map((item) => (
            <div className="bg-base-200 shadow rounded-lg aspect-video p-4">{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
};
