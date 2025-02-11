import { BaseSeeder } from "@adonisjs/lucid/seeders";
import GensetProperty from "#models/genset_property";

export default class extends BaseSeeder {
  async run() {
    await GensetProperty.createMany([
      { propertyName: "engTemp", quantityId: 5 },
      { propertyName: "engOilTemp", quantityId: 5 },
      { propertyName: "engOilPress", quantityId: 4 },
      { propertyName: "engFuelLevel", quantityId: 6 },
      { propertyName: "engChargeAltVolts", quantityId: 1 },
      { propertyName: "engBatteryVolts", quantityId: 1 },
      { propertyName: "engSpeedDisplay", quantityId: 3 },
      { propertyName: "engFuelConsumption", quantityId: 6 },
      { propertyName: "engineFuelLevelUnits", quantityId: 6 },
      { propertyName: "genL1Current", quantityId: 2 },
      { propertyName: "genL2Current", quantityId: 2 },
      { propertyName: "genL3Current", quantityId: 2 },
      { propertyName: "genL1Volts", quantityId: 1 },
      { propertyName: "genL2Volts", quantityId: 1 },
      { propertyName: "genL3Volts", quantityId: 1 },
      { propertyName: "genL1L2Volts", quantityId: 1 },
      { propertyName: "genL2L3Volts", quantityId: 1 },
      { propertyName: "genL3L1Volts", quantityId: 1 },
    ]);
  }
}
