import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";
import { createUserValidator, loginValidator, updateUserProfileValidator } from "#validators/auth";

export default class AuthController {
  async getLoggedInUser({ auth }: HttpContext) {
    const user = await auth.authenticate();
    return user;
  }

  async getActive({}: HttpContext) {
    const users = await User.query().where("is_active", true);
    return users;
  }

  async getAll({}: HttpContext): Promise<User[]> {
    return await User.all();
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
    return user.serialize();
  }

  async googleRedirect({ ally }: HttpContext) {
    return ally.use("google").redirect();
  }
  async googleCallback({ ally, auth, response }: HttpContext) {
    const goog = ally.use("google");

    if (goog.accessDenied()) return "You have cancelled the login process";
    if (goog.stateMisMatch()) return "We are unable to verify the request. Please try again";
    if (goog.hasError()) return goog.getError();

    const googUser = await goog.user();
    console.log("GOOGLE", googUser);

    // save user data to database and
    // navigate to login page

    let user;

    // see if user already exists in database
    const existingUser: User | null = await User.findBy("email", googUser.email);

    if (existingUser !== null) {
      await auth.use("web").login(existingUser);
    } else {
      const userData = await createUserValidator.validate({
        email: googUser.email,
        password: "12345",
        firstName: googUser.name?.split(" ")[0],
        roleId: 1,
        isActive: 1,
      });
      user = await User.create(userData);
      await auth.use("web").login(user);
    }
    return response.redirect("http://localhost:5173/engine");
  }

  async githubRedirect({ ally }: HttpContext) {
    return ally.use("github").redirect();
  }

  async githubCallback({ ally, auth, response }: HttpContext) {
    const gh = ally.use("github");

    if (gh.accessDenied()) return "You have cancelled the login process";
    if (gh.stateMisMatch()) return "We are unable to verify the request. Please try again";
    if (gh.hasError()) return gh.getError();

    const githubUser = await gh.user();
    console.log("GITHUB", githubUser);

    // save user data to database and
    // navigate to login page

    let user;

    // see if user already exists in database
    const existingUser: User | null = await User.findBy("email", githubUser.email);

    if (existingUser !== null) {
      await auth.use("web").login(existingUser);
    } else {
      const userData = await createUserValidator.validate({
        email: githubUser.email,
        password: "12345",
        firstName: githubUser.name?.split(" ")[0],
        roleId: 1,
        isActive: 1,
      });
      user = await User.create(userData);
      await auth.use("web").login(user);
    }
    return response.redirect("http://localhost:5173/engine");
  }

  async update({ request, auth }: HttpContext) {
    const data = await request.validateUsing(updateUserProfileValidator);
    // console.log("Original User Data:", params);
    const loggedInUser = await auth.authenticate();
    // const user = await User.query().where("email", params.email).where("is_active", true).firstOrFail();
    // const user = await User.findByOrFail(params.id);
    const user = await User.findOrFail(loggedInUser.id);

    if (data.email) user.email = data.email;
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;

    await user.save();
    return user.serialize();
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
