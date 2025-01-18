// // // redux/graphSlice.js
// // import { createSlice } from "@reduxjs/toolkit";

// // const initialState = {
// //   voltageData: [],  // Array to store the graph data
// // };

// // const graphSlice = createSlice({
// //   name: "graph",
// //   initialState,
// //   reducers: {
// //     addGraphData: (state, action) => {
// //       // Limit the data size to prevent memory overload
// //       if (state.voltageData.length > 150) state.voltageData.shift();
// //       state.voltageData.push(action.payload);
// //     },
// //   },
// // });

// // export const { addGraphData } = graphSlice.actions;
// // export const selectGraphData = (state) => state.graph.voltageData;
// // export default graphSlice.reducer;

// // redux/graphSlice.js
// // import { createSlice } from "@reduxjs/toolkit";

// // const initialState = {
// //   voltageData: [],
// // };

// // const graphSlice = createSlice({
// //   name: "graph",
// //   initialState,
// //   reducers: {
// //     addGraphData: (state, action) => {
// //       // Add new graph data, keep a limit to avoid large array sizes.
// //       if (state.voltageData.length > 150) {
// //         state.voltageData.shift(); // Remove the oldest data point
// //       }
// //       state.voltageData.push(action.payload); // Add new data
// //     },
// //   },
// // });

// // export const { addGraphData } = graphSlice.actions;
// // export const selectGraphData = (state) => state.graph.voltageData;
// // export default graphSlice.reducer;


// // graphSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   voltageData: [], // Voltage Data
//   currentData: [], // Current Data
// };

// const graphSlice = createSlice({
//   name: "graphData",
//   initialState,
//   reducers: {
//     addVoltageData: (state, action) => {
//       state.voltageData.push(action.payload);
//     },
//     addCurrentData: (state, action) => {
//       state.currentData.push(action.payload);
//     },
//     clearGraphData: (state) => {
//       state.voltageData = [];
//       state.currentData = [];
//     },
//   },
// });

// export const { addVoltageData, addCurrentData, clearGraphData } = graphSlice.actions;
// export const selectVoltageData = (state) => state.graphData.voltageData;
// export const selectCurrentData = (state) => state.graphData.currentData;
// export default graphSlice.reducer;
// redux/graphSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  voltageData: [],  // Voltage data for graphing
  currentData: [],  // Current data for graphing
  fuelLevelData: [],
  engineSpeedData: [],
  oilPressureData: [],
  batteryData: [],
  addBatteryData: (state, action) => {
    state.batteryData.push(action.payload);
    // Limit the data to the most recent 150 data points
    if (state.batteryData.length > 150) state.batteryData.shift();
  },
};

const graphSlice = createSlice({
  name: "graphData",
  initialState,
  reducers: {
    addVoltageData: (state, action) => {
      // Limit the size of the voltage data array to 150 points
      if (state.voltageData.length >= 150) {
        state.voltageData.shift(); // Remove the oldest data point
      }
      state.voltageData.push(action.payload); // Add new data
    },
    addCurrentData: (state, action) => {
      // Limit the size of the current data array to 150 points
      if (state.currentData.length >= 150) {
        state.currentData.shift(); // Remove the oldest data point
      }
      state.currentData.push(action.payload); // Add new data
    },
    addFuelLevelData: (state, action) => {
      state.fuelLevelData.push(action.payload);
      // Optional: Limit the size of data if it exceeds a certain number
      if (state.fuelLevelData.length > 48) state.fuelLevelData.shift();
    },
    addEngineSpeedData: (state, action) => {
      state.engineSpeedData.push(action.payload);
      // Optional: Limit the size of data if it exceeds a certain number
      if (state.engineSpeedData.length > 150) state.engineSpeedData.shift();
    },
    addOilPressureData: (state, action) => {
      state.oilPressureData.push(action.payload);
      // Optional: Limit the size of data if it exceeds a certain number
      if (state.oilPressureData.length > 48) state.oilPressureData.shift();
    },
    addBatteryData: (state, action) => {
      state.batteryData.push(action.payload);
      if (state.batteryData.length > 150) state.batteryData.shift(); // Limit to 150 data points
    },
    clearGraphData: (state) => {
      // Clear both voltage and current data
      state.voltageData = [];
      state.currentData = [];
    },
  },
});

export const { addVoltageData, addCurrentData, clearGraphData } = graphSlice.actions;
export const { addFuelLevelData, addEngineSpeedData } = graphSlice.actions;
export const { addOilPressureData } = graphSlice.actions;
export const { addBatteryData } = graphSlice.actions;

export const selectBatteryData = (state) => state.graphData.batteryData;
export const selectOilPressureData = (state) => state.graphData.oilPressureData;
export const selectFuelLevelData = (state) => state.graphData.fuelLevelData;
export const selectEngineSpeedData = (state) => state.graphData.engineSpeedData;
export const selectVoltageData = (state) => state.graphData.voltageData;
export const selectCurrentData = (state) => state.graphData.currentData;

export default graphSlice.reducer;
