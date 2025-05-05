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
