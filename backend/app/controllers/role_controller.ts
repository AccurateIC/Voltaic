import Role from "#models/role";
import { createRoleValidator } from "#validators/role";
import type { HttpContext } from "@adonisjs/core/http";

export default class RoleController {
  async getAll({}: HttpContext) {
    const roles = await Role.all();
    return roles;
  }
  async create({ request }: HttpContext) {
    const data = await request.validateUsing(createRoleValidator);
    const role = new Role();
    role.roleName = data.roleName;
    await role.save();
    return role.serialize();
  }

  async update({ params, request }: HttpContext) {
    const role: Role = await Role.findOrFail(params.id);
    const data = await request.validateUsing(createRoleValidator);
    role.roleName = data.roleName; // updation
    await role.save();
    return role;
  }

  async delete({ params }: HttpContext) {
    const role: Role = await Role.findOrFail(params.id);
    await role.delete();
  }
}
