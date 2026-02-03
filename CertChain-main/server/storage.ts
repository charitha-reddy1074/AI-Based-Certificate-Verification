
import { db, initDb } from "./db";
import { users, certificates, verifierUnlocks, type User, type Certificate, type VerifierUnlock, insertUserSchema, insertCertificateSchema } from "@shared/schema";
import type { z } from "zod";

type InsertUser = z.infer<typeof insertUserSchema>;
type InsertCertificate = z.infer<typeof insertCertificateSchema>;
import { eq, and } from "drizzle-orm";
import mongoose from 'mongoose';

// ========== MONGODB SCHEMAS ==========
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student', 'verifier'], required: true },
  isApproved: { type: Boolean, default: false },
  fullName: { type: String, required: true },
  rollNumber: String,
  universityEmail: String,
  joinedYear: Number,
  leavingYear: Number,
  school: String,
  branch: String,
  faceDescriptors: mongoose.Schema.Types.Mixed,
  faceImage: String, // Store face image (base64 dataURL) for Rekognition verification
  company: String,
  position: String,
  companyEmail: String,
  createdAt: { type: Date, default: Date.now },
});

const certificateSchema = new mongoose.Schema({
  studentId: { type: Number, required: true },
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  passingYear: { type: Number, required: true },
  joiningYear: { type: Number, required: true },
  branch: { type: String, required: true },
  university: { type: String, required: true },
  qrCode: { type: String, required: true },
  imageUrl: String,
  txHash: String,
  blockHash: String,
  previousHash: String,
  createdAt: { type: Date, default: Date.now },
});

const unlockSchema = new mongoose.Schema({
  verifierId: { type: String, required: true },
  certificateId: { type: String, required: true },
  paidAmount: { type: Number, default: 10 },
  unlockedAt: { type: Date, default: Date.now },
});

const activityLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['signup', 'approval', 'certificate_issued', 'verification'], required: true },
  userId: mongoose.Schema.Types.Mixed,
  userName: String,
  userEmail: String,
  userRole: String,
  description: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const paymentLogSchema = new mongoose.Schema({
  verifierId: mongoose.Schema.Types.Mixed,
  verifierName: String,
  verifierEmail: String,
  certificateId: mongoose.Schema.Types.Mixed,
  certificateName: String,
  studentId: mongoose.Schema.Types.Mixed,
  studentName: String,
  studentRollNumber: String,
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const accessLogSchema = new mongoose.Schema({
  verifierId: mongoose.Schema.Types.Mixed,
  verifierName: String,
  verifierEmail: String,
  certificateId: mongoose.Schema.Types.Mixed,
  studentId: mongoose.Schema.Types.Mixed,
  studentName: String,
  studentEmail: String,
  action: { type: String, default: 'viewed' },
  accessTime: { type: Date, default: Date.now },
  ipAddress: String,
});

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const CertificateModel = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
export const UnlockModel = mongoose.models.Unlock || mongoose.model('Unlock', unlockSchema);
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export const PaymentLogModel = mongoose.models.PaymentLog || mongoose.model('PaymentLog', paymentLogSchema);
export const AccessLogModel = mongoose.models.AccessLog || mongoose.model('AccessLog', accessLogSchema);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(email: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserApproval(id: string, isApproved: boolean): Promise<User>;
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
      email: insertUser.email,
      password: insertUser.password,
      role: insertUser.role,
      isApproved: insertUser.isApproved ?? false,
      fullName: insertUser.fullName,
      rollNumber: insertUser.rollNumber ?? null,
      universityEmail: insertUser.universityEmail ?? null,
      joinedYear: insertUser.joinedYear ?? null,
      leavingYear: insertUser.leavingYear ?? null,
      school: insertUser.school ?? null,
      branch: insertUser.branch ?? null,
      faceDescriptors: insertUser.faceDescriptors ?? null,
      company: insertUser.company ?? null,
      position: insertUser.position ?? null,
      companyEmail: insertUser.companyEmail ?? null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(email: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(user.id, updated);
    return updated;
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User> {
    const user = this.users.get(Number(id));
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
      studentId: cert.studentId,
      name: cert.name,
      rollNumber: cert.rollNumber,
      passingYear: cert.passingYear,
      joiningYear: cert.joiningYear,
      branch: cert.branch,
      university: cert.university,
      qrCode: cert.qrCode,
      imageUrl: cert.imageUrl ?? null,
      txHash: cert.txHash ?? null,
      blockHash: cert.blockHash ?? null,
      previousHash: cert.previousHash ?? null,
      createdAt: new Date(),
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

  async getCertificateById(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id as any);
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id as any);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createUnlock(verifierId: string, certificateId: string): Promise<VerifierUnlock> {
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

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, isApproved: isActive };
    this.users.set(userId, updated);
    return updated;
  }

  async revokeCertificate(certId: number): Promise<Certificate> {
    const cert = this.certificates.get(certId);
    if (!cert) throw new Error("Certificate not found");
    const updated = { ...cert, isActive: false };
    this.certificates.set(certId, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      // In MongoDB, we find by email-based ID or _id
      const mongoUser = await UserModel.findById(id);
      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error getUser:', err);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const mongoUser = await UserModel.findOne({ email });
      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error getUserByEmail:', err);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const mongoUser = await UserModel.create(insertUser);
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error createUser:', err);
      throw err;
    }
  }

  async updateUser(email: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const mongoUser = await UserModel.findOneAndUpdate(
        { email },
        updates,
        { new: true }
      );
      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUser:', err);
      return undefined;
    }
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<User> {
    try {
      const mongoUser = await UserModel.findByIdAndUpdate(
        id,
        { isApproved },
        { new: true }
      );
      if (!mongoUser) throw new Error("User not found");
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUserApproval:', err);
      throw err;
    }
  }

  async getPendingUsers(): Promise<User[]> {
    try {
      const mongoUsers = await UserModel.find({ isApproved: false });
      return mongoUsers.map(u => this.mongoToUser(u));
    } catch (err) {
      console.error('Error getPendingUsers:', err);
      return [];
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const mongoUsers = await UserModel.find({});
      return mongoUsers.map(u => this.mongoToUser(u));
    } catch (err) {
      console.error('Error getAllUsers:', err);
      return [];
    }
  }

  async createCertificate(cert: InsertCertificate): Promise<Certificate> {
    try {
      const mongoCert = await CertificateModel.create(cert);
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error createCertificate:', err);
      throw err;
    }
  }

  async getCertificatesByStudentId(studentId: number): Promise<Certificate[]> {
    try {
      const mongoCerts = await CertificateModel.find({ studentId });
      return mongoCerts.map(c => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getCertificatesByStudentId:', err);
      return [];
    }
  }

  async getCertificateByRollNumber(rollNumber: string): Promise<Certificate[]> {
    try {
      const mongoCerts = await CertificateModel.find({ rollNumber });
      return mongoCerts.map(c => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getCertificateByRollNumber:', err);
      return [];
    }
  }

  async getCertificateById(id: string): Promise<Certificate | undefined> {
    try {
      const mongoCert = await CertificateModel.findById(id);
      if (!mongoCert) return undefined;
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error getCertificateById:', err);
      return undefined;
    }
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    return this.getCertificateById(String(id));
  }

  async getAllCertificates(): Promise<Certificate[]> {
    try {
      const mongoCerts = await CertificateModel.find({});
      return mongoCerts.map(c => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getAllCertificates:', err);
      return [];
    }
  }

  async createUnlock(verifierId: string, certificateId: string): Promise<VerifierUnlock> {
    try {
      const mongoUnlock = await UnlockModel.create({
        verifierId,
        certificateId,
        paidAmount: 10,
      });
      return this.mongoToUnlock(mongoUnlock);
    } catch (err) {
      console.error('Error createUnlock:', err);
      throw err;
    }
  }

  async getUnlockedCertificates(verifierId: string): Promise<Certificate[]> {
    try {
      const unlocks = await UnlockModel.find({ verifierId });
      const certificateIds = unlocks.map(u => u.certificateId);
      const mongoCerts = await CertificateModel.find({ _id: { $in: certificateIds } });
      return mongoCerts.map(c => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getUnlockedCertificates:', err);
      return [];
    }
  }

  async isCertificateUnlocked(verifierId: number, certificateId: number): Promise<boolean> {
    try {
      const unlock = await UnlockModel.findOne({ verifierId, certificateId });
      return !!unlock;
    } catch (err) {
      console.error('Error isCertificateUnlocked:', err);
      return false;
    }
  }

  // Helper methods to convert MongoDB documents to User/Certificate/VerifierUnlock types
  private mongoToUser(doc: any): User {
    return {
      id: doc._id?.toString() as any || doc.id,
      email: doc.email,
      password: doc.password,
      role: doc.role as 'admin' | 'student' | 'verifier',
      isApproved: doc.isApproved ?? false,
      fullName: doc.fullName,
      rollNumber: doc.rollNumber ?? null,
      universityEmail: doc.universityEmail ?? null,
      joinedYear: doc.joinedYear ?? null,
      leavingYear: doc.leavingYear ?? null,
      school: doc.school ?? null,
      branch: doc.branch ?? null,
      faceDescriptors: doc.faceDescriptors ?? null,
      faceImage: doc.faceImage ?? null,
      company: doc.company ?? null,
      position: doc.position ?? null,
      companyEmail: doc.companyEmail ?? null,
    };
  }

  private mongoToCertificate(doc: any): Certificate {
    return {
      id: doc._id?.toString() as any || doc.id,
      studentId: doc.studentId,
      name: doc.name,
      rollNumber: doc.rollNumber,
      passingYear: doc.passingYear,
      joiningYear: doc.joiningYear,
      branch: doc.branch,
      university: doc.university,
      qrCode: doc.qrCode,
      imageUrl: doc.imageUrl ?? null,
      txHash: doc.txHash ?? null,
      blockHash: doc.blockHash ?? null,
      previousHash: doc.previousHash ?? null,
    };
  }

  private mongoToUnlock(doc: any): VerifierUnlock {
    return {
      id: doc._id?.toString() as any || doc.id,
      verifierId: doc.verifierId,
      certificateId: doc.certificateId,
      paidAmount: doc.paidAmount ?? 10,
    };
  }

  // Activity logging methods
  async logActivity(type: string, userId: any, userName: string, userEmail: string, userRole: string, description: string, details?: any) {
    try {
      await ActivityLogModel.create({
        type,
        userId,
        userName,
        userEmail,
        userRole,
        description,
        details,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }

  async logPayment(verifierId: any, verifierName: string, verifierEmail: string, certificateId: any, certificateName: string, studentId: any, studentName: string, studentRollNumber: string, amount: number) {
    try {
      await PaymentLogModel.create({
        verifierId,
        verifierName,
        verifierEmail,
        certificateId,
        certificateName,
        studentId,
        studentName,
        studentRollNumber,
        amount,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Error logging payment:', err);
    }
  }

  async logAccess(verifierId: any, verifierName: string, verifierEmail: string, certificateId: any, studentId: any, studentName: string, studentEmail: string, action: string = 'viewed', ipAddress?: string) {
    try {
      await AccessLogModel.create({
        verifierId,
        verifierName,
        verifierEmail,
        certificateId,
        studentId,
        studentName,
        studentEmail,
        action,
        accessTime: new Date(),
        ipAddress,
      });
    } catch (err) {
      console.error('Error logging access:', err);
    }
  }

  async getRecentActivity(limit: number = 10) {
    try {
      const logs = await ActivityLogModel.find().sort({ timestamp: -1 }).limit(limit);
      return logs.map(log => ({
        id: log._id?.toString(),
        type: log.type,
        user: {
          id: log.userId,
          fullName: log.userName,
          email: log.userEmail,
          role: log.userRole,
        },
        description: log.description,
        timestamp: log.timestamp?.toISOString(),
        details: log.details,
      }));
    } catch (err) {
      console.error('Error getting recent activity:', err);
      return [];
    }
  }

  async getRecentPayments(limit: number = 10) {
    try {
      const payments = await PaymentLogModel.find().sort({ timestamp: -1 }).limit(limit);
      return payments.map(payment => ({
        id: payment._id?.toString(),
        verifier: {
          id: payment.verifierId,
          fullName: payment.verifierName,
          email: payment.verifierEmail,
        },
        certificate: {
          id: payment.certificateId,
          name: payment.certificateName,
          studentId: payment.studentId,
        },
        amount: payment.amount,
        timestamp: payment.timestamp?.toISOString(),
        certificateDetails: {
          studentName: payment.studentName,
          rollNumber: payment.studentRollNumber,
        },
      }));
    } catch (err) {
      console.error('Error getting recent payments:', err);
      return [];
    }
  }

  async getAccessLogs(limit: number = 10) {
    try {
      const logs = await AccessLogModel.find().sort({ accessTime: -1 }).limit(limit);
      return logs.map(log => ({
        id: log._id?.toString(),
        verifier: {
          id: log.verifierId,
          fullName: log.verifierName,
          email: log.verifierEmail,
        },
        certificateId: log.certificateId,
        studentInfo: {
          id: log.studentId,
          fullName: log.studentName,
          email: log.studentEmail,
        },
        accessTime: log.accessTime?.toISOString(),
        action: log.action,
        ipAddress: log.ipAddress,
      }));
    } catch (err) {
      console.error('Error getting access logs:', err);
      return [];
    }
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    try {
      const mongoUser = await UserModel.findByIdAndUpdate(
        userId,
        { isApproved: isActive },
        { new: true }
      );
      if (!mongoUser) throw new Error("User not found");
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUserStatus:', err);
      throw err;
    }
  }

  async revokeCertificate(certId: number): Promise<Certificate> {
    try {
      const mongoCert = await CertificateModel.findByIdAndUpdate(
        certId,
        { isActive: false },
        { new: true }
      );
      if (!mongoCert) throw new Error("Certificate not found");
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error revokeCertificate:', err);
      throw err;
    }
  }
}

// Old DatabaseStorage implementation (PostgreSQL/Drizzle) - commented out as fallback
/*
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

  async updateUserApproval(id: string, isApproved: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({ isApproved })
      .where(eq(users.id, parseInt(id)))
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

  async getCertificateById(id: string): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.id, Number(id)));
    return cert;
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [cert] = await db.select().from(certificates).where(eq(certificates.id, Number(id)));
    return cert;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return db.select().from(certificates);
  }

  async createUnlock(verifierId: string, certificateId: string): Promise<VerifierUnlock> {
    const [unlock] = await db.insert(verifierUnlocks).values({
      verifierId: Number(verifierId),
      certificateId: Number(certificateId),
      paidAmount: 10,
    }).returning();
    return unlock;
  }

  async getUnlockedCertificates(verifierId: string): Promise<Certificate[]> {
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
*/

// Initialize storage - use memory storage if DB is unavailable
// Start with memory storage, then try to upgrade to database
export let storage: IStorage = new MemoryStorage();

export async function initStorage() {
  try {
    // Try to connect to database
    const dbConnected = await initDb();

    if (dbConnected) {
      console.log("✓ Upgrading to MongoDB storage");
      storage = new DatabaseStorage();
    } else {
      console.log("ℹ️  Using in-memory storage (database unavailable)");
    }
  } catch (err) {
    console.error("Failed to initialize storage:", err);
    console.log("Using in-memory storage");
  }
}
