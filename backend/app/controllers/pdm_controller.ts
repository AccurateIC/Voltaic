import type { HttpContext } from "@adonisjs/core/http";
import { createPdmValidator } from "#validators/pdm";
import transmit from "@adonisjs/transmit/services/main";
import MaintenanceNotification from "#models/maintenance_notification";
import Vibration from "#models/vibration";
import PdmDataKind from "#models/pdm_data_kind";
import SensorProperty from "#models/sensor_property";
import { DateTime } from "luxon";

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

  async getAllUnreadNotifications({}: HttpContext) {
    const pdmNotifications = await MaintenanceNotification.query().where("shouldBeDisplayed", true);
    return pdmNotifications;
  }

  async getLatestUnresolvedNotification({}: HttpContext) {
    const latestPdmNotification = await MaintenanceNotification.query()
      .where("shouldBeDisplayed", true)
      .orderBy("timestamp")
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
      .limit(60 * 25);

    return pdmVibrationData;
  }

  async getRecentForecasted({}: HttpContext) {
    const pdmVibrationData = await Vibration.query()
      .preload("sensorProperty")
      .preload("pdmDataKind")
      .whereHas("pdmDataKind", (kindQuery) => {
        kindQuery.where("kind", "forecasted");
      })
      .orderBy("timestamp", "desc")
      .limit(60 * 25);
    return pdmVibrationData;
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
    if (data) {
      transmit.broadcast("pdm", data);
    }

    // 1: if maintenance is needed, add to maintenance_notifications table
    let maintenance_notif_id = undefined;
    if (data.maintenance_needed === true) {
      const maintenance_notif = new MaintenanceNotification();
      maintenance_notif.timestamp = data.actual_values_timestamp[0];
      maintenance_notif.maintenanceReason = data.maintenance_reason;
      maintenance_notif.shouldBeDisplayed = true;
      await maintenance_notif.save();
      maintenance_notif_id = maintenance_notif.id;
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
        timestamp: data.actual_values_timestamp[i],
        sensor_property_id: sensorPropsMap.get("vibration_acceleration_x"),
        value: data.actual_values.accel_x[i],
        maintenance_notification_id: maintenance_notif_id || null,
        pdm_data_kind_id: actualKind!.id,
      });

      // Y axis (optional)
      if (data.actual_values.accel_y && data.actual_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: data.actual_values_timestamp[i],
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.actual_values.accel_y[i],
          maintenance_notification_id: maintenance_notif_id || null,
          pdm_data_kind_id: actualKind!.id,
        });
      }

      // Z axis (optional)
      if (data.actual_values.accel_z && data.actual_values.accel_z[i] !== undefined) {
        vibrationRecords.push({
          timestamp: data.actual_values_timestamp[i],
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_z"),
          value: data.actual_values.accel_z[i],
          maintenance_notification_id: maintenance_notif_id || null,
          pdm_data_kind_id: actualKind!.id,
        });
      }
    }

    // Process forecasted values
    for (let i = 0; i < data.forecasted_values_timestamp.length; i++) {
      // X axis (required)
      vibrationRecords.push({
        timestamp: data.forecasted_values_timestamp[i],
        sensor_property_id: sensorPropsMap.get("vibration_acceleration_x"),
        value: data.forecasted_values.accel_x[i],
        maintenance_notification_id: maintenance_notif_id || null,
        pdm_data_kind_id: forecastedKind!.id,
      });

      // Y axis (optional)
      if (data.forecasted_values.accel_y && data.forecasted_values.accel_y[i] !== undefined) {
        vibrationRecords.push({
          timestamp: data.forecasted_values_timestamp[i],
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_y"),
          value: data.forecasted_values.accel_y[i],
          maintenance_notification_id: maintenance_notif_id || null,
          pdm_data_kind_id: forecastedKind!.id,
        });
      }

      // Z axis (optional)
      if (data.forecasted_values.accel_z && data.forecasted_values.accel_z[i] !== undefined) {
        vibrationRecords.push({
          timestamp: data.forecasted_values_timestamp[i],
          sensor_property_id: sensorPropsMap.get("vibration_acceleration_z"),
          value: data.forecasted_values.accel_z[i],
          maintenance_notification_id: maintenance_notif_id || null,
          pdm_data_kind_id: forecastedKind!.id,
        });
      }
    }

    // 5: Insert all vibration records
    await Vibration.createMany(vibrationRecords);

    return { success: true, recordsCreated: vibrationRecords.length };
  }
}
