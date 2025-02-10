import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3005,
        strictPort: true,
        host: true,
        origin: "http://0.0.0.0:3005",
    },
    preview: {
        host: "0.0.0.0",
        port: 3005,
        strictPort: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
