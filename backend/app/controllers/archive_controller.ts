import vine from "@vinejs/vine";
import Archive from "#models/archive";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";

const archiveRowSchema = vine.object({
  property: vine.string().exists({ table: "genset_properties", column: "property_name" }),
  value: vine.number(),
  is_anomaly: vine.boolean(),
});

const archiveSchema = vine.object({
  timestamp: vine.date({ formats: ["iso8601"] }),
  data: vine.array(archiveRowSchema).minLength(1),
});

const archiveValidator = vine.compile(archiveSchema);

export default class ArchiveController {
  async getAll({}: HttpContext) {
    const archiveData = await Archive.all();
    return archiveData;
  }

  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(archiveValidator);
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
        propertyId: gensetProperty.id,
        propertyValue: data[i].value,
        isAnomaly: data[i].is_anomaly,
      });
    }

    await Archive.createMany(archiveData);
    return data;
  }
}
