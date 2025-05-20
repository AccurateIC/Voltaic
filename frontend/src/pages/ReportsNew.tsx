import { AllAnomaliesCount } from "../components/charts/reports/AllAnomaliesCount";
import { AnomaliesByProperty } from "../components/charts/reports/AnomaliesByProperty";
import { PDMNotificationStatistics } from "../components/charts/reports/PDMNotificationStatistics";

export const ReportsNew = (props: {}) => {
  return (
    <div>
      <div className="flex items-center justify-between p-2">
        <h1 className="text-2xl">Reports</h1>
        <button className="btn">Export</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 h-full">
        <div className="aspect-4/3 bg-base-200">
          <AllAnomaliesCount />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <AnomaliesByProperty />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <PDMNotificationStatistics />
        </div>
        <div className="aspect-4/3 bg-base-200"></div>
        <div className="aspect-4/3 bg-base-200"></div>
        <div className="aspect-4/3 bg-base-200"></div>
        <div className="aspect-4/3 bg-base-200"></div>
        <div className="aspect-4/3 bg-base-200"></div>
      </div>
    </div>
  );
};
