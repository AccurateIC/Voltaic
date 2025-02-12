import { createArchiveValidator, getArchiveDataBetweenValidator } from "#validators/archive";
import Archive from "#models/archive";
import GensetProperty from "#models/genset_property";
import type { HttpContext } from "@adonisjs/core/http";

export default class ArchiveController {
  async getAll({}: HttpContext) {
    const archiveData = await Archive.query().preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async getBetween({ request }: HttpContext) {
    // console.log(request.qs());
    const queryParams = request.qs();
    console.log(queryParams);
    const data = await getArchiveDataBetweenValidator.validate(queryParams);
    console.log("Data", data);
    // const data = await request.qs().validateUsing(getArchiveDataBetweenValidator);
    const archiveData = await Archive.query()
      .whereBetween("timestamp", [data.from, data.to])
      .preload("gensetProperty", (query) => query.preload("physicalQuantity"));
    return archiveData;
  }

  async create({ request }: HttpContext) {
    const payload = await request.validateUsing(createArchiveValidator);
    const timestamp = payload.timestamp;
    const data = payload.data;
    console.log(`Time: ${timestamp}`);
    const archiveData = [];

    // apparently normal for loop is considered "bug-prone" xD
    // see: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-for-loop.md
    for (const [index, element] of data.entries()) {
      console.log(index, element);
      const gensetProperty = await GensetProperty.findByOrFail("propertyName", `${element.property}`);
      // TODO: create notification here based on the `is_anomaly` field & save them to notifications table
      archiveData.push({
        timestamp: timestamp,
        gensetPropertyId: gensetProperty.id,
        propertyValue: element.value,
        isAnomaly: element.is_anomaly,
      });
    }
    await Archive.createMany(archiveData);

    return data;
  }

  async delete({ response }: HttpContext) {
    response.status(400).send({ message: "Not Implemented" });
  }
}
