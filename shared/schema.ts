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
  rollNumber: varchar("roll_number", { length: 50 }).unique().notNull(),
  ipfsCid: text("ipfs_cid").notNull(),       // The link to the file on IPFS
  imageUrl: text("image_url"),               // IPFS URL for the certificate image
  txHash: text("tx_hash"),                   // The Ethereum transaction hash
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
  studentId: z.number(),
  rollNumber: z.string(),
  ipfsCid: z.string(),
  imageUrl: z.string().optional(),
  txHash: z.string().optional(),
});

export const insertVerifierUnlockSchema = z.object({
  verifierId: z.number(),
  certificateId: z.number(),
});

export type User = typeof users.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type VerifierUnlock = typeof verifierUnlocks.$inferSelect;
