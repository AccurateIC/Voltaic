import { createArchiveValidator } from "#validators/archive";
import Archive from "#models/archive";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";

export default class ArchiveController {
  async getAll({}: HttpContext) {
    const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createArchiveValidator);
    const timestamp = payload.timestamp;
    const data = payload.data;
    console.log(`Time: ${timestamp}`);
    const archiveData = [];
    for (let i = 0; i < data.length; ++i) {
      console.log(`    Property: ${data[i].property}`);
      const gensetProperty = await GensetProperty.findByOrFail("propertyName", `${data[i].property}`);
      console.log(`    Property ID: ${gensetProperty.id}`);
      console.log(`    Value: ${data[i].value}`);
      console.log(`    IsAnomaly: ${data[i].is_anomaly}\n`);
      archiveData.push({
        timestamp: timestamp,
        gensetPropertyId: gensetProperty.id,
        propertyValue: data[i].value,
        isAnomaly: data[i].is_anomaly,
      });
    }

    await Archive.createMany(archiveData);
    return data;
  }
}
