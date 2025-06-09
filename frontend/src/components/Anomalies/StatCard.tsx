export const StatCard = ({
  title,
  data,
  isLoading,
  isError,
}: {
  title: string;
  data: number;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <div className="card card-border bg-base-100 w-96 shadow rounded-lg">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {/* Loading State */}
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        )}

        {/* Error State */}
        {isError && <div className="text-xl">N/A</div>}

        {/* Data Available State */}
        <p className="text-xl">{data}</p>
      </div>
    </div>
  );
};
