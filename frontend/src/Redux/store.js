// store.js

import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./notificationSlice";
import graphReducer from "./graphSlice";
const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    graphData: graphReducer,
  },
});

export default store;

