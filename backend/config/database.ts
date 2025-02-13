import app from "@adonisjs/core/services/app";
import { defineConfig } from "@adonisjs/lucid";

const dbConfig = defineConfig({
  connection: "sqlite",
  connections: {
    sqlite: {
      client: "better-sqlite3",
      connection: {
        filename: app.tmpPath("db.sqlite3"),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ["database/migrations"],
      },
      pool: {
        afterCreate: (conn, done) => {
          conn.pragma("journal_mode = WAL");
          done();
        },
      },
    },
  },
});

export default dbConfig;
