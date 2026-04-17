import { BaseSeeder } from "@adonisjs/lucid/seeders";
import User from "#models/user";
import Role from "#models/role";

export default class extends BaseSeeder {
  async run() {
    // fetch UUIDs for required role to create users
    const userRole = await Role.findByOrFail("roleName", "user");
    const adminRole = await Role.findByOrFail("roleName", "admin");

    await User.createMany([
      {
        firstName: "Admin",
        lastName: "",
        email: "admin@accurateic.in",
        password: "12345",
        roleId: adminRole.id,
        isActive: true,
      },
      {
        firstName: "Swarnim",
        lastName: "Barapatre",
        email: "swarnim@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Yash",
        lastName: "Khairnar",
        email: "yash@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Dhananjay",
        lastName: "Pawal",
        email: "dhananjay@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Yashodeep",
        lastName: "Bhirud",
        email: "yashodeep@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Priyanshu",
        lastName: "Kamble",
        email: "priyanshu@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Inactive",
        lastName: "User",
        email: "inactive_user@accurateic.in",
        password: "12345",
        roleId: userRole.id,
        isActive: true,
      },
      {
        firstName: "Inactive",
        lastName: "Admin",
        email: "inactive_admin@accurateic.in",
        password: "12345",
        roleId: adminRole.id,
        isActive: false,
      },
    ]);
  }
}
