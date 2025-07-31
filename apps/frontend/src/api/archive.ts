// frontend/src/api/archive.ts
import { ROUTES } from "../config/backend";
import { AnomalyStatistics, Archive, GensetPropertyStatistics, GetPropertyStatisticsFilters } from "../types/archive.types";
import { GensetPropertyName } from "../types/gensetProperty.types";

export interface GetPropertyDataBetween {
  from: String | null;
  to: String | null;
  properties: GensetPropertyName[] | null;
}

export interface GetDataPaginatedFilters {
  page: number;
  propertyNames: GensetPropertyName[];
  isAnomaly: boolean | null;
  from: String | null;
  to: String | null;
}

export interface Metadata {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: String; // "/?page=1";
  lastPageUrl: String; // "/?page=41";
  nextPageUrl: String | null; // "/?page=2";
  previousPageUrl: String | null;
}

export interface PaginatedArchiveData {
  meta: Metadata;
  data: Archive[];
}

export const archiveApi = {
  getDataPaginated: async (filters: GetDataPaginatedFilters): Promise<PaginatedArchiveData> => {
    const response = await fetch(ROUTES.ARCHIVE_GET_DATA_PAGINATED, {
      method: "POST",
      headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      credentials: "include",
      body: JSON.stringify(filters),
    });
    if (!response.ok) throw new Error(`Failed to get paginated archive data`);
    return response.json() as Promise<PaginatedArchiveData>;
  },

  getPropertyStatistics: async (filters: GetPropertyStatisticsFilters): Promise<GensetPropertyStatistics> => {
    const response = await fetch(
      ROUTES.ARCHIVE_PROPERTY_GET_STATISTICS + `?propertyName=${filters.propertyName}&timeDuration=${filters.timeDuration}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error(`Failed to get property statistics for ${filters.propertyName}`);
    return response.json() as Promise<GensetPropertyStatistics>;
  },

  getAnomalyStatistics: async (): Promise<AnomalyStatistics> => {
    const response = await fetch(ROUTES.ARCHIVE_ANOMALY_GET_STATISTICS, {
      method: "GET",
      headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get anomaly statistics");
    return response.json() as Promise<AnomalyStatistics>;
  },

  getPropertyDataBetween: async (filters: GetPropertyDataBetween): Promise<Archive[]> => {
    const response = await fetch(ROUTES.ARCHIVE_PROPERTY_GET_DATA_BETWEEN, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      body: JSON.stringify(filters),
    });

    if (!response.ok) throw new Error("Failed to fetch archive data for given properties", { cause: response.json() });
    return response.json() as Promise<Archive[]>;
  },
};
