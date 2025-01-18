

// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   notifications: [],  
//   currentAnomalies: { L1: false, L2: false, L3: false }, 
//   voltageAnomalies: { L1: false, L2: false, L3: false },
// };

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
    
//     addNotification: (state, action) => {
//       const { id, message, type } = action.payload;

//       if (type === "current" && !state.currentAnomalies[id]) {
//         state.notifications.push(action.payload);
//         state.currentAnomalies[id] = true; 
//       } else if (type === "voltage" && !state.voltageAnomalies[id]) {
//         state.notifications.push(action.payload);
//         state.voltageAnomalies[id] = true; 
//       }
//     },

//     removeNotification: (state, action) => {
//       const { id, type } = action.payload;

//       state.notifications = state.notifications.filter(
//         (notification) => notification.id !== id
//       );

//       if (type === "current") {
//         state.currentAnomalies[id] = false; 
//       } else if (type === "voltage") {
//         state.voltageAnomalies[id] = false; 
//       }
//     },

//     clearNotifications: (state) => {
//       state.notifications = [];
//       state.currentAnomalies = { L1: false, L2: false, L3: false };
//       state.voltageAnomalies = { L1: false, L2: false, L3: false };
//     },
//   },
// });

// export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;

// export default notificationSlice.reducer;
// redux/notificationSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   notifications: [],
// };

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
//     addNotification: (state, action) => {
//       state.notifications.push(action.payload);
//     },
//     removeNotification: (state, action) => {
//       state.notifications = state.notifications.filter(
//         (notification) => notification.id !== action.payload.id
//       );
//     },
//   },
// });

// export const { addNotification, removeNotification } = notificationSlice.actions;
// export const selectNotifications = (state) => state.notifications.notifications;
// export default notificationSlice.reducer;


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

export const { addNotification, removeNotification } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.notifications;
export default notificationSlice.reducer;
