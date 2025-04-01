import { useEffect, useState } from "react";
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, LineChart, Legend } from "recharts";
import { filteredHealthIndexData } from "../components/filteredHealthIndexData";
import { rulInputData } from "../components/rulData";
import { cn } from "../lib/Utils";

const RulChart = ({ apiPoint }) => {
  const data = [...filteredHealthIndexData];
  const singlePointData = apiPoint
    ? {
      Time_Hours: 10000 - apiPoint?.Remaining_Useful_Life,
      Predicted_Health_Index: apiPoint?.Predicted_Health_Index,
      Show_Red: true,
    }
    : {};

  data.push(singlePointData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" name="Ideal Health Index Trend" dataKey="Predicted_Health_Index" strokeWidth={3} stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>

  );
};

const RUL = () => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [count, setCount] = useState(0);
  const [apiPoint, setApiPoint] = useState({ Remaining_Useful_Life: null, Predicted_Health_Index: null });

  const fetchUserDetails = async () => {
    const loggedInUser = await fetch(`${import.meta.env.VITE_ADONIS_BACKEND}/auth/isAuthenticated`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const user = await loggedInUser.json();
    setLoggedInUser(user);
  };

  const fetchRulData = async () => {
    try {
      const loggedInEmail = loggedInUser.email;

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

      console.log(entry);
      const newEntry = {
        Time_Hours: entry.Time_Hours,
        RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
        Oil_Pressure: entry.Oil_Pressure,
        Power_Output_kW: entry.Power_Output_kW,
        Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption,
      };

      const response = await fetch(`${import.meta.env.VITE_RUL_BACKEND}/predict`, {
        method: "POST",
        body: JSON.stringify(newEntry),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setApiPoint(data);
      // Update count based on the user's data array length
      setCount((prevCount) => (prevCount + 1) % userDataArray.length);
    } catch (error) {
      console.error("Error fetching RUL data:", error);
    }
  };

  // Update useEffect to wait for user data
  useEffect(() => {
    // First fetch user details
    fetchUserDetails();
  }, []); // Only run once on component mount

  // Add another useEffect to trigger fetchRulData when user data is available
  useEffect(() => {
    if (loggedInUser && loggedInUser.email) {
      fetchRulData();
    }
  }, [loggedInUser]); // Run when loggedInUser changes

  // const fetchRulData = async () => {
  //   try {
  //     const loggedInEmail = loggedInUser.email;

  //     const entry = rulInputData[loggedInEmail][count];

  //     console.log(entry);
  //     const newEntry = {
  //       Time_Hours: entry.Time_Hours,
  //       RPM_Deviation_Percentage: entry.RPM_Deviation_Percentage,
  //       Oil_Pressure: entry.Oil_Pressure,
  //       Power_Output_kW: entry.Power_Output_kW, // 0.8 * genTotalVA
  //       Inverse_Fuel_Consumption: entry.Inverse_Fuel_Consumption, // 1/fuelCons
  //     };
  //     const response = await fetch(`${import.meta.env.VITE_RUL_BACKEND}/predict`, {
  //       method: "POST",
  //       body: JSON.stringify(newEntry),
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const data = await response.json();
  //     setApiPoint(data);
  //     setCount((prevCount) => (prevCount + 1) % rulInputData.length);
  //   } catch (error) {
  //     console.error("Error fetching RUL data:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchRulData();
  //   fetchUserDetails();
  // }, []);

  // useEffect(() => {
  //   const loggedInEmail = loggedInUser.email;
  //   const entry = rulInputData.loggedInEmail[count];
  //   console.log(entry.Predicted_Health_Index);
  // }, [count, loggedInUser]);

  // useEffect(() => {
  //   // Get the logged in user's email
  //   const loggedInEmail = loggedInUser.email;

  //   // Access the array using the email as key
  //   if (loggedInEmail && rulInputData[loggedInEmail]) {
  //     console.log(rulInputData[loggedInEmail]);
  //     const userDataArray = rulInputData[loggedInEmail];
  //     const entry = userDataArray[count % userDataArray.length];
  //     console.log(entry.Predicted_Health_Index);
  //   }
  // }, [count, loggedInUser]);

  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="flex justify-between mb-2">
        <div className="text-base-200 text-3xl">Remaining Useful Life</div>
        <div className="flex gap-2">
          <button onClick={fetchRulData} className="btn btn-primary">
            Calculate RUL
          </button>
        </div>
      </div>
      <div className="flex flex-col h-4/5">
        <RulChart apiPoint={apiPoint} />
      </div>
      <div>
      </div>
      <div className="flex w-full items-center justify-center">
        <div className={cn(
          "flex flex-col bg-base-200 text-base-content items-center justify-center w-1/3 p-2",
          "rounded hover:bg-neutral hover:text-base-200 transition-all duration-200 shadow"
        )}>
          <div className="text-2xl font-semibold">Remaining Useful Life</div>
          <div className="text-xl">{(Math.round(apiPoint.Predicted_Health_Index * 100) / 100) || 15} hours</div>
        </div>
      </div>
    </div>
  );
};

export default RUL;
