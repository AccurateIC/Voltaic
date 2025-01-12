// src/pages/Engine.jsx
import { useEffect, useState } from "react";
import ResponsiveGridLayout from "react-grid-layout";
import { useMessageBus } from "../lib/MessageBus";
import { Toolbar } from "../components/Toolbar";
import { toast } from "sonner";
import { FaOilCan, FaBolt, FaBatteryFull } from "react-icons/fa";
import ReactSpeedometer from "react-d3-speedometer";
import GaugeChart from "react-gauge-chart";

const defaultLayout = [
  { w: 3, h: 7, x: 0, y: 0, i: "a", moved: false, static: false },
  { w: 1, h: 1, x: 3, y: 0, i: "b", moved: false, static: false },
  { w: 1, h: 6, x: 3, y: 1, i: "c", moved: false, static: false },
  { w: 4, h: 3, x: 0, y: 7, i: "d", moved: false, static: false },
  { w: 4, h: 8, x: 4, y: 0, i: "e", moved: false, static: false },
  { w: 4, h: 2, x: 4, y: 8, i: "f", moved: false, static: false },
];

function Engine() {
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const [shouldToolbarBeVisible, setShouldToolbarBeVisible] = useState(true);
  const [rglContainerWidth, setRglContainerWidth] = useState(1650);
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem("engine-page-layout");
    console.log(savedLayout);
    if (savedLayout) {
      return JSON.parse(savedLayout);
    } else {
      return defaultLayout;
    }
  });
  const [isLayoutEditable, setIsLayoutEditable] = useState(false);

  useMessageBus("edit-layout", (msg) => {
    console.log(`Message received: ${JSON.stringify(msg, null, 2)}`);
    setIsLayoutEditable(!!msg.message);
  });

  const handleLayoutChange = (newLayout) => {
    console.log("bruh", JSON.stringify(newLayout, null, 2));
    setLayout(newLayout);
    // save the new layout to local storage
    localStorage.setItem(
      "engine-page-layout",
      JSON.stringify(newLayout, null, 2)
    );
  };

  const handleWidthChange = ({ containerWidth }) => {
    console.log(containerWidth);
  };

  const handleBreakpointChange = () => {
    console.log("breakpoint changed");
    toast.info("breakpoint changed");
  };

  return (
    <div className="flex flex-col">
      {shouldToolbarBeVisible && (
        <div className="flex justify-center w-full mb-4">
          <Toolbar />
        </div>
      )}
      <div>
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={32}
          rowHeight={30}
          breakpoints={breakpoints}
          width={rglContainerWidth}
          isDraggable={isLayoutEditable}
          isResizable={isLayoutEditable}
          onLayoutChange={handleLayoutChange}
          allowOverlap={false}
          onWidthChange={handleWidthChange}
          onBreakpointChange={handleBreakpointChange}
        >
          {/* ENGINE SPEED */}
          <div
            key="a"
            className="bg-base-200 flex items-center justify-center"
            style={{
              width: "400px", // Increased width
              height: "400px", // Increased height
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                marginBottom: "5px",
                marginTop: "75px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {" "}
              {/* Slightly larger text */}
              ENGINE SPEED
            </h2>
            <ReactSpeedometer
              value={1500}
              minValue={0}
              maxValue={2000}
              segments={5}
              needleColor="#FF0000"
              startColor="#4CAF50"
              endColor="#FF0000"
              textColor="#000"
              height={250} // Increased height of the speedometer
              width={300} // Increased width of the speedometer
              ringWidth={35} // Increased ring width for proportion
              needleHeightRatio={0.7} // Adjusted needle size for better visibility
              valueTextFontSize="16px" // Slightly larger value text font
              currentValueText="${value} RPM"
            />
          </div>

          {/* FUEL QUANTITY */}
          <div
            key="b"
            className="bg-base-200 flex flex-col items-center justify-center"
            style={{
              width: "100%",
              height: "100%",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                font: "black",
                marginBottom: "15px",
                marginTop: "05px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              FUEL QUANTITY
            </h2>
            <div style={{ width: "370px", height: "300px" }}>
              <GaugeChart
                id="fuel-quantity-gauge"
                nrOfLevels={25}
                colors={["#FF5F6D", "#FFC371", "#5BE12C"]}
                arcWidth={0.3}
                percent={0.21}
                needleColor="#000"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

          {/* Oil Pressure */}
          <div key="c" className="bg-base-200 ">
            <div className="stats bg-base-200 shadow w-full h-full flex flex-col items-center justify-center font-bold">
              <h2>Oil Pressure</h2>
              <div className="text-7xl mt-4">
                <FaOilCan />
                <p className="font-bold text-3xl mt-4">2.06 bar</p>
              </div>
            </div>
          </div>

          <div
            key="d"
            className="bg-transparent flex items-center justify-center"
          >
            <div className="stats bg-base-200 shadow w-full h-full flex flex-col items-center justify-center font-bold">
              <h2>Charge Alt Voltage</h2>
              <div className="text-6xl mb-6 mt-7">
                <FaBolt />
              </div>
              <p className="font-bold text-3xl">11.2 V</p>
            </div>
          </div>

          <div key="e" className="bg-base-200">
            {/* Custom Fuel Level Meter */}
            <div
              key="c"
              className="bg-base-200 flex flex-col items-center p-4 font-bold"
            >
              <h2>Fuel Level</h2>
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium mb-2">50L</div>
                <div
                  style={{
                    width: "50px",
                    height: "300px",
                    border: "2px solid #4caf50",
                    position: "relative",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "50px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      width: "100%",
                      height: `${(25 / 50) * 100}%`,
                      backgroundColor: "#4caf50",
                    }}
                  ></div>
                </div>
                <div className="text-sm font-medium mt-2">0L</div>
              </div>
              <div className="mt-2 font-medium">25L</div>{" "}
            </div>
          </div>

          {/* Charge Voltage */}
          <div key="f" className="bg-base-200">
            <div className="stats bg-base-200 shadow w-full h-full flex flex-col items-center justify-center font-bold">
              <h2>Battery Voltage</h2>
              <div className="text-7xl mb-4 mt-4">
                <FaBatteryFull />
              </div>
              <p className="font-bold text-3xl">12.7 V</p>
            </div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default Engine;
