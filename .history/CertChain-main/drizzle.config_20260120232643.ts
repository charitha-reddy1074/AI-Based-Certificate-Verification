import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";

import * as dotenv from "dotenv";

// Manually point to the .env file in the current directory
config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  // Log the current environment to see what is actually loaded
  console.log("Current Environment Variables:", process.env);
  throw new Error("DATABASE_URL is missing. Check your .env file location.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});