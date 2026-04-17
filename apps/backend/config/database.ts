import { defineConfig } from "@adonisjs/lucid";
import env from "#start/env";

const dbConfig = defineConfig({
  connection: "postgres",
  connections: {
    postgres: {
      client: "pg",
      connection: {
        host: env.get("DB_HOST"),
        port: env.get("DB_PORT"),
        user: env.get("DB_USER"),
        password: env.get("DB_PASSWORD"),
        database: env.get("DB_DATABASE"),
      },
      migrations: { naturalSort: true, paths: ["database/migrations"] },
      pool: {
        min: env.get("DB_POOL_MIN", 2),
        max: env.get("DB_POOL_MAX", 20),
        acquireTimeoutMillis: env.get("DB_POOL_ACQUIRE_TIMEOUT_MS", 10000),
        idleTimeoutMillis: env.get("DB_POOL_IDLE_TIMEOUT_MS", 30000),
      },
    },
  },
});

export default dbConfig;
