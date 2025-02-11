import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";
import { createUserValidator, loginValidator } from "#validators/auth";

export default class AuthController {
  async isAuthenticated({ auth }: HttpContext) {
    const user = await auth.authenticate();
    return user;
  }

  async getActive({}: HttpContext) {
    const users = await User.query().where("is_active", true);
    return users;
  }

  async getAll({}: HttpContext) {
    const users = await User.all();
    return users;
  }

  async register({ request, auth }: HttpContext) {
    const data = await request.validateUsing(createUserValidator);
    const user = await User.create(data);
    console.log(user.$isPersisted);
    await auth.use("web").login(user);
    return user.serialize();
  }

  async login({ request, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);
    const user = await User.query().where("email", email).where("is_active", true).firstOrFail();
    await User.verifyCredentials(email, password);
    await auth.use("web").login(user);
  }

  async logout({ auth }: HttpContext) {
    await auth.use("web").logout();
  }

  async activate({ params }: HttpContext) {
    const user = await User.findOrFail(params.id);
    // set user to inactive so they will not be fetched in the list of active users
    user.isActive = true;
    await user.save();
    return user.serialize();
  }

  async deactivate({ params }: HttpContext) {
    const user = await User.findOrFail(params.id);
    // set user to inactive so they will not be fetched in the list of active users
    user.isActive = false;
    await user.save();
    return user.serialize();
  }

  async destroy({ params }: HttpContext) {
    const user = await User.findOrFail(params.id);
    await user.delete();
  }
}
