import { BaseSeeder } from "@adonisjs/lucid/seeders";
import PdmDataKind from "#models/pdm_data_kind";
import { randomUUID } from "node:crypto";

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await PdmDataKind.createMany([
      //
      { id: randomUUID(), kind: "actual" },
      { id: randomUUID(), kind: "forecasted" },
    ]);
  }
}
