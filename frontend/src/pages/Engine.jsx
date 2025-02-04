import { useState, useEffect } from "react";
import { FaOilCan, FaBolt, FaBatteryFull } from "react-icons/fa";
import GaugeComponent from "react-gauge-component";
import { Gauge, gaugeClasses } from "@mui/x-charts";

const Engine = () => {
  const [gaugeValue, setGaugeValue] = useState(1500);

  useEffect(() => {
    const values = [1500];
    let index = 0;

    const updateGaugeValue = () => {
      setGaugeValue(values[index]);
      index = (index + 1) % values.length;
      setTimeout(updateGaugeValue, 1000);
    };

    updateGaugeValue();

    return () => {
      clearTimeout(updateGaugeValue);
    };
  }, []);

  const [gaugeSize, setGaugeSize] = useState({
    width: 230,
    height: 0,
    value: 60,
  });

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 640) {
        // Mobile
        setGaugeSize({ width: 180, height: 170, value: 60 });
      } else if (screenWidth < 1024) {
        // Tablet
        setGaugeSize({ width: 230, height: 220, value: 60 });
      } else if (screenWidth < 1536) {
        // Laptop
        setGaugeSize({ width: 210, height: 280, value: 60 });
      } else {
        // Desktop
        setGaugeSize({ width: 300, height: 350, value: 60 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-auto font-[Sofia-Sans-Semi-Condensed]  dark:bg-gray-900 dark:text-white">
      <div className="flex flex-col flex-1 gap-4 ">
        {/* Engine Speed */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <div className="w-full sm:w-[20rem] md:w-[25rem] lg:w-[25rem] 2xl:w-[40rem] 2xl:h-[27rem] lg:h-[18rem] bg-base-200 text-black flex flex-col items-center font-semibold pt-4 px-4 rounded-lg shadow-md">
            <h2 className="text-md lg:text-md 2xl:text-xl">ENGINE SPEED</h2>
            <div className="w-full h-full flex items-center justify-center">
              <GaugeComponent
                minValue={0}
                maxValue={2500}
                arc={{
                  subArcs: [
                    { limit: 500, color: "#5BE12C", showTick: true },
                    { limit: 1000, color: "#F5CD19", showTick: true },
                    { limit: 1500, color: "#F58B19", showTick: true },
                    { limit: 2000, color: "#EA4228", showTick: true },
                    { limit: 2500, color: "#EA4228", showTick: true },
                  ],
                }}
                value={gaugeValue}
                style={{
                  width: "100%",
                  maxWidth: "85%",
                  maxHeight: "100%",
                  height: "auto",
                }}
              />
            </div>
          </div>

          {/* Fuel Quantity */}
          <div className="w-full sm:w-[20rem] md:w-[25rem] lg:w-[24rem] lg:h-[18rem] 2xl:w-[40.5rem] 2xl:h-[27rem] h-auto bg-base-200 text-black flex flex-col items-center font-semibold pt-4 px-4 rounded-lg shadow-md">
            <h2 className="text-md lg:text-md 2xl:text-xl">FUEL QUANTITY</h2>
            <div className="w-full h-full flex items-center justify-center">
              
              <Gauge
                {...gaugeSize}
                cornerRadius="50%"
                sx={(theme) => ({
                  [`& .${gaugeClasses.valueText}`]: {
                    fontSize: "1.5rem",
                    [`@media (min-width: 1024px)`]: {
                      fontSize: "2rem",
                    },
                    [`@media (min-width: 1536px)`]: {
                      fontSize: "2.5rem",
                    },
                  },
                  [`& .${gaugeClasses.valueArc}`]: {
                    fill: "#B1D5BD",
                  },
                  [`& .${gaugeClasses.referenceArc}`]: {
                    fill: theme.palette.text.disabled,
                  },
                })}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          <div className="w-full sm:w-[12rem] md:w-[15rem] lg:w-[16rem] h-[15rem] 2xl:w-[26.5rem] 2xl:h-[23rem] font-semibold bg-base-200 text-black flex flex-col items-center pt-4 px-4 rounded-lg shadow-md">
            <p className="text-center font-semibold text-md">OIL PRESSURE</p>
            <div
              className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl 2xl:text-9xl my-5"
              style={{ color: "rgba(177, 213, 189, 1)" }}
            >
              <FaOilCan />
            </div>
            <p className="font-bold text-3xl 2xl:text-5xl">2.06 bar</p>
          </div>

          <div className="w-full sm:w-[12rem] md:w-[15rem] lg:w-[16rem] h-[15rem] 2xl:w-[26.5rem] 2xl:h-[23rem] font-semibold bg-base-200 text-black flex flex-col items-center pt-4 px-4 rounded-lg shadow-md">
            <p className="text-center font-semibold text-md">
              CHARGE ALT VOLTAGE
            </p>
            <div
              className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl 2xl:text-9xl my-5"
              style={{ color: "rgba(177, 213, 189, 1)" }}
            >
              <FaBolt />
            </div>
            <p className="font-bold xl:text-3xl 2xl:text-5xl">11.2 V</p>
          </div>

          <div className="w-full sm:w-[12rem] md:w-[15rem] lg:w-[16rem] h-[15rem] 2xl:w-[26.5rem] 2xl:h-[23rem] font-semibold bg-base-200 text-black flex flex-col items-center pt-4 px-4 rounded-lg shadow-md">
            <p className="text-center font-semibold text-md">BATTERY VOLTAGE</p>
            <div
              className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl 2xl:text-9xl my-5"
              style={{ color: "rgba(177, 213, 189, 1)" }}
            >
              <FaBatteryFull />
            </div>
            <p className="font-bold xl:text-3xl 2xl:text-5xl">12.7 V</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full lg:w-[8.8rem] lg:h-[34rem] 2xl:h-[51rem] 2xl:w-[17rem] bg-base-200 text-black font-semibold rounded-lg shadow-md p-2">
        <h2 className="text-center text-sm lg:text-md 2xl:text-lg mb-4 whitespace-nowrap">
          FUEL LEVEL
        </h2>
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium">50L</div>

          <div
            className="relative w-12 md:w-14 lg:w-16 2xl:w-20 bg-[rgba(48,48,48,1)] rounded-full overflow-hidden shadow-md h-[300px] md:h-[350px] lg:h-[400px] lg:w-[4rem] 2xl:h-[42rem] 2xl:w-[5rem] "
            style={{
              boxShadow: "4px 0px 8px 0px rgba(255, 255, 255, 0.41) inset",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "0",
                width: "100%",
                height: `${(30 / 50) * 100}%`,
                backgroundColor: "#B1D5BD",
                boxShadow: "4px 0px 8px 0px rgba(14, 1, 1, 0.49) inset",
                borderTopLeftRadius: "9999px", 
                borderTopRightRadius: "9999px",
              }}
            ></div>
          </div>

          <div className="text-sm font-medium">0L</div>
        </div>

        <div className="text-lg font-medium mt-2">42L</div>
      </div>
    </div>
  );
};

export default Engine;
