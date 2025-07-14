import type { HttpContext } from "@adonisjs/core/http";
import { createPdmValidator, getPdmStatisticsValidator } from "#validators/pdm";
import transmit from "@adonisjs/transmit/services/main";
import MaintenanceNotification from "#models/maintenance_notification";
import Vibration from "#models/vibration";
import PdmDataKind from "#models/pdm_data_kind";
import SensorProperty from "#models/sensor_property";
import { DateTime, DateTimeUnit } from "luxon";
import { PdmService } from "#services/pdm_service";

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

  async getRecentActual({}: HttpContext) {
    const pdmVibrationData = await Vibration.query()
      .preload("sensorProperty")
      .preload("pdmDataKind")
      .whereHas("pdmDataKind", (kindQuery) => {
        kindQuery.where("kind", "actual");
      })
      .orderBy("timestamp", "desc")
      .limit(60 * 20);

    return pdmVibrationData;
  }

  async getRecentForecasted({}: HttpContext) {
    const pdmVibrationData = await Vibration.query()
      .preload("sensorProperty")
      .preload("pdmDataKind")
      .whereHas("pdmDataKind", (kindQuery) => {
        kindQuery.where("kind", "forecasted");
      })
      .preload("maintenanceNotification")
      .orderBy("timestamp", "desc")
      .limit(60 * 20);
    return pdmVibrationData;
  }

  async getLatestEntry({}: HttpContext) {
    const pdmVibrationEntry = await Vibration.query().orderBy("timestamp", "desc").limit(1);
    return pdmVibrationEntry;
  }

  async getRecent({}: HttpContext) {
    const pdmVibrationData = await Vibration.query()
      .preload("sensorProperty")
      .preload("pdmDataKind")
      .limit(60 * 60 * 2); // 1 hour
    return pdmVibrationData;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createPdmValidator);
    console.log(data);
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
        maintenanceNotificationId: maintenanceNotificationId || null,
        pdm_data_kind_id: actualKind!.id,
        confidence_score_percentage: data.confidence_score_percentage,
      });

      // Y axis (optional)
      if (data.actual_values.accel_y && data.actual_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.actual_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.actual_values.accel_y[i],
          maintenanceNotificationId: maintenanceNotificationId || null,
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
          maintenanceNotificationId: maintenanceNotificationId || null,
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
        maintenanceNotificationId: maintenanceNotificationId || null,
        pdm_data_kind_id: forecastedKind!.id,
        confidence_score_percentage: null,
      });

      // Y axis (optional)
      if (data.forecasted_values.accel_y && data.forecasted_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: DateTime.fromJSDate(data.forecasted_values_timestamp[i]),
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.forecasted_values.accel_y[i],
          maintenanceNotificationId: maintenanceNotificationId || null,
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
          maintenanceNotificationId: maintenanceNotificationId || null,
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
}
