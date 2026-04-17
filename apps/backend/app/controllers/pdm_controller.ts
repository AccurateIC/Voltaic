import type { HttpContext } from "@adonisjs/core/http";
import { createPdmValidator, getPdmStatisticsValidator } from "#validators/pdm";
import transmit from "@adonisjs/transmit/services/main";
import MaintenanceNotification from "#models/maintenance_notification";
import Vibration from "#models/vibration";
import PdmDataKind from "#models/pdm_data_kind";
import SensorProperty from "#models/sensor_property";
import { DateTime, DateTimeUnit } from "luxon";
import { PdmService } from "#services/pdm_service";
import { Exception } from "@adonisjs/core/exceptions";
import logger from "@adonisjs/core/services/logger";
import env from "#start/env";
export default class PdmController {
  async markNotificationRead({ params }: HttpContext) {
    const pdmNotification = await MaintenanceNotification.findOrFail(params.id);
    pdmNotification.shouldBeDisplayed = false;
    pdmNotification.resolvedAt = DateTime.now();
    await pdmNotification.save();
    return pdmNotification;
  }

  async getAllNotifications({}: HttpContext) {
    const pdmNotifications = await MaintenanceNotification.all();
    return pdmNotifications;
  }

  async getUnresolved({}: HttpContext) {
    const pdmNotifications = await MaintenanceNotification.query()
      .where("shouldBeDisplayed", true)
      .orderBy("timestamp", "desc");
    return pdmNotifications;
  }

  async getResolved({}: HttpContext) {
    const pdmNotifications = await MaintenanceNotification.query()
      .where("shouldBeDisplayed", false)
      .orderBy("timestamp", "desc");
    return pdmNotifications;
  }

  async getLatestUnresolvedNotification({}: HttpContext) {
    const latestPdmNotification = await MaintenanceNotification.query()
      .where("shouldBeDisplayed", true)
      .orderBy("timestamp", "desc")
      .limit(1);
    return latestPdmNotification;
  }

  // ✅ replace both with — use last 30 minutes as shared time window
async getRecentActual({}: HttpContext) {
  const cutoff = DateTime.now().minus({ minutes: 30 }).toSQL();
  const pdmVibrationData = await Vibration.query()
    .preload("sensorProperty")
    .preload("pdmDataKind")
    .whereHas("pdmDataKind", (kindQuery) => {
      kindQuery.where("kind", "actual");
    })
    .where("timestamp", ">=", cutoff)
    .orderBy("timestamp", "asc");
  return pdmVibrationData;
}

async getRecentForecasted({}: HttpContext) {
  const cutoff = DateTime.now().minus({ minutes: 30 }).toSQL();
  const pdmVibrationData = await Vibration.query()
    .preload("sensorProperty")
    .preload("pdmDataKind")
    .whereHas("pdmDataKind", (kindQuery) => {
      kindQuery.where("kind", "forecasted");
    })
    .preload("maintenanceNotification")
    .where("timestamp", ">=", cutoff)
    .orderBy("timestamp", "asc");
  return pdmVibrationData;
}

  async getLatestEntry({}: HttpContext) {
    const pdmVibrationEntry = await Vibration.query().orderBy("timestamp", "desc").limit(1);
    return pdmVibrationEntry;
  }

async getRecent({ request }: HttpContext) {
    const page = request.input('page', 1);
    const limit = request.input('limit', 50);
    
    const pdmVibrationData = await Vibration.query()
      .preload("sensorProperty")
      .preload("pdmDataKind")
      .orderBy("timestamp", "desc")
      .paginate(page, limit);
    
    return pdmVibrationData;
  }

  async create({ request, response }: HttpContext) {
    const apiKey = request.header("x-api-key");
    if (apiKey !== env.get("ML_API_KEY")) {
      return response.status(401).json({ message: "Unauthorized" });
    }
    const data = await request.validateUsing(createPdmValidator);
  logger.info({ data }, "Received PDM data");
    transmit.broadcast("pdm", "new pdm data");

    // 1: if maintenance is needed, add to maintenance_notifications table
    let maintenanceNotificationId;
    if (data.maintenance_needed === true) {
      const maintenanceNotification = await MaintenanceNotification.create({
        predictedDominantFrequency: data.predicted_dominant_frequency,
        predictedDominantAmplitude: data.predicted_dominant_amplitude,
        timestamp: DateTime.fromJSDate(data.actual_values_timestamp[0]),
        maintenanceReason: data.maintenance_reason,
        shouldBeDisplayed: true,
      });
      maintenanceNotificationId = maintenanceNotification.id;
    }

    if (data.maintenance_needed === true && maintenanceNotificationId === undefined) {
      throw new Exception("Failed to create maintenance notification record when maintenance was required.", {
        code: "E_DB_INSERT_FAILED",
        status: 500,
      });
    }

    // 2: Get references for pdm_data_kinds
    const actualKind = await PdmDataKind.findBy("kind", "actual");
    const forecastedKind = await PdmDataKind.findBy("kind", "forecasted");

    // 3: Get references for sensor_properties
    const sensorProps = await SensorProperty.all();
    const sensorPropsMap = new Map(sensorProps.map((prop) => [prop.propertyName, prop.id]));

    // 4: Prepare vibration records
    const vibrationRecords = [];

    // Process actual values
    for (let i = 0; i < data.actual_values_timestamp.length; i++) {
      // X axis (required)
      vibrationRecords.push({
        timestamp: DateTime.fromJSDate(data.actual_values_timestamp[i]),
        sensor_property_id: sensorPropsMap.get("vibration_acceleration_x"),
        value: data.actual_values.accel_x[i],
        maintenanceNotificationId: maintenanceNotificationId,
        pdm_data_kind_id: actualKind!.id,
        confidence_score_percentage: data.confidence_score_percentage,
      });

      // Y axis (optional)
      if (data.actual_values.accel_y && data.actual_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.actual_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.actual_values.accel_y[i],
          maintenanceNotificationId: maintenanceNotificationId,
          pdm_data_kind_id: actualKind!.id,
          confidence_score_percentage: data.confidence_score_percentage,
        });
      }

