import { BaseSeeder } from "@adonisjs/lucid/seeders";
import GensetProperty from "#models/genset_property";
import PhysicalQuantity from "#models/physical_quantity";

export default class extends BaseSeeder {
  async run() {
    const voltage = await PhysicalQuantity.findByOrFail("quantityName", "voltage"); // 1
    const current = await PhysicalQuantity.findByOrFail("quantityName", "current"); // 2
    const rotationalSpeed = await PhysicalQuantity.findByOrFail("quantityName", "rotational-speed"); // 3
    const pressure = await PhysicalQuantity.findByOrFail("quantityName", "pressure"); // 4
    const temperature = await PhysicalQuantity.findByOrFail("quantityName", "temperature"); // 5
    const volume = await PhysicalQuantity.findByOrFail("quantityName", "volume"); // 6
    // const power = await PhysicalQuantity.findByOrFail("quantityName", "power"); // 7
    const apparentPower = await PhysicalQuantity.findByOrFail("quantityName", "apparent-power"); // 8

    await GensetProperty.createMany([
      { propertyName: "engTemp", physicalQuantityId: temperature.id, readablePropertyName: "Engine Temperature" },
      {
        propertyName: "engOilTemp",
        physicalQuantityId: temperature.id,
        readablePropertyName: "Engine Oil Temperature",
      },
      { propertyName: "engOilPress", physicalQuantityId: pressure.id, readablePropertyName: "Engine Oil Pressure" },
      { propertyName: "engFuelLevel", physicalQuantityId: volume.id, readablePropertyName: "Engine Fuel Level" },
      {
        propertyName: "engChargeAltVolts",
        physicalQuantityId: voltage.id,
        readablePropertyName: "Engine Charging Alternator Voltage",
      },
      {
        propertyName: "engBatteryVolts",
        physicalQuantityId: voltage.id,
        readablePropertyName: "Engine Battery Voltage",
      },
      { propertyName: "engSpeedDisplay", physicalQuantityId: rotationalSpeed.id, readablePropertyName: "Engine Speed" },
      {
        propertyName: "engFuelConsumption",
        physicalQuantityId: volume.id,
        readablePropertyName: "Engine Fuel Consumption",
      },
      {
        propertyName: "engFuelLevelUnits",
        physicalQuantityId: volume.id,
        readablePropertyName: "Engine Fuel Level Units",
      },

      {
        propertyName: "genL1Current",
        physicalQuantityId: current.id,
        readablePropertyName: "Generator Phase 1 Current",
      },
      {
        propertyName: "genL2Current",
        physicalQuantityId: current.id,
        readablePropertyName: "Generator Phase 2 Current",
      },
      {
        propertyName: "genL3Current",
        physicalQuantityId: current.id,
        readablePropertyName: "Generator Phase 3 Current",
      },
      { propertyName: "genL1Volts", physicalQuantityId: voltage.id, readablePropertyName: "Generator Phase 1 Voltage" },
      { propertyName: "genL2Volts", physicalQuantityId: voltage.id, readablePropertyName: "Generator Phase 2 Voltage" },
      { propertyName: "genL3Volts", physicalQuantityId: voltage.id, readablePropertyName: "Generator Phase 3 Voltage" },
      {
        propertyName: "genTotalVA",
        physicalQuantityId: apparentPower.id,
        readablePropertyName: "Generator Power Output",
      },

      { propertyName: "mainsL1Current", physicalQuantityId: current.id, readablePropertyName: "Mains Phase 1 Current" },
      { propertyName: "mainsL2Current", physicalQuantityId: current.id, readablePropertyName: "Mains Phase 2 Current" },
      { propertyName: "mainsL3Current", physicalQuantityId: current.id, readablePropertyName: "Mains Phase 3 Current" },
      { propertyName: "mainsL1Volts", physicalQuantityId: voltage.id, readablePropertyName: "Mains Phase 1 Voltage" },
      { propertyName: "mainsL2Volts", physicalQuantityId: voltage.id, readablePropertyName: "Mains Phase 2 Voltage" },
      { propertyName: "mainsL3Volts", physicalQuantityId: voltage.id, readablePropertyName: "Mains Phase 3 Voltage" },
    ]);
  }
}
