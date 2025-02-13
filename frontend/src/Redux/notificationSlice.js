// notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload.id
      );
    },
  },
});

export const { addNotification, removeNotification } =
  notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.notifications;
export default notificationSlice.reducer;
