import User from "#models/user";
import { loginValidator } from "#validators/auth";
import type { HttpContext } from "@adonisjs/core/http";

export default class LoginController {
  /**
   * Handle user login
   */
  async store({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);
    const user = await User.findByOrFail("email", email).where("is_active", true);
    console.log(user.isActive);
    if (user.isActive === 1) {
      await User.verifyCredentials(email, password);
      await auth.use("web").login(user);
    } else {
      throw new Error("test exception");
    }
  }
}
