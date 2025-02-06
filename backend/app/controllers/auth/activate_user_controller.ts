import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";

export default class ActivateUserController {
  /**
   * Activate an inactive user
   */
  async update({ params }: HttpContext) {
    console.log(params.id);
    const user = await User.findOrFail(params.id);
    if (user.isActive === true) {
      return user.serialize();
    } else {
      user.isActive = true;
      await user.save();
      return user.serialize();
    }
  }
}
