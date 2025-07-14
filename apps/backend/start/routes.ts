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

import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";

// index route
router.get("/", async () => {
  return { message: "neurogen server is live!" };
});

// swagger docs
router
  .group(() => {
    router.get("/yaml", async () => {
      return AutoSwagger.default.docs(router.toJSON(), swagger);
    });

    router.get("/json", async () => {
      return AutoSwagger.default.json(router.toJSON(), swagger);
    });

    router.get("/ui", async () => {
      return AutoSwagger.default.scalar("/docs/yaml");
    });
  })
  .prefix("docs");

// this is for sending server sent events to the frontend without having to use websockets
// see: https://en.wikipedia.org/wiki/Server-sent_events
transmit.registerRoutes();

router.get("/sse", async () => {
  transmit.broadcast("global", { message: "hello" });
  return { hello: "world" };
});

// auth
router
  .group(() => {
    router.get("/github/redirect", "#controllers/auth_controller.githubRedirect");
    router.get("/github/callback", "#controllers/auth_controller.githubCallback");
    router.get("/google/redirect", "#controllers/auth_controller.googleRedirect");
    router.get("/google/callback", "#controllers/auth_controller.googleCallback");

    router.get("getLoggedInUser", "#controllers/auth_controller.getLoggedInUser");
    router.get("getActive", "#controllers/auth_controller.getActive");
    router.get("getAll", "#controllers/auth_controller.getAll");
    router.post("register", "#controllers/auth_controller.register");
    router.post("login", "#controllers/auth_controller.login");
    router.patch("update", "#controllers/auth_controller.update").use([middleware.auth()]);
    router.post("logout", "#controllers/auth_controller.logout").use([middleware.auth()]);
    router.patch("activate/:id", "#controllers/auth_controller.activate");
    router.patch("deactivate/:id", "#controllers/auth_controller.deactivate"); // soft delete
    router.delete("hardDelete/:id", "#controllers/auth_controller.destroy"); // really really delete xD
  })
  .prefix("auth");

// role
router
  .group(() => {
    router.get("getAll", "#controllers/role_controller.getAll");
    router.post("create", "#controllers/role_controller.create");
    router.post("update", "#controllers/role_controller.update");
    router.delete("delete/:id", "#controllers/role_controller.delete").use([middleware.auth()]);
  })
  .prefix("role");

// physical quantities
router
  .group(() => {
    router.get("getAll", "#controllers/physical_quantity_controller.getAll");
    router.post("create", "#controllers/physical_quantity_controller.create");
    router.patch("update/:id", "#controllers/physical_quantity_controller.update");
    router.delete("delete/:id", "#controllers/physical_quantity_controller.delete").use([middleware.auth()]);
  })
  .prefix("physicalQuantity");

// properties
// for properties from the genset telemetry data
// for instance: engineSpeed, engineOilPressure, etc
router
  .group(() => {
    router.get("/getAll", "#controllers/genset_property_controller.getAll");
    router.post("/create", "#controllers/genset_property_controller.create");
    router.patch("/update/:id", "#controllers/genset_property_controller.update");
    router.delete("/delete/:id", "#controllers/genset_property_controller.delete").use([middleware.auth()]);
  })
  .prefix("property");

// archive
// this is the table where timestamped telemetry data from the genset will be stored
router
  .group(() => {
    router.get("getPropertyStatistics", "#controllers/archive_controller.getPropertyStatistics");
    router.get("getAll", "#controllers/archive_controller.getAll").use(middleware.auth());

    // TODO: maybe add bearer token authorization here so that not anyone can post data to this endpoint.
    //       if not added, this api endpoint can be overwhelmed by bad actors and crash the application (potentially)
    router.post("create", "#controllers/archive_controller.create"); // processed data from ML models ought to be posted here

    // probably not having an option to delete the telemetry data might be a good idea instead
    router.delete("delete/:id", "#controllers/archive_controller.delete").use([middleware.auth()]);

    // endpoint to get data between two timestamps
    router.get("getBetween", "#controllers/archive_controller.getBetween").use([middleware.auth()]);

    // get data coresponding to the latest timestamp entry
    router.get("getLatest", "#controllers/archive_controller.getLatest").use([middleware.auth()]);

    // Get property data between timestamps
    router
      .post("getPropertyDataBetween", "#controllers/archive_controller.getPropertyDataBetween")
      .use([middleware.auth()]);

    // TODO: maybe we need an api endpoint which returns paginated data
    router.post("getPaginated", "#controllers/archive_controller.getPaginated").use([middleware.auth()]);

    // delete all entries in the `archive` table
    router.delete("deleteAll", "#controllers/archive_controller.deleteAll").use([middleware.auth()]);

    router.get("/getAnomalyStatistics", "#controllers/archive_controller.getAnomalyStatistics");
  })
  .prefix("archive");
// i dont think it is necessary to provide APIs to edit a property row in telemetry data

// notificatons

// should notifications be generated on the backend?
// generating it on the frontend and then sending them over to the backend seems like a bad idea.
// when data is posted to the `create` endpoint under the `archive` group, we can generate notifications
// and then save them in the database. when the notification is generated and saved into the database,
// we can then generate a server side event and notify the frontend that notification has been generated

// notification type apis
router
  .group(() => {
    router.get("getAll", "#controllers/notification_type_controller.getAll");
    router.post("create", "#controllers/notification_type_controller.create");
    router.patch("update/:id", "#controllers/notification_type_controller.update");
    router.delete("delete/:id", "#controllers/notification_type_controller.delete");
  })
  .prefix("notificationType");

// notification apis
router
  .group(() => {
    router.get("getAll", "#controllers/notification_controller.getAll").use([middleware.auth()]);
    router.get("getResolved", "#controllers/notification_controller.getResolved").use([middleware.auth()]);
    router.get("getUnresolved", "#controllers/notification_controller.getUnresolved").use([middleware.auth()]);
    router.patch("read/:id", "#controllers/notification_controller.read").use([middleware.auth()]);

    router.get("create", "#controllers/notification_controller.create").use([middleware.auth()]);
    router.patch("update", "#controllers/notification_controller.update").use([middleware.auth()]);
  })
  .prefix("notification");

// PDM
router
  .group(() => {
    router.post("create", "#controllers/pdm_controller.create");

    router.get("getRecent", "#controllers/pdm_controller.getRecent");
    router.get("getLatestEntry", "#controllers/pdm_controller.getLatestEntry");
    router.get("getRecentActual", "#controllers/pdm_controller.getRecentActual");
    router.get("getRecentForecasted", "#controllers/pdm_controller.getRecentForecasted");

    router.get("notification/getResolved", "#controllers/pdm_controller.getResolved");
    router.get("notification/getAll", "#controllers/pdm_controller.getAllNotifications");
    router.get("notification/getUnresolved", "#controllers/pdm_controller.getUnresolved");
    router.get("notification/getLatestUnresolved", "#controllers/pdm_controller.getLatestUnresolvedNotification");
    router.patch("notification/read/:id", "#controllers/pdm_controller.markNotificationRead");
    router.post("notification/getStatistics", "#controllers/pdm_controller.getStatistics");

    router.delete("delete", "#controllers/pdm_controller.delete");
  })
  .prefix("pdm");

// Reports
router
  .group(() => {
    router.get("generateDummy", "#controllers/reports_controller.generateDummy");
  })
  .prefix("reports");