      // Z axis (optional)
      if (data.actual_values.accel_z && data.actual_values.accel_z[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.actual_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_z"),
          value: data.actual_values.accel_z[i],
          maintenanceNotificationId: maintenanceNotificationId,
          pdm_data_kind_id: actualKind!.id,
          confidence_score_percentage: data.confidence_score_percentage,
        });
      }
    }

    // Process forecasted values
    for (let i = 0; i < data.forecasted_values_timestamp.length; i++) {
      // X axis (required)
      vibrationRecords.push({
        timestamp: DateTime.fromJSDate(data.forecasted_values_timestamp[i]),
        sensor_property_id: sensorPropsMap.get("vibration_acceleration_x"),
        value: data.forecasted_values.accel_x[i],
        maintenanceNotificationId: maintenanceNotificationId,
        pdm_data_kind_id: forecastedKind!.id,
        confidence_score_percentage: null,
      });

      // Y axis (optional)
      if (data.forecasted_values.accel_y && data.forecasted_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.forecasted_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.forecasted_values.accel_y[i],
          maintenanceNotificationId: maintenanceNotificationId,
          pdm_data_kind_id: forecastedKind!.id,
          confidence_score_percentage: null,
        });
      }

      // Z axis (optional)
      if (data.forecasted_values.accel_z && data.forecasted_values.accel_z[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.forecasted_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_z"),
          value: data.forecasted_values.accel_z[i],
          maintenanceNotificationId: maintenanceNotificationId,
          pdm_data_kind_id: forecastedKind!.id,
          confidence_score_percentage: null,
        });
      }
    }

    // 5: Insert all vibration records
    await Vibration.createMany(vibrationRecords);

    return { success: true, recordsCreated: vibrationRecords.length };
  }

  async getStatistics({ request }: HttpContext) {
    const reqBody = await request.validateUsing(getPdmStatisticsValidator);
    // (await reqBody).headers.timezone

    const notificationsPerDay = PdmService.maintenanceNotificationStatistics(
      reqBody.headers.timezone,
      reqBody.timeDuration as DateTimeUnit
    );
    return notificationsPerDay;
  }

  async delete({}: HttpContext) {
    const vibrationData = await Vibration.query().delete();
    await MaintenanceNotification.query().delete();
    return vibrationData;
  }

  // ✅ NEW: CLEAR RESOLVED MAINTENANCE RECORDS BY PERIOD
  // ✅ NEW: CLEAR RESOLVED MAINTENANCE RECORDS BY PERIOD
async clearRecords({ request, response }: HttpContext) {
  try {
    const { period } = request.only(['period']);
    
    let daysToDelete = 1;
    if (period === '1week') daysToDelete = 7;
    if (period === '1month') daysToDelete = 30;
    
    const cutoffDate = DateTime.now().minus({ days: daysToDelete });
    
    // Find notifications to delete
    const notifications = await MaintenanceNotification.query()
      .where('shouldBeDisplayed', false)
      .where('resolvedAt', '<=', cutoffDate.toSQL());
    
    const notificationIds = notifications.map(n => n.id);
    
    if (notificationIds.length > 0) {
      // 1. Null out references in vibrations table to satisfy RESTRICT constraint
      await Vibration.query()
        .whereIn('maintenance_notification_id', notificationIds)
        .update({ maintenanceNotificationId: null });
      
      // 2. Delete the notifications
      await MaintenanceNotification.query()
        .whereIn('id', notificationIds)
        .delete();
    }
    
    const result = notificationIds.length;
    
    return response.ok({ 
      success: true, 
      deleted: result,
      message: `Deleted ${result} maintenance records from last ${period}`
    });
  } catch (error) {
    return response.internalServerError({ 
      error: error.message,
      message: 'Failed to clear records'
    });
  }
}
}