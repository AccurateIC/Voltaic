import { BaseSeeder } from "@adonisjs/lucid/seeders";
import PdmDataKind from "#models/pdm_data_kind";

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await PdmDataKind.createMany([
      //
      { kind: "actual" },
      { kind: "forecasted" },
    ]);
  }
}

