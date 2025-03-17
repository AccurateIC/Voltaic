/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";
import transmit from "@adonisjs/transmit/services/main";

// Register Server-Sent Events (SSE) routes
transmit.registerRoutes();

// SSE Test Route
router.get("/sse", async () => {
  transmit.broadcast("global", { message: "hello" });
  return { hello: "world" };
});

// Root index route
router.get("/", async () => {
  return { message: "voltaic server is live!" };
});

router
  .group(() => {
    router.get("isAuthenticated", "#controllers/auth_controller.isAuthenticated");
    router.get("getActive", "#controllers/auth_controller.getActive");
    router.get("getAll", "#controllers/auth_controller.getAll");
    router.post("register", "#controllers/auth_controller.register");
    router.post("login", "#controllers/auth_controller.login");
    router.patch("update", "#controllers/auth_controller.update").use([middleware.auth()]);
    router.post("logout", "#controllers/auth_controller.logout").use([middleware.auth()]);
    router.patch("activate/:id", "#controllers/auth_controller.activate");
    router.patch("deactivate/:id", "#controllers/auth_controller.deactivate"); 
    router.delete("hardDelete/:id", "#controllers/auth_controller.destroy"); 
  })
  .prefix("auth");

router
  .group(() => {
    router.get("getAll", "#controllers/role_controller.getAll");
    router.post("create", "#controllers/role_controller.create");
    router.post("update", "#controllers/role_controller.update");
    router.delete("delete/:id", "#controllers/role_controller.delete").use([middleware.auth()]);
  })
  .prefix("role");

router
  .group(() => {
    router.get("getAll", "#controllers/physical_quantity_controller.getAll");
    router.post("create", "#controllers/physical_quantity_controller.create");
    router.patch("update/:id", "#controllers/physical_quantity_controller.update");
    router.delete("delete/:id", "#controllers/physical_quantity_controller.delete").use([middleware.auth()]);
  })
  .prefix("physicalQuantity");

router
  .group(() => {
    router.get("/getAll", "#controllers/genset_property_controller.getAll");
    router.post("/create", "#controllers/genset_property_controller.create");
    router.patch("/update/:id", "#controllers/genset_property_controller.update");
    router.delete("/delete/:id", "#controllers/genset_property_controller.delete").use([middleware.auth()]);
  })
  .prefix("property");

router
  .group(() => {
    router.get("getAll", "#controllers/archive_controller.getAll").use(middleware.auth());

    // Data ingestion route (ML processed data)
    router.post("create", "#controllers/archive_controller.create");

    // Preventing unauthorized data deletion is a good idea
    router.delete("delete/:id", "#controllers/archive_controller.delete").use([middleware.auth()]);

    // Get data between two timestamps
    router.get("getBetween", "#controllers/archive_controller.getBetween").use([middleware.auth()]);

    // Get latest telemetry data
    router.get("getLatest", "#controllers/archive_controller.getLatest").use([middleware.auth()]);

    // Pagination for large datasets
    router.post("getPaginated", "#controllers/archive_controller.getPaginated").use([middleware.auth()]);

    // Get property data between timestamps
    router.get("getPropertyDataBetween", "#controllers/archive_controller.getPropertyDataBetween").use([middleware.auth()]);
  })
  .prefix("archive");

  router
  .group(() => {
    router.get("getAll", "#controllers/notification_type_controller.getAll");
    router.post("create", "#controllers/notification_type_controller.create");
    router.patch("update/:id", "#controllers/notification_type_controller.update");
    router.delete("delete/:id", "#controllers/notification_type_controller.delete");
  })
  .prefix("notificationType");

  router
  .group(() => {
    router.get("getAll", "#controllers/notification_controller.getAll").use([middleware.auth()]);
    router.patch("read/:id", "#controllers/notification_controller.read").use([middleware.auth()]);
    router.get("create", "#controllers/notification_controller.create").use([middleware.auth()]);
    router.patch("update", "#controllers/notification_controller.update").use([middleware.auth()]);
  })
  .prefix("notification");

router
  .group(() => {
    router.post("create", "#controllers/pdm_controller.create");
  })
  .prefix("pdm");

router
  .group(() => {
    router.get("test", async () => {
      const rul = Math.random() * 10000;
      const predictedHealthIndex = Math.random();

      return { Remaining_Useful_Life: rul, Predicted_Health_Index: predictedHealthIndex };
    });
  })
  .prefix("rul");

