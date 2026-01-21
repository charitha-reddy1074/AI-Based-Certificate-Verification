
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: '127.0.0.1',          // 🔥 NOT localhost
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'CertChain_db',
  ssl: false,                 // 🔥 REQUIRED on Windows
  connectionTimeoutMillis: 5000,
});

export async function initDb() {
  try {
    await pool.query('SELECT 1');
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Failed to connect to PostgreSQL:', err);
    throw err;
  }
}

export { pool };
