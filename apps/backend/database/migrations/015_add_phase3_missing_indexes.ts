import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  async up() {
    // Add missing indexes to archives table
    this.schema.alterTable("archives", (table) => {
      table.index(["genset_property_id"], "idx_archives_property_id");
      table.index(["is_anomaly"], "idx_archives_is_anomaly");
      table.index(
        ["timestamp", "genset_property_id"],
        "idx_archives_ts_property"
      );
      table.index(
        ["is_anomaly", "genset_property_id"],
        "idx_archives_anomaly_property"
      );
    });

    // Add missing indexes to vibrations table
    this.schema.alterTable("vibrations", (table) => {
      table.index(["pdm_data_kind_id"], "idx_vibrations_data_kind");
    });

    // Add missing indexes to notifications table
    this.schema.alterTable("notifications", (table) => {
      table.index(["finished_at"], "idx_notifications_finished_at");
    });

    // Add missing indexes to maintenance_notifications table
    this.schema.alterTable("maintenance_notifications", (table) => {
      table.index(
        ["should_be_displayed", "timestamp"],
        "idx_maint_notif_displayed_ts"
      );
    });
  }

  async down() {
    this.schema.alterTable("maintenance_notifications", (table) => {
      table.dropIndex(
        ["should_be_displayed", "timestamp"],
        "idx_maint_notif_displayed_ts"
      );
    });

    this.schema.alterTable("notifications", (table) => {
      table.dropIndex(["finished_at"], "idx_notifications_finished_at");
    });

    this.schema.alterTable("vibrations", (table) => {
      table.dropIndex(["pdm_data_kind_id"], "idx_vibrations_data_kind");
    });

    this.schema.alterTable("archives", (table) => {
      table.dropIndex(
        ["is_anomaly", "genset_property_id"],
        "idx_archives_anomaly_property"
      );
      table.dropIndex(
        ["timestamp", "genset_property_id"],
        "idx_archives_ts_property"
      );
      table.dropIndex(["is_anomaly"], "idx_archives_is_anomaly");
      table.dropIndex(["genset_property_id"], "idx_archives_property_id");
    });
  }
}
