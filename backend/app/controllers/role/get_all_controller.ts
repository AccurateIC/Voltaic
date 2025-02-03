import Role from "#models/role";
import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";

export default class GetAllController {
  /**
   * Get all roles
   */
  async index({ request, response }: HttpContext) {
    const roles = await Role.all();
    return roles;
  }
}
