import { GensetProperty, GensetPropertyName } from "./gensetProperty.types";
import { DateTimeUnit, DayNumbers, WeekNumbers, MonthNumbers } from "luxon";

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
  year: number,
  total: number;
}

export interface PropertyStatistics {
  propertyName: string;
  readablePropertyName: string;
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

export interface AnomalyStatistics {
  timezone: string;
  overall: TimerangeStatistics;
  byProperty: PropertyStatistics[];
}

export interface GetPropertyStatisticsFilters {
  propertyName: GensetPropertyName;
  timeDuration: DateTimeUnit;
}

export interface PropertyStatisticsAverage {
  day: DayNumbers;
  week: WeekNumbers;
  month: MonthNumbers;
  year: number;
  genset_property_id: number;
  avg: number;
}

export interface GensetPropertyStatisticsMetadata {
  timeDuration: DateTimeUnit;
  averaged: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
}

export interface GensetPropertyStatistics {
  meta: GensetPropertyStatisticsMetadata;
  data: PropertyStatisticsAverage[];
}
