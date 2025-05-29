import { useEffect, useState } from "react";
import { AllAnomaliesCount } from "../components/charts/reports/AllAnomaliesCount";
import { AnomaliesByProperty } from "../components/charts/reports/AnomaliesByProperty";
import { EngineSpeedStatistics } from "../components/charts/reports/EngineSpeedStatistics";
import { PDMNotificationStatistics } from "../components/charts/reports/PDMNotificationStatistics";
import { useArchive } from "../hooks/useArchive";
import { DateTime, DateTimeUnit } from "luxon";
import { Archive, AvgStatisstics } from "../types/archive.types";
import { GetPropertyDataBetween, GetTestAgg } from "../api/archive";
import { EngineOilPressureStatistics } from "../components/charts/reports/EngineOilPressureStatistics";
import { EngineFuelLevelStatistics } from "../components/charts/reports/EngineFuelLevelStatistics";
import { GeneratorVoltageStatistics } from "../components/charts/reports/GeneratorVoltageStatistics";
import { MainsVoltageStatistics } from "../components/charts/reports/MainsVoltageStatistics";
import { RulChart } from "../components/charts/RulTrendChart";
import { RulPrediction } from "../types/rul.types";
import { useRulPrediction } from "../hooks/useRulPrediction";
import { rulInputData } from "../components/rulData";
import { useAuth } from "../hooks/useAuth";

export const Reports = (props: {}) => {
  // hooks
  const { getPropertyDataBetween } = useArchive();
  const { testAgg } = useArchive();
  const { getRulPrediction } = useRulPrediction();
  const { getLoggedInUser } = useAuth();
  const loggedInUser = getLoggedInUser?.data;
  const loggedInEmail = loggedInUser?.email;

  //state
  const [count, setCount] = useState(0);
  const [timeDuration, setTimeDuration] = useState<DateTimeUnit>("week");
  const [data, setData] = useState<Archive[]>();
  const [dataavg, setDataavg] = useState<AvgStatisstics[]>();
  const [rulPred, setRulPred] = useState<RulPrediction[]>([]);

  // const fetchNotifications = async () => {
  //   try {
  //     const propertyName = "engSpeedDisplay";
  //     const Tduration = "month";
  //     const response = await fetch(
  //       `${import.meta.env.VITE_ADONIS_BACKEND}/archive/testAgg?property=${propertyName}&timeDuration=${Tduration}`,
  //       {
  //         method: "GET",
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //       }
  //     );
  //     const data = await response.json();
  //     console.log("data", data);
  //     console.log("data spee", data[0].avg);

  //     const engSpeedData = data
  //       .filter((item) => item.genset_property_id === 7)
  //       .map((item) =>
  //       ({
  //            avg: item.avg,   //time duration , propertywise
  //            week: item?.week || null,
  //           }))

  //     console.log(engSpeedData);

  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     toast.error("Error fetching notification data");
  //   }
  // };

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // fetch rul prediction data
  const fetchRulPrediction = async () => {
    try {
      // Check if user email exists and has data
      if (!loggedInEmail || !rulInputData[loggedInEmail]) {
        console.log("Waiting for user data...");
        return;
      }

      const userDataArray = rulInputData[loggedInEmail];
      // Use the length of the user's specific data array
      const entry = userDataArray[count % userDataArray.length];

      if (!entry) {
        console.error("No entry found for current count");
        return;
      }

      const newEntry = {
        Time_Hours: entry.Time_Hours,
        RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
        Oil_Pressure: entry.Oil_Pressure,
        Power_Output_kW: entry.Power_Output_kW,
        Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption,
      };

      getRulPrediction.mutate(newEntry, {
        onSuccess: (data) => {
          console.log("RUL data fetched successfully:", data);
          setRulPred(data?.Future_Predictions);
          setCount((prevCount) => (prevCount + 1) % userDataArray.length);
        },
        onError: (error) => {
          console.error("Error fetching RUL data:", error);
        },
      });
    } catch (err) {
      console.error("Error fetching RUL data:", error);
    }
  };

  // fetch data on mount
  useEffect(() => {
    fetchRulPrediction();
    const now: DateTime = DateTime.now().toUTC();
    const startOfDuration: DateTime = now.startOf(timeDuration);
    const endOfDuration: DateTime = now.endOf(timeDuration);

    const inputData: GetPropertyDataBetween = {
      from: startOfDuration.toISO(),
      to: endOfDuration.toISO(),
      properties: [
        "engSpeedDisplay",
        "engOilPress",
        "engFuelLevelUnits",
        "genL1Volts",
        "genL2Volts",
        "genL3Volts",
        "mainsL1Volts",
        "mainsL2Volts",
        "mainsL3Volts",
      ],
    };

    const inputAvg: GetTestAgg = {
      property: "engSpeedDisplay",
      timeDuration: "month",
    };

    testAgg.mutate(inputAvg, {
      onSuccess: (data1) => {
        console.log("data1", data1);
        setDataavg(data1);
      },
      onError: (error) => {
        console.error("get property data between error", error);
      },
    });

    getPropertyDataBetween.mutate(inputData, {
      onSuccess: (data) => {
        // console.log("prop data", data);
        setData(data);
        // const cd = data.map((value) => ({
        //   x: value.timestamp,
        //   y: value.propertyValue,
        // }));
      },
      onError: (error) => {
        console.error("get property data between error", error);
      },
    });
  }, [timeDuration]);

  /* way to filter data */
  useEffect(() => {
    console.log("data", data);
    const filtData = data?.filter((value) => value.gensetProperty.propertyName === "mainsL1Volts");
    console.log("filtData", filtData);
  }, [data]);

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
        <div className="aspect-4/3 bg-base-200">
          <EngineSpeedStatistics
            chartData={data?.filter((value) => value.gensetProperty.propertyName === "engSpeedDisplay")}
          />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <EngineOilPressureStatistics
            chartData={data?.filter((value) => value.gensetProperty.propertyName === "engOilPress")}
          />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <EngineFuelLevelStatistics
            chartData={data?.filter((value) => value.gensetProperty.propertyName === "engFuelLevelUnits")}
          />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <GeneratorVoltageStatistics
            chartData={data?.filter(
              (value) =>
                value.gensetProperty.propertyName === "genL1Volts" ||
                value.gensetProperty.propertyName === "genL2Volts" ||
                value.gensetProperty.propertyName === "genL3Volts"
            )}
          />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <MainsVoltageStatistics
            chartData={data?.filter(
              (value) =>
                value.gensetProperty.propertyName === "mainsL1Volts" ||
                value.gensetProperty.propertyName === "mainsL2Volts" ||
                value.gensetProperty.propertyName === "mainsL3Volts"
            )}
          />
        </div>
        <div className="aspect-4/3 bg-base-200">
          <RulChart currentRulPoint={rulPred} simulatedRulPoint={null} />
        </div>
      </div>
    </div>
  );
};
