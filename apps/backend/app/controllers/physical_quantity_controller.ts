import PhysicalQuantity from "#models/physical_quantity";
import type { HttpContext } from "@adonisjs/core/http";
import { createPhysicalQuantityValidator, updatePhysicalQuantityValidator } from "#validators/physical_quantity";

export default class PhysicalQuantityController {
  async getAll({}: HttpContext) {
    const physicalQuantities: PhysicalQuantity[] = await PhysicalQuantity.all();
    return physicalQuantities;
  }

  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createPhysicalQuantityValidator);
    const physicalQty: PhysicalQuantity = new PhysicalQuantity();
    physicalQty.quantityName = data.quantityName;
    physicalQty.unitName = data.unitName;
    physicalQty.unitSymbol = data.unitSymbol;
    await physicalQty.save();
    return physicalQty;
  }

  async update({ params, request }: HttpContext) {
    const physicalQty: PhysicalQuantity = await PhysicalQuantity.findOrFail(params.id);
    const data = await request.validateUsing(updatePhysicalQuantityValidator);
    if (data.quantityName) physicalQty.quantityName = data.quantityName;
    if (data.unitName) physicalQty.unitName = data.unitName;
    if (data.unitSymbol) physicalQty.unitSymbol = data.unitSymbol;
    await physicalQty.save();
    return physicalQty;
  }

  async delete({ params }: HttpContext) {
    const phyQty: PhysicalQuantity = await PhysicalQuantity.findOrFail(params.id);
    await phyQty.delete();
    return;
  }
}
