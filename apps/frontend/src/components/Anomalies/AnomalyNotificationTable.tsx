import { useNotificationsPaginatedQuery } from "../../hooks/useNotificationsPaginatedQuery";
import Skeleton from "../Skeleton";

// Helper function to format UTC timestamp to local time
const formatToLocalTime = (utcTimestamp: string | null) => {
  if (!utcTimestamp) return "-";
  try {
    const date = new Date(utcTimestamp);
    return date.toLocaleString();
  } catch {
    return utcTimestamp; // Fallback to original if parsing fails
  }
};

export const AnomalyNotificationTable = () => {
  const { data, isLoading, isFetching, isError } = useNotificationsPaginatedQuery(1);

  if (isError) {
    return <div className="h-full flex items-center justify-center">Failed to fetch anomalies</div>;
  }

  if ((isLoading && !isFetching) || !data || !data.data || data.data.length === 0) {
    return (
      <div className="h-full w-full">
        <Skeleton type="table" rows={8} columns={5} />
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-y-auto flex-1 rounded-lg">
        <table className="table table-pin-rows w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Started At</th>
              <th>Finished At</th>
              <th>Property</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody className="">
            {!isError &&
              data?.data &&
             data.data.map((entry: any, index: number) => (
                <tr key={index} className="hover:bg-base-300 duration-200 transition-all">
                  <td>{entry.id}</td>
                  <td>{formatToLocalTime(entry.startedAt)}</td>
                  <td>{formatToLocalTime(entry.finishedAt)}</td>
                  <td>{entry.archive.gensetProperty.readablePropertyName}</td>
                  <td>
                    <button className="btn">View</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
