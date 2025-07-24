import { BaseSeeder } from "@adonisjs/lucid/seeders";
import SensorProperty from "#models/sensor_property";

export default class extends BaseSeeder {
  async run() {
    await SensorProperty.createMany([
      { propertyName: "vibration_acceleration_x", unit: "g" },
      { propertyName: "vibration_acceleration_y", unit: "g" },
      { propertyName: "vibration_acceleration_z", unit: "g" },
    ]);
  }
}

