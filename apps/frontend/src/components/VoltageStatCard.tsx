import { SemiCircleGauge } from "./SemiCircleGauge";
import Skeleton from "./Skeleton";

export const VoltageStatCard = ({ value, name, kind, isLoading }) => {
  if (isLoading || value === undefined || value === null) {
    return <div className="w-full h-full min-h-[200px]"><Skeleton type="gauge" /></div>;
  }
  // const [displayValue, setDisplayValue] = useState(value);

  // useEffect(() => {
  //   if (Math.abs(displayValue - value) > 1) {
  //     smoothTransition(displayValue, value, setDisplayValue, 1500);
  //   } else {
  //     setDisplayValue(value);
  //   }
  // }, [value]);

  let maxValue;
  let units;
  switch (kind) {
    case "voltage":
      maxValue = 250;
      units = "V";
      break;
    case "current":
      maxValue = 20;
      units = "A";
      break;
    case "lineVoltage":
      maxValue = 440;
      units = "V";
      break;
    default:
      maxValue = 300;
      units = "Units";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 bg-base-200 p-4 rounded-lg shadow">
      <div className="text-xl font-semibold text-base-content">{name}</div>
      <SemiCircleGauge value={Math.round(value)} maxValue={maxValue} />
      <div className="text-3xl font-bold text-base-content">
        {Math.round(value)} {units}
      </div>
    </div>
  );
};
