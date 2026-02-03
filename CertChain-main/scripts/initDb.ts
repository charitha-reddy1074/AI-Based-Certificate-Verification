import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../shared/schema";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL || "mongodb+srv://charithareddy1074_db_user:12345678ch@cluster0.hgi5pa6.mongodb.net/certchain_db?retryWrites=true&w=majority";

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("Connecting to database...");
    const db = drizzle(pool, { schema });

    // Test connection
    await pool.query("SELECT 1");
    console.log("Connected to PostgreSQL");

    // Create tables using raw SQL (Drizzle ORM schema)
    console.log("Creating database tables...");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'student',
        is_approved BOOLEAN DEFAULT false,
        full_name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100),
        university_email VARCHAR(255),
        joined_year INTEGER,
        leaving_year INTEGER,
        school VARCHAR(255),
        branch VARCHAR(100),
        face_descriptors JSONB,
        company VARCHAR(255),
        position VARCHAR(255),
        company_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created users table");

    // Create certificates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) NOT NULL UNIQUE,
        passing_year INTEGER,
        joining_year INTEGER,
        branch VARCHAR(100),
        university VARCHAR(255),
        qr_code TEXT,
        image_url VARCHAR(500),
        tx_hash VARCHAR(255),
        block_hash VARCHAR(255),
        previous_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created certificates table");

    // Create verifier_unlocks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verifier_unlocks (
        id SERIAL PRIMARY KEY,
        verifier_id INTEGER NOT NULL REFERENCES users(id),
        certificate_id INTEGER NOT NULL REFERENCES certificates(id),
        paid_amount INTEGER DEFAULT 10,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created verifier_unlocks table");

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_certificates_roll_number ON certificates(roll_number);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_verifier_unlocks_verifier_id ON verifier_unlocks(verifier_id);`);
    
    console.log("Created indexes");
    console.log("Database initialization complete!");

  } catch (error: any) {
    if (error.code === "42P07" || error.message?.includes("already exists")) {
      console.log("Tables already exist - skipping creation");
    } else {
      console.error("Database initialization failed:", error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log("Database ready!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
