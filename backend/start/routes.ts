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

// this is for sending server sent events to the frontend without having to use websockets
// see: https://en.wikipedia.org/wiki/Server-sent_events
transmit.registerRoutes();

router.get("/sse", async () => {
  transmit.broadcast("global", { message: "hello" });
  return { hello: "world" };
});

// index route
router.get("/", async () => {
  return { message: "voltaic server is live!" };
});

// auth
router
  .group(() => {
    router.get("isAuthenticated", "#controllers/auth_controller.isAuthenticated");
    router.get("getActive", "#controllers/auth_controller.getActive");
    router.get("getAll", "#controllers/auth_controller.getAll");
    router.post("register", "#controllers/auth_controller.register");
    router.post("login", "#controllers/auth_controller.login");
    router.post("logout", "#controllers/auth_controller.logout").use([middleware.auth()]);
    router.patch("activate/:id", "#controllers/auth_controller.activate");
    router.patch("deactivate/:id", "#controllers/auth_controller.deactivate"); // soft delete
    router.delete("hardDelete/:id", "#controllers/auth_controller.destroy"); // really really delete xD
  })
  .prefix("auth");

// router.post("/add", "#controllers/additions_controller.add");

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
    router.get("getAll", "#controllers/archive_controller.getAll").use(middleware.auth());

    // TODO: maybe add bearer token authorization here so that not anyone can post data to this endpoint.
    //       if not added, this api endpoint can be overwhelmed by bad actors and crash the application (potentially)
    router.post("create", "#controllers/archive_controller.create"); // processed data from ML models ought to be posted here

    // probably not having an option to delete the telemetry data might be a good idea instead
    router.delete("delete/:id", "#controllers/archive_controller.delete").use([middleware.auth()]);

    // endpoint to get data between two timestamps
    // TODO: in future, add aggregation options: mean, median, max, min, etc.
    router.get("getDataBetween", "#controllers/archive_controller.getDataBetween").use([middleware.auth()]);

    // TODO: maybe we need an api endpoint which returns paginated data
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
    router.get("getAll", "#controllers/notification/get_all_controller.index").use([middleware.auth()]);
    router.patch("read", "#controllers/notification/read_controller.index").use([middleware.auth()]);

    router.get("create", "#controllers/notification/create_controller.create").use([middleware.auth()]);
    router.patch("update", "#controllers/notification/update_controller.update").use([middleware.auth()]);
  })
  .prefix("notification");
