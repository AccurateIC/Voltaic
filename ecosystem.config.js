// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "neurogen-backend",
      cwd: "./apps/backend/build",
      script: "./bin/server.js",
      instances: 4,
      exec_mode: "cluster",
      env_file: ".env",
      max_memory_restart: "1G",
      autorestart: true,
    },
    {
      name: "neurogen-frontend", //
      cwd: "./apps/frontend/dist",
      script: "serve",
      env_file: ".env",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PM2_SERVE_PATH: ".",
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
};
