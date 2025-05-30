"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");

// Load environment variables
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());

module.exports = (0, utils_1.defineConfig)({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret"
    }
  },
  modules: {
    // Use string paths for module resolution
    "stock-location": {
      resolve: "@medusajs/stock-location",
      options: {
        clientUrl: process.env.DATABASE_URL,
      },
    },
    "fulfillment": {
      resolve: "@medusajs/fulfillment",
      options: {
        clientUrl: process.env.DATABASE_URL,
      },
    },
  },
});
