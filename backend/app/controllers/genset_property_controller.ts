import type { HttpContext } from "@adonisjs/core/http";
import GensetProperty from "#models/genset_property";
import { createGensetPropertyValidator, updateGensetPropertyValidator } from "#validators/genset_property";

export default class GensetPropertyController {
  async getAll({}: HttpContext) {
    const properties = GensetProperty.all();
    return properties;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createGensetPropertyValidator);
    await GensetProperty.create(data);
    return GensetProperty.findByOrFail("property_name", data.propertyName);
  }

  async update({ params, request }: HttpContext) {
    const data = await request.validateUsing(updateGensetPropertyValidator);
    const property = await GensetProperty.findOrFail(params.id);
    if (data.propertyName !== undefined) {
      property.propertyName = data.propertyName;
    }
    if (data.quantityId !== undefined) {
      property.quantityId = data.quantityId;
    }
    await property.save();
    return GensetProperty.findOrFail(params.id);
  }

  async delete({ params }: HttpContext) {
    const property = await GensetProperty.findOrFail(params.id);
    await property.delete();
  }
}
