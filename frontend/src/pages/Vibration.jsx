import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Vibration = () => {
  const [data, setData] = useState([]);
  const [selectedWaves, setSelectedWaves] = useState(["AX", "AY", "AZ"]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const timeLabel = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });

        const newEntry = {
          time: timeLabel,
          AX: Math.sin(Date.now() / 200) * 30,
          AY: Math.cos(Date.now() / 200) * 25,
          AZ: Math.sin(Date.now() / 300) * 20 + Math.cos(Date.now() / 400) * 15,
        };

        return [...prevData.slice(-49), newEntry];
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleButtonClick = (wave) => {
    if (wave === "ALL") {
      setSelectedWaves(["AX", "AY", "AZ"]);
    } else {
      setSelectedWaves((prev) => (prev.includes(wave) ? prev.filter((w) => w !== wave) : [...prev, wave]));
    }
  };

  const getLineColor = (wave) => {
    switch (wave) {
      case "AX":
        return "#6EE7B7";
      case "AY":
        return "#3B82F6";
      case "AZ":
        return "#FACC15";
      default:
        return "#000000";
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1E1E1E]">
      <div className="bg-white shadow-lg rounded-lg p-3 w-full h-full max-w-7xl">
        <h2 className="text-sm md:text-2xl lg:text-xl 2xl:text-3xl font-bold text-black mb-1 text-center">
          Genset Vibration Data
        </h2>

        <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[390px] 2xl:h-[700px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" label={{ value: "Time", position: "bottom", fill: "#444" }} tick={{ fill: "#888" }} />
              <YAxis
                label={{
                  value: "Acceleration",
                  angle: -90,
                  position: "left",
                  fill: "#444",
                }}
                tick={{ fill: "#888" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "14px",
                  color: "#444",
                }}
              />
              {selectedWaves.map((wave) => (
                <Line
                  key={wave}
                  type="monotone"
                  dataKey={wave}
                  stroke={getLineColor(wave)}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  animationDuration={500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {["AX", "AY", "AZ"].map((wave) => (
            <button
              key={wave}
              onClick={() => handleButtonClick(wave)}
              className={`px-6 rounded-lg font-bold shadow-md transition-all duration-200 ${
                selectedWaves.includes(wave)
                  ? wave === "AX"
                    ? "bg-green-400 hover:bg-green-500"
                    : wave === "AY"
                    ? "bg-blue-400 hover:bg-blue-500"
                    : "bg-yellow-400 hover:bg-yellow-500"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}>
              {wave}
            </button>
          ))}
          <button
            onClick={() => handleButtonClick("ALL")}
            className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 font-bold shadow-md transition-all duration-200">
            ALL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vibration;
