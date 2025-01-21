import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  voltageData: [],
  currentData: [],
  fuelLevelData: [],
  engineSpeedData: [],
  oilPressureData: [],
  batteryData: [],
  // addBatteryData: (state, action) => {
  //   state.batteryData.push(action.payload);

  //   if (state.batteryData.length > 150) state.batteryData.shift();
  // },
};

const graphSlice = createSlice({
  name: "graphData",
  initialState,
  reducers: {
    addVoltageData: (state, action) => {
      if (state.voltageData.length >= 150) {
        state.voltageData.shift();
      }
      state.voltageData.push(action.payload);
      // console.log("Voltage Redex array0");
      // console.log(typeof);
    },
    addCurrentData: (state, action) => {
      if (state.currentData.length >= 150) {
        state.currentData.shift();
      }
      state.currentData.push(action.payload);
      // console.log("Current Redex array0");
      // console.log(state.graphData);
    },
   
    addFuelLevelData: (state, action) => {
      state.fuelLevelData.push(action.payload);

      if (state.fuelLevelData.length > 48) state.fuelLevelData.shift();
    },
    addEngineSpeedData: (state, action) => {
      state.engineSpeedData.push(action.payload);

      if (state.engineSpeedData.length > 150)
         state.engineSpeedData.shift();
    },
    addOilPressureData: (state, action) => {
      state.oilPressureData.push(action.payload);

      if (state.oilPressureData.length > 48) state.oilPressureData.shift();
    },
    addBatteryData: (state, action) => {
      state.batteryData.push(action.payload);
      if (state.batteryData.length > 150) state.batteryData.shift();
    },
    clearGraphData: (state) => {
      state.voltageData = [];
      state.currentData = [];
    },
  },
});

export const { addVoltageData, addCurrentData, clearGraphData } =
  graphSlice.actions;
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
