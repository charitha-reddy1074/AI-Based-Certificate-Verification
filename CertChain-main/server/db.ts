
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

import 'dotenv/config';
import { Pool } from 'pg';

// Use DATABASE_URL from env, default to localhost
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('🔌 Using DATABASE_URL from environment');
  console.log(`   Connection: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
} else {
  console.log('❌ DATABASE_URL not set in environment');
}

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://postgres:12345678@localhost:5432/CertChain_db',
  connectionTimeoutMillis: 10000,
});

export async function initDb() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL database connected successfully');
    return true;
  } catch (err) {
    console.warn('⚠️  Failed to connect to PostgreSQL:', (err as Error).message);
    console.warn('   Falling back to in-memory storage');
    return false;
  }
}

export const db = drizzle(pool, { schema });

export { pool };
console.log('PG connecting to 127.0.0.1:5432');
