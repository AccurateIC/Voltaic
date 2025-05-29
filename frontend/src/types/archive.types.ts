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
  today: number;
  week: number;
  month: number;
  total: number;
}

export interface AnomalyStatistics {
  timezone: string;
  overall: TimerangeStatistics;
  byProperty: PropertyStatistics[];
}

export interface AvgStatisstics {
  day?: number;
  week?: number;
  month?: number;
  avg?: number;
  genset_property_id?: number;
}

type PropertyAveragedStatistics = AvgStatistics[] 
