import { BaseSeeder } from "@adonisjs/lucid/seeders";
import GensetProperty from "#models/genset_property";

export default class extends BaseSeeder {
  async run() {
    await GensetProperty.createMany([
      { propertyName: "engTemp", physicalQuantityId: 5 },
      { propertyName: "engOilTemp", physicalQuantityId: 5 },
      { propertyName: "engOilPress", physicalQuantityId: 4 },
      { propertyName: "engFuelLevel", physicalQuantityId: 6 },
      { propertyName: "engChargeAltVolts", physicalQuantityId: 1 },
      { propertyName: "engBatteryVolts", physicalQuantityId: 1 },
      { propertyName: "engSpeedDisplay", physicalQuantityId: 3 },
      { propertyName: "engFuelConsumption", physicalQuantityId: 6 },
      { propertyName: "engineFuelLevelUnits", physicalQuantityId: 6 },
      { propertyName: "genL1Current", physicalQuantityId: 2 },
      { propertyName: "genL2Current", physicalQuantityId: 2 },
      { propertyName: "genL3Current", physicalQuantityId: 2 },
      { propertyName: "genL1Volts", physicalQuantityId: 1 },
      { propertyName: "genL2Volts", physicalQuantityId: 1 },
      { propertyName: "genL3Volts", physicalQuantityId: 1 },
      { propertyName: "genL1L2Volts", physicalQuantityId: 1 },
      { propertyName: "genL2L3Volts", physicalQuantityId: 1 },
      { propertyName: "genL3L1Volts", physicalQuantityId: 1 },
    ]);
  }
}
