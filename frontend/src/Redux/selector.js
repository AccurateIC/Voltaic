// redux/selectors.js
import { createSelector } from "reselect";

// Selector to get the graph data
export const selectGraphData = (state) => state.graphData.data;

// Memoized selector to get the last 10 data points, for example:
export const selectLastTenGraphData = createSelector(
  [selectGraphData],
  (data) => data.slice(-10)  // Returns the last 10 data points
);
