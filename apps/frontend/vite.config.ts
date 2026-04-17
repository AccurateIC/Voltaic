import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router"],
                    query: ["@tanstack/react-query"],
                    charts: ["chart.js", "react-chartjs-2", "chartjs-adapter-luxon"],
                    datetime: ["luxon"],
                },
            },
        },
    },
});
