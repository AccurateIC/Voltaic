import { BaseSeeder } from "@adonisjs/lucid/seeders";
import PhysicalQuantity from "#models/physical_quantity";

export default class extends BaseSeeder {
  async run() {
    await PhysicalQuantity.createMany([
      { quantityName: "voltage", unitName: "volt", unitSymbol: "V" }, // 1
      { quantityName: "current", unitName: "ampere", unitSymbol: "A" }, // 2
      { quantityName: "rotational-speed", unitName: "rpm", unitSymbol: "rpm" }, // 3
      { quantityName: "pressure", unitName: "bar", unitSymbol: "bar" }, // 4
      { quantityName: "temperature", unitName: "celsius", unitSymbol: "°C" }, // 5
      { quantityName: "volume", unitName: "litre", unitSymbol: "L" }, // 6
      { quantityName: "power", unitName: "watt", unitSymbol: "W" }, // 7
    ]);
  }
}
