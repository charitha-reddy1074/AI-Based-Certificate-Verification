
import { db } from "./db";
import { users, certificates, verifierUnlocks, type User, type Certificate, type VerifierUnlock, insertUserSchema, insertCertificateSchema } from "@shared/schema";
import type { z } from "zod";

type InsertUser = z.infer<typeof insertUserSchema>;
type InsertCertificate = z.infer<typeof insertCertificateSchema>;
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApproval(id: number, isApproved: boolean): Promise<User>;
  getPendingUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  createCertificate(cert: InsertCertificate): Promise<Certificate>;
  getCertificatesByStudentId(studentId: number): Promise<Certificate[]>;
  getCertificateByRollNumber(rollNumber: string): Promise<Certificate[]>;
  getCertificateById(id: number): Promise<Certificate | undefined>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  
  createUnlock(verifierId: number, certificateId: number): Promise<VerifierUnlock>;
  getUnlockedCertificates(verifierId: number): Promise<Certificate[]>;
  isCertificateUnlocked(verifierId: number, certificateId: number): Promise<boolean>;
}

// In-Memory Storage for Development (when DB is unavailable)
export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private certificates: Map<number, Certificate> = new Map();
  private unlocks: Map<number, VerifierUnlock> = new Map();
  private userIdCounter = 1;
  private certIdCounter = 1;
  private unlockIdCounter = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      ...insertUser,
      isApproved: insertUser.isApproved ?? false,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserApproval(id: number, isApproved: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, isApproved };
    this.users.set(id, updated);
    return updated;
  }

  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => !u.isApproved);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    const certificate: Certificate = {
      id: this.certIdCounter++,
      createdAt: new Date(),
      ...cert,
    };
    this.certificates.set(certificate.id, certificate);
    return certificate;
  }

  async getCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(c => c.studentId === studentId);
  }

  async getCertificateByRollNumber(rollNumber: string): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(c => c.rollNumber === rollNumber);
  }

  async getCertificateById(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createUnlock(verifierId: number, certificateId: number): Promise<VerifierUnlock> {
    const unlock: VerifierUnlock = {
      id: this.unlockIdCounter++,
      verifierId,
      certificateId,
      paidAmount: 10,
      unlockedAt: new Date(),
    };
    this.unlocks.set(unlock.id, unlock);
    return unlock;
  }

  async getUnlockedCertificates(verifierId: number): Promise<Certificate[]> {
    const unlockedIds = Array.from(this.unlocks.values())
      .filter(u => u.verifierId === verifierId)
      .map(u => u.certificateId);
    return Array.from(this.certificates.values()).filter(c => unlockedIds.includes(c.id));
  }

  async isCertificateUnlocked(verifierId: number, certificateId: number): Promise<boolean> {
    return Array.from(this.unlocks.values()).some(
      u => u.verifierId === verifierId && u.certificateId === certificateId
    );
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserApproval(id: number, isApproved: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({ isApproved })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.isApproved, false));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db.insert(certificates).values(cert).returning();
    return certificate;
  }

  async getCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.studentId, studentId));
  }

  async getCertificateByRollNumber(rollNumber: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.rollNumber, rollNumber));
  }

  async getCertificateById(id: number): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.id, id));
    return cert;
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.id, id));
    return cert;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return db.select().from(certificates);
  }

  async createUnlock(verifierId: number, certificateId: number): Promise<VerifierUnlock> {
    const [unlock] = await db.insert(verifierUnlocks).values({
      verifierId,
      certificateId,
      paidAmount: 10,
    }).returning();
    return unlock;
  }

  async getUnlockedCertificates(verifierId: number): Promise<Certificate[]> {
    const results = await db.select({
      certificate: certificates
    })
    .from(verifierUnlocks)
    .innerJoin(certificates, eq(verifierUnlocks.certificateId, certificates.id))
    .where(eq(verifierUnlocks.verifierId, verifierId));

    return results.map((r: { certificate: Certificate }) => r.certificate);
  }

  async isCertificateUnlocked(verifierId: number, certificateId: number): Promise<boolean> {
    const [unlock] = await db.select()
      .from(verifierUnlocks)
      .where(and(
        eq(verifierUnlocks.verifierId, verifierId),
        eq(verifierUnlocks.certificateId, certificateId)
      ));
    return !!unlock;
  }
}

// Initialize storage - use memory storage if DB is unavailable
export let storage: IStorage;

async function initStorage() {
  // Only use database if DATABASE_URL is set AND connection succeeded
  const useDatabase = process.env.DATABASE_URL && db;

  if (useDatabase) {
    console.log("✓ Using PostgreSQL storage");
    storage = new DatabaseStorage();
  } else {
    console.log("ℹ️  Using in-memory storage");
    if (!process.env.DATABASE_URL) {
      console.log("   → DATABASE_URL not configured");
    }
    if (!db) {
      console.log("   → Database connection failed");
    }
    storage = new MemoryStorage();
  }
}

initStorage().catch(err => {
  console.error("Failed to initialize storage:", err);
  console.log("Falling back to in-memory storage");
  storage = new MemoryStorage();
});
