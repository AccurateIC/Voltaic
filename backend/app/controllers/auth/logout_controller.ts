import type { HttpContext } from "@adonisjs/core/http";

export default class LogoutController {
  /**
   * Handle user signout
   */
  async store({ request, response, auth }: HttpContext) {
    await auth.use("web").logout();
  }
}
