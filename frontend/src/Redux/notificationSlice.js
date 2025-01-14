// src/redux/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Initial state of notifications
const initialState = {
  notifications: [],
  activeAnomalies: { L1: false, L2: false, L3: false }, // To track active anomalies
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Action to add notification
    addNotification: (state, action) => {
      const { id, message } = action.payload;
      if (!state.activeAnomalies[id]) {
        state.notifications.push(action.payload); // Add notification if not already active
        state.activeAnomalies[id] = true; // Mark this anomaly as active
      }
    },
    // Action to remove notification by id
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
      state.activeAnomalies[id] = false; // Mark this anomaly as cleared
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.activeAnomalies = { L1: false, L2: false, L3: false }; // Reset all anomalies
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
