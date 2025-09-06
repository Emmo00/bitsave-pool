import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      allowedHosts: true,
      port: 3000,
      host: "0.0.0.0"
    },
    define: {
      // Make env variables available to the app
      'import.meta.env.VITE_USE_TESTNET': JSON.stringify(env.VITE_USE_TESTNET),
    },
  };
});
