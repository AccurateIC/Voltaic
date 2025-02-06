import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";

export default class GetAllController {
  async getAll({}: HttpContext) {
    const users = await User.query().where("is_active", true);
    return users;
  }
  async getAllActiveAndInactive({}: HttpContext) {
    const users = await User.all();
    return users;
  }
}
