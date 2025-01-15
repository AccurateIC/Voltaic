

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],  
  currentAnomalies: { L1: false, L2: false, L3: false }, 
  voltageAnomalies: { L1: false, L2: false, L3: false },
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Action to add a notification for current or voltage anomaly
    addNotification: (state, action) => {
      const { id, message, type } = action.payload;

      if (type === "current" && !state.currentAnomalies[id]) {
        state.notifications.push(action.payload);
        state.currentAnomalies[id] = true; // Mark current anomaly as active
      } else if (type === "voltage" && !state.voltageAnomalies[id]) {
        state.notifications.push(action.payload);
        state.voltageAnomalies[id] = true; // Mark voltage anomaly as active
      }
    },

    // Action to remove a notification for current or voltage anomaly
    removeNotification: (state, action) => {
      const { id, type } = action.payload;

      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );

      if (type === "current") {
        state.currentAnomalies[id] = false; // Mark current anomaly as inactive
      } else if (type === "voltage") {
        state.voltageAnomalies[id] = false; // Mark voltage anomaly as inactive
      }
    },

    // Clear all notifications (for example, reset button)
    clearNotifications: (state) => {
      state.notifications = [];
      state.currentAnomalies = { L1: false, L2: false, L3: false };
      state.voltageAnomalies = { L1: false, L2: false, L3: false };
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
