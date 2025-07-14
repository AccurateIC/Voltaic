import { useQuery } from "@tanstack/react-query";
import { tuyau } from "../../lib/Tuyau";

export const AnomalyNotificationTable = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: [], queryFn: () => tuyau.notification.getAll.$get() });

  return (
    <>
      {/* Table Loading State */}
      {isLoading && (
        <div className="h-full flex items-center justify-center">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      )}
      {/* Table Error State */}
      {isError && <div className="h-full flex items-center justify-center">Failed to fetch anomalies</div>}

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
              data &&
              data.map((entry, index) => (
                <tr key={index} className="hover:bg-base-300 duration-200 transition-all">
                  <td>{entry.id}</td>
                  <td>{entry.startedAt}</td>
                  <td>{entry.finishedAt || "-"}</td>
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
