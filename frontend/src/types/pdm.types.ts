import { DateTimeUnit, DayNumbers, MonthNumbers, WeekNumbers } from "luxon";

export interface MaintenanceReason {
  accel_x?: string;
  accel_y?: string;
  accel_z?: string;
}

export interface PDMNotification {
  id: number;
  timestamp: string; // ISO 8601 date string
  maintenanceReason: MaintenanceReason;
  shouldBeDisplayed: boolean;
  resolvedAt: string; // ISO 8601 date string
}

export interface PDMCreationResponse {
  success: boolean;
  recordsCreated: number;
}

export interface SensorProperty {
  id: number;
  propertyName: string;
  unit: string;
}

export interface PdmDataKind {
  id: number;
  kind: string;
}

export interface VibrationData {
  id: number;
  timestamp: string;
  value: number;
  confidenceScorePercentage: number;
  maintenanceNotificationId: number | null;
  sensorPropertyId: number;
  sensorProperty: SensorProperty;
  pdmDataKindId: number;
  pdmDataKind: PdmDataKind;
}

export interface NotificationCount {
  id: number;
  day?: DayNumbers;
  week?: WeekNumbers;
  month?: MonthNumbers;
  year: number;
  count: number;
}

export interface PDMStatistics {
  meta: { timeDuration: DateTimeUnit };
  data: NotificationCount[];
}
