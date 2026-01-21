
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export let db: any = null;

// Initialize database connection
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.log("ℹ️  DATABASE_URL not set - database will not be initialized");
    db = null;
    return null;
  }

  try {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    db = drizzle(pool, { schema });
    console.log("✓ Connected to PostgreSQL");
    return db;
  } catch (err) {
    console.error("✗ Failed to connect to PostgreSQL:", err);
    console.error("Proceeding with in-memory storage");
    db = null;
    return null;
  }
}

// Initialize on startup
initDb().catch(err => {
  console.error("Database initialization error:", err);
  db = null;
});
