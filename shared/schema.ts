import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // admin, student, verifier
  isApproved: boolean("is_approved").default(false),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: serial("student_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  rollNumber: varchar("roll_number", { length: 50 }).notNull(),
  branch: varchar("branch", { length: 100 }),
  university: varchar("university", { length: 255 }),
  joiningYear: serial("joining_year"),
  passingYear: serial("passing_year"),
  ipfsCid: text("ipfs_cid"),
  imageUrl: text("image_url"),
  txHash: text("tx_hash"),
  blockNumber: serial("block_number"),        // Blockchain block number - unique identifier
  blockHash: text("block_hash"),              // Block hash for verification
  previousHash: text("previous_hash"),        // Previous block hash for chain verification
  qrCode: varchar("qr_code", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verifierUnlocks = pgTable("verifier_unlocks", {
  id: serial("id").primaryKey(),
  verifierId: serial("verifier_id").references(() => users.id),
  certificateId: serial("certificate_id").references(() => certificates.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Zod schemas for validation
import { z } from "zod";

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "student", "verifier"]),
  isApproved: z.boolean().default(false),
});

export const insertCertificateSchema = z.object({
  studentId: z.number().optional(),
  name: z.string(),
  rollNumber: z.string(),
  branch: z.string().optional(),
  university: z.string().optional(),
  joiningYear: z.number().optional(),
  passingYear: z.number().optional(),
  ipfsCid: z.string().optional(),
  imageUrl: z.string().optional(),
  txHash: z.string().optional(),
  blockNumber: z.number().optional(),
  blockHash: z.string().optional(),
  previousHash: z.string().optional(),
  qrCode: z.string().optional(),
});

export const insertVerifierUnlockSchema = z.object({
  verifierId: z.number(),
  certificateId: z.number(),
});

export type User = typeof users.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type VerifierUnlock = typeof verifierUnlocks.$inferSelect;
