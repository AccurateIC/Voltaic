import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const GensetData = () => {
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
      setSelectedWaves((prev) =>
        prev.includes(wave) ? prev.filter((w) => w !== wave) : [...prev, wave]
      );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1E1E1E]">
<div className="bg-white shadow-lg rounded-lg p-3 w-full h-full max-w-7xl">
      <h2 className="text-sm md:text-2xl lg:text-xl 2xl:text-3xl font-bold text-black mb-1 text-center">
        Genset Vibration Data
      </h2>
        {/* <h3 className="text-lg md:text-xl lg:text-xl 2xl:text-2xl font-bold mb-1 text-center">
          ACCELERATION
        </h3> */}

        <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[390px] 2xl:h-[700px]">
          <Line
            data={{
              labels: data.map((d) => d.time),
              datasets: selectedWaves.map((wave) => ({
                label: wave,
                data: data.map((d) => d[wave]),
                borderColor:
                  wave === "AX"
                    ? "#6EE7B7"
                    : wave === "AY"
                    ? "#3B82F6"
                    : "#FACC15",
                borderWidth: 2,
                pointRadius: 2,
                fill: false,
              })),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 500 },
              scales: {
                x: {
                  title: { display: true, text: "Time" },
                  grid: { color: "#444" },
                  ticks: { color: "#888" },
                },
                y: {
                  title: { display: true, text: "Acceleration" },
                  grid: { color: "#444" },
                  ticks: { color: "#888" },
                },
              },
              elements: {
                line: { tension: 0.3 },
              },
              plugins: {
                legend: {
                  labels: {
                    color: "#444",
                    font: {
                      size: 14,
                    },
                  },
                },
              },
            }}
          />
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
              }`}
            >
              {wave}
            </button>
          ))}
          <button
            onClick={() => handleButtonClick("ALL")}
            className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 font-bold shadow-md transition-all duration-200"
          >
            ALL
          </button>
        </div>
      </div>
    </div>
  );
};

export default GensetData;
