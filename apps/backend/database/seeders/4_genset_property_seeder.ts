import { BaseSeeder } from "@adonisjs/lucid/seeders";
import GensetProperty from "#models/genset_property";

export default class extends BaseSeeder {
  async run() {
    await GensetProperty.createMany([
      { propertyName: "engTemp", physicalQuantityId: 5, readablePropertyName: "Engine Temperature" },
      { propertyName: "engOilTemp", physicalQuantityId: 5, readablePropertyName: "Engine Oil Temperature" },
      { propertyName: "engOilPress", physicalQuantityId: 4, readablePropertyName: "Engine Oil Pressure" },
      { propertyName: "engFuelLevel", physicalQuantityId: 6, readablePropertyName: "Engine Fuel Level" },
      {
        propertyName: "engChargeAltVolts",
        physicalQuantityId: 1,
        readablePropertyName: "Engine Charging Alternator Voltage",
      },
      { propertyName: "engBatteryVolts", physicalQuantityId: 1, readablePropertyName: "Engine Battery Voltage" },
      { propertyName: "engSpeedDisplay", physicalQuantityId: 3, readablePropertyName: "Engine Speed" },
      { propertyName: "engFuelConsumption", physicalQuantityId: 6, readablePropertyName: "Engine Fuel Consumption" },
      { propertyName: "engFuelLevelUnits", physicalQuantityId: 6, readablePropertyName: "Engine Fuel Level Units" },

      { propertyName: "genL1Current", physicalQuantityId: 2, readablePropertyName: "Generator Phase 1 Current" },
      { propertyName: "genL2Current", physicalQuantityId: 2, readablePropertyName: "Generator Phase 2 Current" },
      { propertyName: "genL3Current", physicalQuantityId: 2, readablePropertyName: "Generator Phase 3 Current" },
      { propertyName: "genL1Volts", physicalQuantityId: 1, readablePropertyName: "Generator Phase 1 Voltage" },
      { propertyName: "genL2Volts", physicalQuantityId: 1, readablePropertyName: "Generator Phase 2 Voltage" },
      { propertyName: "genL3Volts", physicalQuantityId: 1, readablePropertyName: "Generator Phase 3 Voltage" },
      // { propertyName: "genL1L2Volts", physicalQuantityId: 1 },
      // { propertyName: "genL2L3Volts", physicalQuantityId: 1 },
      // { propertyName: "genL3L1Volts", physicalQuantityId: 1 },
      { propertyName: "genTotalVA", physicalQuantityId: 8, readablePropertyName: "Generator Power Output" },

      { propertyName: "mainsL1Current", physicalQuantityId: 2, readablePropertyName: "Mains Phase 1 Current" },
      { propertyName: "mainsL2Current", physicalQuantityId: 2, readablePropertyName: "Mains Phase 2 Current" },
      { propertyName: "mainsL3Current", physicalQuantityId: 2, readablePropertyName: "Mains Phase 3 Current" },
      { propertyName: "mainsL1Volts", physicalQuantityId: 1, readablePropertyName: "Mains Phase 1 Voltage" },
      { propertyName: "mainsL2Volts", physicalQuantityId: 1, readablePropertyName: "Mains Phase 2 Voltage" },
      { propertyName: "mainsL3Volts", physicalQuantityId: 1, readablePropertyName: "Mains Phase 3 Voltage" },
      // { propertyName: "mainsL1L2Volts", physicalQuantityId: 1 },
      // { propertyName: "mainsL2L3Volts", physicalQuantityId: 1 },
      // { propertyName: "mainsL3L1Volts", physicalQuantityId: 1 },
    ]);
  }
}
