
import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./notificationSlice";

const store = configureStore({
  reducer: {
    notifications: notificationReducer,
  },
});

export default store;

