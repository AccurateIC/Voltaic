import Role from "#models/role";
import type { HttpContext } from "@adonisjs/core/http";

export default class DeleteController {
  async destroy({ params }: HttpContext) {
    const role = await Role.findOrFail(params.id);
    await role.delete();
  }
}
