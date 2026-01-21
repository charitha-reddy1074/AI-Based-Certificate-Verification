import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "student", "verifier"] }).notNull(),
  isApproved: boolean("is_approved").default(false),
  fullName: text("full_name").notNull(),
  rollNumber: text("roll_number"),
  universityEmail: text("university_email"),
  joinedYear: integer("joined_year"),
  leavingYear: integer("leaving_year"),
  school: text("school"),
  branch: text("branch"),
  faceDescriptors: jsonb("face_descriptors"),
  company: text("company"),
  position: text("position"),
  companyEmail: text("company_email"),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  name: text("name").notNull(),
  rollNumber: text("roll_number").notNull(),
  passingYear: integer("passing_year").notNull(),
  joiningYear: integer("joining_year").notNull(),
  branch: text("branch").notNull(),
  university: text("university").notNull(),
  qrCode: text("qr_code").notNull(),
  blockHash: text("block_hash"),
  previousHash: text("previous_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verifierUnlocks = pgTable("verifier_unlocks", {
  id: serial("id").primaryKey(),
  verifierId: integer("verifier_id").notNull(),
  certificateId: integer("certificate_id").notNull(),
  paidAmount: integer("paid_amount").default(10),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, isApproved: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, createdAt: true, blockHash: true, previousHash: true });

export type User = typeof users.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type VerifierUnlock = typeof verifierUnlocks.$inferSelect;
