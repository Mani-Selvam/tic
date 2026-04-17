import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@assets": path.resolve(__dirname, "attached_assets"),
        },
    },

    server: {
        port: 5000,
        host: "0.0.0.0",
        allowedHosts: true,
        watch: {
            ignored: ["**/.local/**"],
        },
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
            "/uploads": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },

    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
