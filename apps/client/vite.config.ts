import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  // read the single root .env (only VITE_-prefixed vars reach the browser)
  envDir: "../..",
  server: { port: 3000 },
});
