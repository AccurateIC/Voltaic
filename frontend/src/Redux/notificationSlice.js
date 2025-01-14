
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  notifications: [],
  activeAnomalies: { L1: false, L2: false, L3: false }, 
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    
    addNotification: (state, action) => {
      const { id, message } = action.payload;
      if (!state.activeAnomalies[id]) {
        state.notifications.push(action.payload);
        state.activeAnomalies[id] = true; 
      }
    },
   
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
      state.activeAnomalies[id] = false; 
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.activeAnomalies = { L1: false, L2: false, L3: false };
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
