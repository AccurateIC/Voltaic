// src/config/backend.ts

export const BACKEND_BASE_URL = "http://localhost:3333"; // dev
// export const BACKEND_BASE_URL = "http://127.0.0.1:3333"; // prod
export const ROUTES = {
  /* AUTH */
  AUTH_USER_REGISTER: BACKEND_BASE_URL + "/auth" + "/register",
  AUTH_USER_LOGIN: BACKEND_BASE_URL + "/auth" + "/login",
  AUTH_USER_LOGOUT: BACKEND_BASE_URL + "/auth" + "/logout",
  AUTH_USER_HARD_DELETE: BACKEND_BASE_URL + "/auth" + "/hardDelete",
  AUTH_USER_GET_LOGGED_IN_USER: BACKEND_BASE_URL + "/auth" + "/getLoggedInUser",
  AUTH_USER_UPDATE: BACKEND_BASE_URL + "/auth" + "/update",

  /* ARCHIVE */
  ARCHIVE_GET_LATEST: BACKEND_BASE_URL + "/archive" + "/getLatest",
  ARCHIVE_GET_DATA_BETWEEN: BACKEND_BASE_URL + "/archive" + "/getBetween",
  ARCHIVE_GET_DATA_PAGINATED: BACKEND_BASE_URL + "/archive" + "/getPaginated",
  ARCHIVE_PROPERTY_GET_STATISTICS: BACKEND_BASE_URL + "/archive" + "/getPropertyStatistics",
  ARCHIVE_PROPERTY_GET_DATA_BETWEEN: BACKEND_BASE_URL + "/archive" + "/getPropertyDataBetween",
  ARCHIVE_ANOMALY_GET_STATISTICS: BACKEND_BASE_URL + "/archive" + "/getAnomalyStatistics",

  /* ANOMALY NOTIFICATION */
  ANOMALY_NOTIF_GET_ALL: BACKEND_BASE_URL + "/notification" + "/getAll",
  ANOMALY_NOTIF_GET_RESOLVED: BACKEND_BASE_URL + "/notification" + "/getResolved",
  ANOMALY_NOTIF_GET_UNRESOLVED: BACKEND_BASE_URL + "/notification" + "/getUnresolved",
  ANOMALY_NOTIF_MARK_AS_READ: BACKEND_BASE_URL + "/notification" + "/read",

  /* PDM */
  PDM_CREATE: BACKEND_BASE_URL + "/pdm" + "/create",
  PDM_DELETE: BACKEND_BASE_URL + "/pdm" + "/delete",
  PDM_GET_RECENT: BACKEND_BASE_URL + "/pdm" + "/getRecent",
  PDM_GET_LATEST: BACKEND_BASE_URL + "/pdm" + "/getLatestEntry",
  PDM_GET_RECENT_ACTUAL: BACKEND_BASE_URL + "/pdm" + "/getRecentActual",
  PDM_GET_RECENT_FORECASTED: BACKEND_BASE_URL + "/pdm" + "/getRecentForecasted",

  PDM_NOTIF_MARK_AS_READ: BACKEND_BASE_URL + "/pdm" + "/notification" + "/read",
  PDM_NOTIF_GET_ALL: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getAll",
  PDM_NOTIF_GET_RECENT: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getRecent",
  PDM_GET_STATISTICS: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getStatistics",
  PDM_NOTIF_GET_RESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getResolved",
  PDM_NOTIF_GET_UNRESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getUnresolved",
  PDM_NOTIF_GET_LATEST_ENTRY: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getLatestEntry",
  PDM_NOTIF_GET_RECENT_ACTUAL: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getRecentActual",
  PDM_NOTIF_GET_RECENT_FORECASTED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getRecentForecasted",
  PDM_NOTIF_GET_LATEST_UNRESOLVED: BACKEND_BASE_URL + "/pdm" + "/notification" + "/getLatestUnresolved",

  /* ROLE */
  ROLE_GET_ALL: BACKEND_BASE_URL + "/role" + "/getAll",

  /* GENSET PROPERTY */
  GENSET_PROPERTY_GET_ALL: BACKEND_BASE_URL + "/property" + "/getAll",
};
