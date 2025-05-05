import { useState } from "react";
import { useArchive } from "../../shared/hooks/useArchive";
import { AnomalyCountByPropertyChart } from "../components/AnomalyCountByPropertyChart";
import { AnomalyNotificationTable } from "../components/AnomalyNotificationTable";
import { StatGroup } from "../components/StatGroup";
import { FaFilter } from "react-icons/fa6";
import { useGensetProperty } from "../../shared/hooks/useGensetProperty";
import { AnomalyCountByTimeChart } from "../components/AnomalyCountByTimeRangeChart";

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
  console.log(allGensetProperties);
  return (
    <div className="flex items-center justify-center gap-4">
      <FaFilter size={24} />

      {/* Time Filter */}
      <div className="flex flex-row items-center justify-center">
        <span className="">Time Range: </span>
        <select value={timeRange} onChange={(e) => setTimeRangeFilter(e.target.value as TimeRange)} className="select">
          <option disabled={true}>Choose a Time Frame</option>
          <option value="1d">Last Day</option>
          <option value="1w">Last Week</option>
          <option value="1m">Last Month</option>
          <option value="*">All Time</option>
        </select>
      </div>

      {/* Property Filter */}
      <div className="dropdown">
        <label tabIndex={0} className="btn">
          Select Properties
          <span className="badge ml-2">{selectedProperties.length}</span>
        </label>
        {/* className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 max-h-60 overflow-y-auto"> */}

        <ul
          tabIndex={0}
          className="dropdown-content z-10 menu shadow bg-base-200 rounded h-72 flex flex-row overflow-y-scroll">
          {allGensetProperties?.length > 0 &&
            allGensetProperties.map((property, index) => (
              <li key={index} className="w-full">
                <label className="label cursor-pointer flex w-full items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedProperties.includes(property)}
                    onChange={(e) => {
                      if (e.target.checked) {
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
  // hooks
  const { getAnomalyStatistics } = useArchive();
  const overallStatistics = getAnomalyStatistics?.data?.overall;
  const { getAllGensetProperties } = useGensetProperty();

  // state
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRange>("*");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const count = [1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <section>
        <div className="h-1/8 w-full">
          <StatGroup overallStatistics={overallStatistics} />
        </div>
      </section>

      <section className="flex-none h-12 bg-base-200 w-full shadow">
        <div className="h-full flex items-center px-4">
          <AnomalyCombinedFilter
            setTimeRangeFilter={setTimeRangeFilter}
            timeRange={timeRangeFilter}
            selectedProperties={selectedProperties}
            setSelectedProperties={setSelectedProperties}
            allGensetProperties={getAllGensetProperties?.data?.map((entry, index) => entry.readablePropertyName)}
          />
        </div>
      </section>

      <section className="flex-none h-192 w-full gap-4 flex flex-row">
        <div className="w-1/2 gap-4 shadow rounded-lg flex flex-col">
          <div className="w-full bg-base-200 h-1/2 rounded-lg">
            <AnomalyCountByPropertyChart timeDuration={timeRangeFilter} />
          </div>
          <div className="w-full bg-base-200 h-1/2 rounded-lg">
            <AnomalyCountByTimeChart timeDuration={timeRangeFilter} selectedProperties={selectedProperties} />
          </div>
        </div>

        {/* Anomaly Notifications Table */}
        <div className="w-1/2 bg-base-200 shadow rounded-lg h-full flex flex-col">
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
