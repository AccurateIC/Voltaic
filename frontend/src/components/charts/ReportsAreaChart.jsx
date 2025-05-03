import React from "react";
import { Line } from "react-chartjs-2";
import ChartBox from "./Chartbox";

const ReportAreaChart = () => {
  const oilPressureData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Oil Pressure",
        data: [3.3, 4.2, 3.0, 4.8],
        borderColor: "rgba(120, 199, 173, 1)",
        backgroundColor: "#9BE4B4B2",
        tension: 0.1,
        fill: true,
        pointBackgroundColor: "rgba(173, 255, 201, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const fuelLevelData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Ltr",
        data: [12, 25, 18, 30],
        borderColor: "#00d9ff",
        backgroundColor: "#5EDFFBB2",
        tension: 0.1,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#444", lineWidth: 0.3 },
      },
      y: {
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#444", lineWidth: 0.3 },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1">
        <ChartBox title="ENGINE OIL PRESSURE">
          <Line
            data={oilPressureData}
            options={{
              ...commonOptions,
              y: {
                ...commonOptions.scales.y,
                min: 1,
                max: 5,
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  stepSize: 1,
                  callback: (value) => `${value} Bar`,
                },
              },
            }}
            height={160}
          />
        </ChartBox>
      </div>

      <div className="col-span-1">
        <ChartBox title="ENGINE FUEL LEVEL">
          <Line
            data={fuelLevelData}
            options={{
              ...commonOptions,
              y: {
                ...commonOptions.scales.y,
                min: 0,
                max: 40,
                ticks: {
                  ...commonOptions.scales.y.ticks,
                  callback: (value) => `${value} Ltr`,
                },
              },
            }}
            height={160}
          />
        </ChartBox>
      </div>
    </div>
  );
};

export default ReportAreaChart;
