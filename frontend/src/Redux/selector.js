// redux/selectors.js
import { createSelector } from "reselect";

export const selectGraphData = (state) => state.graphData.data;

export const selectLastTenGraphData = createSelector(
  [selectGraphData],
  (data) => data.slice(-10)  
);
