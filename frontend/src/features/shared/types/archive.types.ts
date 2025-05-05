import { GensetProperty } from "./gensetProperty.types";

export interface Archive {
  id: number;
  timestamp: string;
  gensetPropertyId: number;
  gensetProperty: GensetProperty;
  propertyValue: number;
  isAnomaly: boolean;
}

export interface TimerangeStatistics {
  today: number;
  week: number;
  month: number;
  total: number;
}

export interface PropertyStatistics {
  propertyName: string;
  readablePropertyName: string;
  counts: TimerangeStatistics;
}

export interface AnomalyStatistics {
  timezone: string;
  overall: TimerangeStatistics;
  byProperty: PropertyStatistics[];
}
