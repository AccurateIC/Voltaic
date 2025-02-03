import Role from "#models/role";
import { createRoleValidator } from "#validators/role";
import type { HttpContext } from "@adonisjs/core/http";

export default class CreateController {
  /**
   * Role Creation
   */
  async create({ request, response }: HttpContext) {
    const data = await request.validateUsing(createRoleValidator);
    const role = new Role();
    role.roleName = data.roleName;
    await role.save();
    return role.serialize();
  }
}
