import { BaseSeeder } from "@adonisjs/lucid/seeders";
import PhysicalQuantity from "#models/physical_quantity";
import { randomUUID } from "node:crypto";

export default class extends BaseSeeder {
  async run() {
    await PhysicalQuantity.createMany([
      { id: randomUUID(), quantityName: "voltage", unitName: "volt", unitSymbol: "V" }, // 1
      { id: randomUUID(), quantityName: "current", unitName: "ampere", unitSymbol: "A" }, // 2
      { id: randomUUID(), quantityName: "rotational-speed", unitName: "rpm", unitSymbol: "rpm" }, // 3
      { id: randomUUID(), quantityName: "pressure", unitName: "bar", unitSymbol: "bar" }, // 4
      { id: randomUUID(), quantityName: "temperature", unitName: "celsius", unitSymbol: "°C" }, // 5
      { id: randomUUID(), quantityName: "volume", unitName: "litre", unitSymbol: "L" }, // 6
      { id: randomUUID(), quantityName: "power", unitName: "watt", unitSymbol: "W" }, // 7
      { id: randomUUID(), quantityName: "apparent-power", unitName: "kilovolt-amperes", unitSymbol: "kVA" }, // 8
    ]);
  }
}
