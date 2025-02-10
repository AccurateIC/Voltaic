import PhysicalQuantity from "#models/physical_quantity";
import type { HttpContext } from "@adonisjs/core/http";

export default class PhysicalQuantityController {
  async getAll({}: HttpContext) {
    const physical_quantities: PhysicalQuantity[] = await PhysicalQuantity.all();
    return physical_quantities;
  }

  async create({ request, response }: HttpContext) {
    const data = await request.validateUsing();
  }
}
