// // src/config/extern.ts

// /**
//  * Configuration for External Services & Modules
//  */

// export const Modules = {
//   // RUL: "http://192.168.10.193:5000",
//   // PDM: "http://192.168.11.115:5000",
//   // ANOMALY: "http://192.168.10.165:5000",
//   ANOMALY: "http://127.0.0.1:5000",
//   RUL: "https://aiserver-desktop.tailaf2c38.ts.net:5000",
//   PDM: "http://127.0.0.1:5002",
// };
//------------------above is old code 
// src/config/extern.ts

/**
 * Configuration for External Services & Modules
 */

export const Modules = {
  // Old IPs (do not use)
  // RUL: "http://192.168.10.193:5000",
  // PDM: "http://192.168.11.115:5000",
  // ANOMALY: "http://192.168.10.165:5000",

  // Local development (use these)
  RUL: import.meta.env.VITE_RUL_API || "http://127.0.0.1:5000",
  PDM: import.meta.env.VITE_PDM_API || "http://127.0.0.1:5010",
  ANOMALY: import.meta.env.VITE_ANOMALY_API || "http://127.0.0.1:5011",
};