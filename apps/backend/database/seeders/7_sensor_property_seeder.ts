import { BaseSeeder } from "@adonisjs/lucid/seeders";
import SensorProperty from "#models/sensor_property";
import { randomUUID } from "node:crypto";

export default class extends BaseSeeder {
  async run() {
    await SensorProperty.createMany([
      { id: randomUUID(), propertyName: "vibration_acceleration_x", unit: "g" },
      { id: randomUUID(), propertyName: "vibration_acceleration_y", unit: "g" },
      { id: randomUUID(), propertyName: "vibration_acceleration_z", unit: "g" },
    ]);
  }
}
