export interface AnomalyNotification {
  id: number;
  summary: string;
  message: string;
  archiveId: number;
  shouldBeDisplayed: boolean;
  notificationTypeId: number;
  startedAt: string; // ISO 8601 date string
  finishedAt: string; // ISO 8601 date string
}

export interface AnomalyNotificationType {
  id: number;
  type: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
