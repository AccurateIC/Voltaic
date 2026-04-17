import Skeleton from "../Skeleton";

export const StatCard = ({ title, data, isLoading }: { title: string; data: number; isLoading: boolean }) => {
  if (isLoading || data === undefined || data === null) {
    return (
      <div className="w-full h-full min-h-[120px]">
        <Skeleton type="stat" />
      </div>
    );
  }

  return (
    <div className="card card-border bg-base-100 w-full min-w-0 shadow rounded-lg">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-xl">{data}</p>
      </div>
    </div>
  );
};
