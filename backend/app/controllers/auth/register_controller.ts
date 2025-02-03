import User from "#models/user";
import { createUserValidator } from "#validators/auth";
import type { HttpContext } from "@adonisjs/core/http";

export default class RegisterController {
  /**
   * Handle user registration
   */
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createUserValidator);
    const user = await User.create(data);
    console.log(user.$isPersisted);
    await auth.use("web").login(user);
    return user.serialize();
  }
}
