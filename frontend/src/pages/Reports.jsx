import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "react-google-charts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
  // ChartDataLabels
);

const ReportPage = () => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const [propertyFilter, setPropertyFilter] = useState("All");

  const dummyBar = {
    labels: ["Month", "Week", "Day"],
    datasets: [
      {
        label: "",
        data: [583, 371, 103],
        backgroundColor: ["#9BE4B4", "#5EDFFB", "#FFF72D"],
        borderRadius: 4,
        barThickness: 80,
      },
    ],
  };

  const pieData = [
    ["Anomaly", "Count"],
    ["OIL PRESSURE", 483],
    ["FUEL", 1823],
    ["ENGINE SPEED", 670],
  ];

  const pieOptions = {
    title: "",
    is3D: true,
    pieStartAngle: -100,
    sliceVisibilityThreshold: 0.02,
    legend: {
      position: "bottom",
      alignment: "center",
      textStyle: {
        color: "#fff",
        fontSize: 12,
      },
    },
    backgroundColor: "#1e1e1e",
    colors: ["#9BE4B4", "#5EDFFB", "#FFF627"],
  };

  const dummyLine = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Rpm",
        data: [200, 700, 300, 1800],
        borderColor: "#00d9ff",
        backgroundColor: "#00d9ff",
        tension: 0.1,
        pointRadius: 4,
      },
    ],
  };

  // const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#fff",
          font: {
            size: 14,
          },
          maxRotation: 0,
          autoSkip: false,
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
      },
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value) => `${value} Bar`,
          color: "#fff",
          font: {
            size: 14,
          },
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const voltage = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "L1",
        data: [
          241.8, 241.7, 242.0, 242.1, 241.9, 242.2, 241.8, 241.6, 241.9, 242.0, 241.7, 241.8, 242.1, 241.9, 241.6, 241.7,
          242.3, 242.1, 242.0, 241.8, 241.9, 242.2, 241.7, 241.8, 241.9, 242.1, 241.6, 241.8, 242.0, 241.9,
        ],
        borderColor: "#9BE4B4",
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "L2",
        data: [
          242.0, 241.9, 242.1, 242.3, 241.8, 241.9, 242.2, 242.0, 241.7, 241.9, 242.1, 242.2, 241.8, 241.9, 242.0, 242.1,
          242.3, 241.9, 241.7, 241.6, 242.0, 242.1, 241.8, 241.9, 242.0, 241.7, 241.8, 242.2, 242.1, 242.0,
        ],
        borderColor: "#5EDFFB",
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "L3",
        data: [
          241.0, 242.2, 241.8, 242.0, 242.0, 242.1, 242.2, 242.0, 241.8, 242.2, 242.1, 242.0, 241.6, 242.3, 242.0, 241.8,
          242.2, 242.2, 241.9, 242.1, 242.0, 242.2, 241.7, 242.0, 242.1, 241.8, 242.1, 242.0, 241.7, 241.3,
        ],
        borderColor: "#FFF627",
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="bg-[#1e1e1e] text-white flex flex-col h-full">
      <div className="top-0 z-10 bg-[#1e1e1e] p-6 shadow flex flex-wrap gap-6 items-center">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-3 py-2 bg-[#2e2e2e] text-white font-semibold rounded-sm shadow">
          <option value="Week">Time Filter</option>
        </select>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-3 py-2 bg-[#2e2e2e] text-white font-semibold rounded-sm shadow">
          <option value="All">Properties</option>
        </select>
        <button className="ml-auto bg-green-300 hover:bg-green-400 text-black px-4 py-2 font-semibold rounded-sm shadow">
          Export to PDF
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-4 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <ChartBox title="TOTAL ANOMALIES">
            <div className="flex gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#9BE4B4] rounded-sm"></span>
                <span className="text-white text-sm font-semibold">Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#5EDFFB] rounded-sm"></span>
                <span className="text-white text-sm font-semibold">Week</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#FFF72D] rounded-sm"></span>
                <span className="text-white text-sm font-semibold">Day</span>
              </div>
            </div>

            <Bar
              data={dummyBar}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                    labels: {
                      color: "#fff",
                      font: { weight: "bold" },
                    },
                  },
                  datalabels: {
                    color: "#fff",
                    anchor: "top",
                    align: "top",
                    font: { size: 14 },
                    formatter: (value) => value,
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12, weight: "bold" },
                    },
                    grid: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: "#fff",
                      font: { size: 12, weight: "bold" },
                      callback: (value) => `${value}`,
                    },
                    grid: { color: "#333", lineWidth: 0.5 },
                  },
                },
              }}
              height={150}
              plugins={[ChartDataLabels]}
            />
          </ChartBox>
          <ChartBox title="TYPE OF ANAMOLY">
            <Chart chartType="PieChart" data={pieData} options={pieOptions} width={"100%"} height={"300px"} />
          </ChartBox>
          <ChartBox title="ENGINE SPEED">
            <Line
              data={dummyLine}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                grid: {
                  color: "#ccc",
                  lineWidth: 0.5,
                },
                scales: {
                  y: {
                    ticks: {
                      color: "#fff",
                      callback: (value) => `${value} Rpm`,
                    },
                  },
                  x: {
                    ticks: { color: "#fff" },
                  },
                },
              }}
              height={150}
            />
          </ChartBox>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartBox title="ENGINE OIL PRESSURE">
            <Line
              data={{
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
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                      maxRotation: 0,
                      autoSkip: false,
                    },
                    grid: {
                      color: "#444",
                      lineWidth: 0.3,
                    },
                  },
                  y: {
                    min: 1,
                    max: 5,
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                      stepSize: 1,
                      callback: (value) => `${value} Bar`,
                    },
                    grid: {
                      color: "#444",
                      lineWidth: 0.3,
                    },
                  },
                },
              }}
              height={160}
            />
          </ChartBox>

          <ChartBox title="ENGINE FUEL LEVEL">
            <Line
              data={{
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
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                    },
                    grid: {
                      color: "#444",
                      lineWidth: 0.3,
                    },
                  },
                  y: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                      callback: (value) => `${value} Ltr`,
                    },
                    min: 0,
                    max: 40,
                    grid: {
                      color: "#444",
                      lineWidth: 0.3,
                    },
                  },
                },
              }}
              height={160}
            />
          </ChartBox>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <ChartBox title="GENERATOR VOLTAGE">
            <div className="flex items-center space-x-6 px-4 pt-3 pb-1">
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6 bg-[#9BE4B4] rounded-sm" />
                <span className="text-white text-xs font-bold">L1 </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6  bg-[#5EDFFB ] rounded-sm" />
                <span className="text-white text-xs font-bold">L2 </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6  bg-[#FFF627] rounded-sm" />
                <span className="text-white text-xs font-bold">L3 </span>
              </div>
            </div>

            <Line
              data={voltage}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: false },
                  datalabels: { display: false },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                      maxRotation: 0,
                      minRotation: 0,
                    },
                    grid: {
                      color: "#888",
                      lineWidth: 0.5,
                      drawTicks: false,
                    },
                  },
                  y: {
                    min: 240,
                    max: 244,
                    ticks: {
                      color: "#fff",
                      stepSize: 1,
                      callback: (value) => `${value} V`,
                      font: { size: 12 },
                    },
                    grid: {
                      color: "#888",
                      lineWidth: 0.5,
                      drawTicks: false,
                    },
                  },
                },
              }}
              height={160}
            />
          </ChartBox>

          <ChartBox title="MAINS VOLTAGE">
            <div className="flex items-center space-x-6 px-4 pt-2 pb-1">
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6 bg-[#9BE4B4] rounded-sm" />
                <span className="text-white text-xs font-bold">L1</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6 bg-[#5EDFFB] rounded-sm" />
                <span className="text-white text-xs font-bold">L2</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-4 w-6 bg-[#FFF627] rounded-sm" />
                <span className="text-white text-xs font-bold">L3</span>
              </div>
            </div>

            <Line
              data={voltage}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: false },
                  datalabels: { display: false },
                },
                scales: {
                  x: {
                    ticks: {
                      color: "#fff",
                      font: { size: 12 },
                      maxRotation: 0,
                      minRotation: 0,
                    },
                    grid: {
                      color: "#888",
                      lineWidth: 0.5,
                      drawTicks: false,
                    },
                  },
                  y: {
                    min: 240,
                    max: 244,
                    ticks: {
                      color: "#fff",
                      stepSize: 1,
                      callback: (value) => `${value} V`,
                      font: { size: 12 },
                    },
                    grid: {
                      color: "#888",
                      lineWidth: 0.5,
                      drawTicks: false,
                    },
                  },
                },
              }}
              height={160}
            />
          </ChartBox>
        </div>
      </div>
    </div>
  );
};

const ChartBox = ({ title, children }) => (
  <div className="bg-[#1e1e1e] p-2 rounded shadow flex flex-col items-center justify-center h-80">
    <h2 className="text-sm font-semibold mb-2 text-center">{title}</h2>
    {children}
  </div>
);

export default ReportPage;
