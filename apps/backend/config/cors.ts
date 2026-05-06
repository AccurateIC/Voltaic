import { defineConfig } from "@adonisjs/cors";

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
origin: [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://192.168.10.242",
  "http://192.168.10.242:5173",
  "http://192.168.10.69:5173",
  "http://192.168.10.69:5174",
  "http://192.168.10.69",
  "http://192.168.10.128",
  "http://192.168.10.128:5173",
  "http://192.168.10.128:5174",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost",
  "https://voltaic.smarniw.com",
  "https://aiserver-desktop.tailaf2c38.ts.net/neurogen",
  "https://192.168.10.41/neurogen/",
  "https://192.168.10.41:5174",
  "https://aiserver-desktop.tailaf2c38.ts.net:5174",
  "https://neurogen.neubodhi.in",
  "https://neurogen.neubodhi.in:3334",
],
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
});

export default corsConfig;
