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

// {
//   "id": 27900,
//   "timestamp": "2025-04-18T13:40:36.000Z",
//   "sensorPropertyId": 1,
//   "value": -2.622061,
//   "confidenceScorePercentage": "99.69",
//   "maintenanceNotificationId": 108,
//   "pdmDataKindId": 1,
//   "createdAt": "2025-05-07T10:57:52.725+00:00",
//   "updatedAt": "2025-05-07T10:57:52.725+00:00",
//   "sensorProperty": {
//     "id": 1,
//     "propertyName": "vibration_acceleration_x",
//     "unit": "g",
//     "createdAt": "2025-05-07T10:27:34.360+00:00",
//     "updatedAt": "2025-05-07T10:27:34.360+00:00"
//   },
//   "pdmDataKind": {
//     "id": 1,
//     "kind": "actual",
//     "createdAt": "2025-05-07T10:27:34.351+00:00",
//     "updatedAt": "2025-05-07T10:27:34.351+00:00"
//   }
// },

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

export interface PDMNotificationCount {
  [date: string]: number;
}
