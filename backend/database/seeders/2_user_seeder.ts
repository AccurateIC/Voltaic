import { BaseSeeder } from "@adonisjs/lucid/seeders";
import User from "#models/user";

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        firstName: "Admin",
        lastName: "",
        email: "admin@accurateic.in",
        password: "12345",
        roleId: 2,
        isActive: true,
      },
      {
        firstName: "Swarnim",
        lastName: "Barapatre",
        email: "swarnim@accurateic.in",
        password: "12345",
        roleId: 1,
        isActive: true,
      },
      {
        firstName: "Inactive",
        lastName: "User",
        email: "inactive_user@accurateic.in",
        password: "12345",
        roleId: 1,
        isActive: true,
      },
      {
        firstName: "Inactive",
        lastName: "Admin",
        email: "inactive_admin@accurateic.in",
        password: "12345",
        roleId: 2,
        isActive: true,
      },
    ]);
  }
}
