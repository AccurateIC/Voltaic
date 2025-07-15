import { defineConfig } from "@adonisjs/cors";

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost", "capacitor://localhost", "ionic://localhost"],
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
});

export default corsConfig;
