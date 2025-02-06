import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";

export default class DeleteUserController {
  /**
   * Soft delete record
   */
  async delete({ params }: HttpContext) {
    const user = await User.findOrFail(params.id);
    // set user to inactive so they will not be fetched in the list of active users
    user.isActive = false;
    await user.save();
    return user.serialize();
  }

  /**
   * Hard delete record
   */
  async destroy({ params }: HttpContext) {
    const user = await User.findOrFail(params.id);
    await user.delete();
  }
}
