import { eq, and } from "drizzle-orm";
import mongoose from 'mongoose';
import { z } from "zod";

/*
  NOTE: This file is the original CertChain-main/server/storage.ts with robust ID handling
  applied to DatabaseStorage methods that previously passed numeric IDs directly to
  Mongoose.findById / findByIdAndUpdate which caused "Cast to ObjectId failed" errors.

  The key changes:
  - DatabaseStorage methods that previously used Model.findById(id) or findByIdAndUpdate(id,...)
    now use helper logic to:
      1) detect if the incoming id looks like a Mongo ObjectId (24 hex chars)
      2) attempt an ObjectId lookup when appropriate
      3) fall back to numeric `id` field lookup or string _id lookup
      4) use $or queries where necessary to find documents stored with numeric `id` or string _id
  - isCertificateUnlocked / getUnlockedCertificates / createUnlock also tolerate verifierId/certificateId
    stored as numbers, strings, or ObjectId strings.

  Before applying this change, decide whether you want to standardize on:
    - Mongo ObjectId _id (recommended for Mongo deployments), or
    - Numeric ids stored in a dedicated `id` field (for Postgres/drizzle compatibility)
  and then simplify the lookup logic accordingly. The changes here are defensive to support mixed ids.
*/

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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const unlockSchema = new mongoose.Schema({
  verifierId: { type: mongoose.Schema.Types.Mixed, required: true },
  certificateId: { type: mongoose.Schema.Types.Mixed, required: true },
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

// Types used by the rest of the project (drizzle schemas are in shared/schema.ts)
type InsertUser = any;
type InsertCertificate = any;

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(user: InsertUser): Promise<any>;
  updateUser(email: string, updates: Partial<InsertUser>): Promise<any | undefined>;
  updateUserApproval(id: string, isApproved: boolean): Promise<any>;
  getPendingUsers(): Promise<any[]>;
  getAllUsers(): Promise<any[]>;
  
  createCertificate(cert: InsertCertificate): Promise<any>;
  getCertificatesByStudentId(studentId: number): Promise<any[]>;
  getCertificateByRollNumber(rollNumber: string): Promise<any[]>;
  getCertificateById(id: number | string): Promise<any | undefined>;
  getCertificate(id: number): Promise<any | undefined>;
  getAllCertificates(): Promise<any[]>;
  
  createUnlock(verifierId: number | string, certificateId: number | string): Promise<any>;
  getUnlockedCertificates(verifierId: number | string): Promise<any[]>;
  isCertificateUnlocked(verifierId: number | string, certificateId: number | string): Promise<boolean>;
}

// In-Memory Storage for Development (unchanged)
export class MemoryStorage implements IStorage {
  private users: Map<number, any> = new Map();
  private certificates: Map<number, any> = new Map();
  private unlocks: Map<number, any> = new Map();
  private userIdCounter = 1;
  private certIdCounter = 1;
  private unlockIdCounter = 1;

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<any> {
    const user: any = {
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

  async updateUser(email: string, updates: Partial<InsertUser>): Promise<any | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(updated.id, updated);
    return updated;
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<any> {
    const userId = Number(id);
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, isApproved };
    this.users.set(userId, updated);
    return updated;
  }

  async getPendingUsers(): Promise<any[]> {
    return Array.from(this.users.values()).filter(u => !u.isApproved);
  }

  async getAllUsers(): Promise<any[]> {
    return Array.from(this.users.values());
  }

  async createCertificate(cert: InsertCertificate): Promise<any> {
    const certificate: any = {
      id: this.certIdCounter++,
      ...cert
    };
    this.certificates.set(certificate.id, certificate);
    return certificate;
  }

  async getCertificatesByStudentId(studentId: number): Promise<any[]> {
    return Array.from(this.certificates.values()).filter(c => c.studentId === studentId);
  }

  async getCertificateByRollNumber(rollNumber: string): Promise<any[]> {
    return Array.from(this.certificates.values()).filter(c => c.rollNumber === rollNumber);
  }

  async getCertificateById(id: number | string): Promise<any | undefined> {
    return this.certificates.get(Number(id));
  }

  async getCertificate(id: number): Promise<any | undefined> {
    return this.certificates.get(id);
  }

  async getAllCertificates(): Promise<any[]> {
    return Array.from(this.certificates.values());
  }

  async createUnlock(verifierId: number | string, certificateId: number | string): Promise<any> {
    const unlock = {
      id: this.unlockIdCounter++,
      verifierId,
      certificateId,
      paidAmount: 10,
      unlockedAt: new Date(),
    };
    this.unlocks.set(unlock.id, unlock);
    return unlock;
  }

  async getUnlockedCertificates(verifierId: number | string): Promise<any[]> {
    const unlocks = Array.from(this.unlocks.values()).filter(u => String(u.verifierId) === String(verifierId));
    const certIds = unlocks.map(u => Number(u.certificateId));
    return certIds.map(id => this.certificates.get(id)).filter(Boolean);
  }

  async isCertificateUnlocked(verifierId: number | string, certificateId: number | string): Promise<boolean> {
    return Array.from(this.unlocks.values()).some(u => String(u.verifierId) === String(verifierId) && String(u.certificateId) === String(certificateId));
  }

  // Other in-memory methods omitted for brevity...
}

// DatabaseStorage with robust ID handling
export class DatabaseStorage implements IStorage {
  // Helper: check ObjectId-like string
  private looksLikeObjectId(val: string) {
    return /^[0-9a-fA-F]{24}$/.test(val);
  }

  // Helper: build ID query for a field that could be stored as number, string, or ObjectId
  private buildFlexibleIdQuery(fieldName: string, id: number | string) {
    const idStr = String(id);
    const clauses: any[] = [];

    // numeric form
    if (!Number.isNaN(Number(idStr))) {
      clauses.push({ [fieldName]: Number(idStr) });
    }

    // string form
    clauses.push({ [fieldName]: idStr });

    // ObjectId form (if looks like one)
    if (this.looksLikeObjectId(idStr)) {
      try {
        clauses.push({ [fieldName]: new mongoose.Types.ObjectId(idStr) });
      } catch (e) {
        // ignore invalid ObjectId cast
      }
    }

    // final query: any of these
    return { $or: clauses };
  }

  // Convert Mongo doc to project User type
  private mongoToUser(doc: any) {
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

  private mongoToCertificate(doc: any) {
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
      isActive: doc.isActive ?? true,
    };
  }

  private mongoToUnlock(doc: any) {
    return {
      id: doc._id?.toString() as any || doc.id,
      verifierId: doc.verifierId,
      certificateId: doc.certificateId,
      paidAmount: doc.paidAmount ?? 10,
    };
  }

  // ========== DatabaseStorage methods ==========
  async getUser(id: number): Promise<any | undefined> {
    try {
      const idStr = String(id);
      let mongoUser: any = null;

      // prefer ObjectId lookup if looks like ObjectId
      if (this.looksLikeObjectId(idStr)) {
        mongoUser = await UserModel.findById(idStr).exec().catch(() => null);
      }

      // fallback: try numeric `id` field or string _id
      if (!mongoUser) {
        mongoUser = await UserModel.findOne(this.buildFlexibleIdQuery('_id', idStr)).exec().catch(() => null);
        if (!mongoUser) {
          // try numeric `id` field (if documents have id numeric stored)
          mongoUser = await UserModel.findOne(this.buildFlexibleIdQuery('id', id)).exec().catch(() => null);
        }
      }

      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error getUser:', err);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const mongoUser = await UserModel.findOne({ email }).exec();
      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error getUserByEmail:', err);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<any> {
    try {
      const mongoUser = await UserModel.create(insertUser);
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error createUser:', err);
      throw err;
    }
  }

  async updateUser(email: string, updates: Partial<InsertUser>): Promise<any | undefined> {
    try {
      const mongoUser = await UserModel.findOneAndUpdate(
        { email },
        updates,
        { new: true }
      ).exec();
      if (!mongoUser) return undefined;
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUser:', err);
      return undefined;
    }
  }

  async updateUserApproval(id: string, isApproved: boolean): Promise<any> {
    try {
      const idStr = String(id);
      let mongoUser: any = null;

      if (this.looksLikeObjectId(idStr)) {
        mongoUser = await UserModel.findByIdAndUpdate(idStr, { isApproved }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) {
        // Try numeric id field
        mongoUser = await UserModel.findOneAndUpdate(this.buildFlexibleIdQuery('id', id), { isApproved }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) {
        // fallback: try string _id
        mongoUser = await UserModel.findByIdAndUpdate(idStr, { isApproved }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) throw new Error("User not found");
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUserApproval:', err);
      throw err;
    }
  }

  async getPendingUsers(): Promise<any[]> {
    try {
      const mongoUsers = await UserModel.find({ isApproved: false }).exec();
      return mongoUsers.map((u: any) => this.mongoToUser(u));
    } catch (err) {
      console.error('Error getPendingUsers:', err);
      return [];
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const mongoUsers = await UserModel.find({}).exec();
      return mongoUsers.map((u: any) => this.mongoToUser(u));
    } catch (err) {
      console.error('Error getAllUsers:', err);
      return [];
    }
  }

  async createCertificate(cert: InsertCertificate): Promise<any> {
    try {
      const mongoCert = await CertificateModel.create(cert);
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error createCertificate:', err);
      throw err;
    }
  }

  async getCertificatesByStudentId(studentId: number): Promise<any[]> {
    try {
      const mongoCerts = await CertificateModel.find({ studentId }).exec();
      return mongoCerts.map((c: any) => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getCertificatesByStudentId:', err);
      return [];
    }
  }

  async getCertificateByRollNumber(rollNumber: string): Promise<any[]> {
    try {
      const mongoCerts = await CertificateModel.find({ rollNumber }).exec();
      return mongoCerts.map((c: any) => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getCertificateByRollNumber:', err);
      return [];
    }
  }

  async getCertificateById(id: string): Promise<any | undefined> {
    try {
      const idStr = String(id);
      let mongoCert: any = null;

      if (this.looksLikeObjectId(idStr)) {
        mongoCert = await CertificateModel.findById(idStr).exec().catch(() => null);
      }

      if (!mongoCert) {
        // try _id or numeric id field
        mongoCert = await CertificateModel.findOne(this.buildFlexibleIdQuery('_id', idStr)).exec().catch(() => null);
        if (!mongoCert) {
          mongoCert = await CertificateModel.findOne(this.buildFlexibleIdQuery('id', id)).exec().catch(() => null);
        }
      }

      if (!mongoCert) return undefined;
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error getCertificateById:', err);
      return undefined;
    }
  }

  async getCertificate(id: number): Promise<any | undefined> {
    // keep compatibility with numeric param
    return this.getCertificateById(String(id));
  }

  async getAllCertificates(): Promise<any[]> {
    try {
      const mongoCerts = await CertificateModel.find({}).exec();
      return mongoCerts.map((c: any) => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getAllCertificates:', err);
      return [];
    }
  }

  async createUnlock(verifierId: number | string, certificateId: number | string): Promise<any> {
    try {
      // store them as-is (Mixed in schema). Consumers should compare using stringified forms.
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

  async getUnlockedCertificates(verifierId: number | string): Promise<any[]> {
    try {
      // Find unlocks where verifierId matches as number or string or ObjectId
      const unlocks = await UnlockModel.find(this.buildFlexibleIdQuery('verifierId', verifierId)).exec();
      const certificateIds = unlocks.map((u: any) => u.certificateId);

      if (!certificateIds || certificateIds.length === 0) return [];

      // Build a query to fetch certificates by multiple possible id representations
      const certQueries: any[] = [];
      for (const cid of certificateIds) {
        certQueries.push(this.buildFlexibleIdQuery('_id', cid));
        certQueries.push(this.buildFlexibleIdQuery('id', cid));
      }

      // Combine queries: certificates that match ANY of the per-id possibilities
      const mongoCerts = await CertificateModel.find({ $or: certQueries }).exec();
      return mongoCerts.map((c: any) => this.mongoToCertificate(c));
    } catch (err) {
      console.error('Error getUnlockedCertificates:', err);
      return [];
    }
  }

  async isCertificateUnlocked(verifierId: number | string, certificateId: number | string): Promise<boolean> {
    try {
      // check possible combinations
      const query = {
        $and: [
          this.buildFlexibleIdQuery('verifierId', verifierId),
          this.buildFlexibleIdQuery('certificateId', certificateId),
        ]
      };
      const unlock = await UnlockModel.findOne(query).exec();
      return !!unlock;
    } catch (err) {
      console.error('Error isCertificateUnlocked:', err);
      return false;
    }
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
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error logActivity:', err);
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
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error logPayment:', err);
    }
  }

  async logAccess(verifierId: any, verifierName: string, verifierEmail: string, certificateId: any, studentId: any, studentName: string, studentEmail: string, action = 'viewed', ipAddress?: string) {
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
        ipAddress
      });
    } catch (err) {
      console.error('Error logAccess:', err);
    }
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<any> {
    try {
      // Try to update by flexible id match
      const idStr = String(userId);
      let mongoUser: any = null;

      if (this.looksLikeObjectId(idStr)) {
        mongoUser = await UserModel.findByIdAndUpdate(idStr, { isApproved: isActive }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) {
        mongoUser = await UserModel.findOneAndUpdate(this.buildFlexibleIdQuery('id', userId), { isApproved: isActive }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) {
        // last fallback: try updating where _id equals the string form
        mongoUser = await UserModel.findByIdAndUpdate(idStr, { isApproved: isActive }, { new: true }).exec().catch(() => null);
      }

      if (!mongoUser) throw new Error("User not found");
      return this.mongoToUser(mongoUser);
    } catch (err) {
      console.error('Error updateUserStatus:', err);
      throw err;
    }
  }

  async revokeCertificate(certId: number): Promise<any> {
    try {
      const idStr = String(certId);
      let mongoCert: any = null;

      if (this.looksLikeObjectId(idStr)) {
        mongoCert = await CertificateModel.findByIdAndUpdate(idStr, { isActive: false }, { new: true }).exec().catch(() => null);
      }

      if (!mongoCert) {
        mongoCert = await CertificateModel.findOneAndUpdate(this.buildFlexibleIdQuery('id', certId), { isActive: false }, { new: true }).exec().catch(() => null);
      }

      if (!mongoCert) {
        mongoCert = await CertificateModel.findByIdAndUpdate(idStr, { isActive: false }, { new: true }).exec().catch(() => null);
      }

      if (!mongoCert) throw new Error("Certificate not found");
      return this.mongoToCertificate(mongoCert);
    } catch (err) {
      console.error('Error revokeCertificate:', err);
      throw err;
    }
  }
}

// Export default storage instance selection (left unchanged in file usage)
export default {}; 
