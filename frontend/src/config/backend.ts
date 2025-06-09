// src/config/backend.ts

export const BACKEND_BASE_URL = "http://localhost:3000";
export const ROUTES = {
  /* AUTH */
  GET_LOGGED_IN_USER: BACKEND_BASE_URL + "/auth/getLoggedInUser",

  /* ARCHIVE */

  /* PDM */
  PDM_CREATE: BACKEND_BASE_URL + "/pdm" + "/create",
  PDM_GET_RECENT: BACKEND_BASE_URL + "/pdm" + "/getRecent",
  PDM_GET_LATEST: BACKEND_BASE_URL + "/pdm" + "/getLatestEntry",
  PDM_GET_RECENT_ACTUAL: BACKEND_BASE_URL + "/pdm" + "/getRecentActual",
  PDM_GET_RECENT_FORECASTED: BACKEND_BASE_URL + "/pdm" + "/getRecentForecasted",
  PDM_NOTIF_GET_UNRESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getUnresolved",
  PDM_NOTIF_GET_RESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getResolved",
  PDM_NOTIF_GET_ALL: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getAll",
  PDM_NOTIF_GET_LATEST_UNRESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getLatestUnresolved",
  PDM_NOTIF_MARK_READ: BACKEND_BASE_URL + "/pdm" + "/notification" + "/read",
  PDM_GET_STATISTICS: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getStatistics",

  /*  */
};
