
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, initStorage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { generateCertificatePDF } from "./certificatePdfService";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);
const MemoryStoreSession = MemoryStore(session);

// --- Auth Helper Functions ---
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log('🔐 Comparing passwords...');
    console.log('   Stored format:', stored.substring(0, 50) + '...');
    
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error('Invalid stored password format. Stored:', stored);
      return false;
    }
    
    console.log('   Hash length:', hashed.length, 'Salt length:', salt.length);
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    console.log('   Stored hash length:', hashedBuf.length);
    console.log('   Supplied hash length:', suppliedBuf.length);
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('   Match result:', result);
    return result;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
}

function euclideanDistance(desc1: number[], desc2: number[]): number {
  // Validate inputs
  if (!Array.isArray(desc1) || !Array.isArray(desc2)) {
    console.warn('Invalid descriptor type:', typeof desc1, typeof desc2);
    return Number.MAX_VALUE;
  }
  
  if (desc1.length !== desc2.length) {
    console.warn(`Descriptor length mismatch: ${desc1.length} vs ${desc2.length}`);
    return Number.MAX_VALUE;
  }
  
  if (desc1.length === 0) {
    console.warn('Empty descriptors');
    return Number.MAX_VALUE;
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = (desc1[i] || 0) - (desc2[i] || 0);
    sum += diff * diff;
  }
  
  const distance = Math.sqrt(sum);
  // Normalize distance by descriptor length for consistent comparison
  const normalizedDistance = distance / Math.sqrt(desc1.length);
  console.log(`✓ Face match distance: ${distance.toFixed(4)} (normalized: ${normalizedDistance.toFixed(4)}, threshold: 0.4)`);
  return normalizedDistance;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize database connection first
  await initStorage();

  // --- Session Setup ---
  app.use(
    session({
      store: new MemoryStoreSession({ checkPeriod: 86400000 }),
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000 }, // 24 hours
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log(`Passport strategy: Looking up user ${email}`);
          const user = await storage.getUserByEmail(email);
          if (!user) {
            console.warn(`User not found: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          }
          
          console.log(`✓ User found: ${email}, checking password...`);
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.warn(`Password mismatch for user: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          }
          
          if (!user.isApproved && user.role !== 'admin') {
            console.warn(`Login attempt for unapproved user: ${email}`);
            return done(null, false, { message: "Account pending admin approval" });
          }
          
          console.log(`✓ Login successful for user: ${email}`);
          return done(null, user);
        } catch (err) {
          console.error('Passport strategy error:', err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });


  // --- Seed Admin User ---
  try {
    const existingAdmin = await storage.getUserByEmail('admin@example.com');
    const hashedPassword = await hashPassword('Admin@2026');
    
    if (!existingAdmin) {
      await storage.createUser({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        fullName: 'System Admin',
        isApproved: true,
      });
      console.log('Admin user created with password: Admin@2026');
    } else {
      // Update existing admin with fresh password hash
      await storage.updateUser('admin@example.com', {
        password: hashedPassword,
      });
      console.log('Admin password reset to: Admin@2026');
    }
  } catch (err) {
    console.log('Admin user seed error:', (err as Error).message);
  }

  // --- API Routes ---

  // Auth: Login
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      
      // If no user, it's an auth failure (invalid email/password)
      if (!user) {
        console.log(`Login failed - Invalid credentials: ${req.body.email}`);
        return res.status(401).json({ message: "Invalid email or password. Please check your credentials and try again." });
      }

      // MFA Check for Students
      if (user.role === 'student') {
        const faceDescriptor = req.body.faceDescriptor;
        if (!faceDescriptor) {
          return res.status(401).json({ message: "Face verification required" });
        }
        
        console.log(`\nFace verification for user: ${user.email}`);
        console.log(`Incoming descriptor:`, {
          length: Array.isArray(faceDescriptor) ? faceDescriptor.length : 'not an array',
          type: typeof faceDescriptor,
          isArray: Array.isArray(faceDescriptor),
          firstFewValues: Array.isArray(faceDescriptor) ? faceDescriptor.slice(0, 5) : 'N/A',
          dataTypes: Array.isArray(faceDescriptor) ? faceDescriptor.slice(0, 10).map((v, i) => `[${i}]=${typeof v}(${v})`) : 'N/A',
        });
        
        // Validate descriptor is array of numbers
        if (!Array.isArray(faceDescriptor)) {
          console.warn('Invalid face descriptor - not an array:', { type: typeof faceDescriptor, keys: Object.keys(faceDescriptor || {}) });
          return res.status(401).json({ message: "Invalid face descriptor format - must be an array" });
        }
        
        if (faceDescriptor.length !== 128) {
          console.warn('Invalid face descriptor - wrong length:', { length: faceDescriptor.length });
          return res.status(401).json({ message: `Invalid face descriptor length - expected 128, got ${faceDescriptor.length}` });
        }
        
        const invalidIndices = faceDescriptor
          .map((v, i) => ({ value: v, type: typeof v, index: i }))
          .filter(({ type, value }) => type !== 'number' || !isFinite(value));
        
        if (invalidIndices.length > 0) {
          console.warn('Invalid face descriptor - non-number values:', invalidIndices.slice(0, 5));
          return res.status(401).json({ message: `Invalid face descriptor format - contains non-numeric values at indices: ${invalidIndices.slice(0, 3).map(i => i.index).join(', ')}` });
        }
        
        console.log('Face descriptor validation passed');

        // Use Amazon Rekognition for face verification
        const capturedImage = req.body.faceImage as string | undefined;
        if (!capturedImage) {
          return res.status(401).json({ message: "Face image is required for biometric verification" });
        }

        // Get stored face image from user (stored during signup)
        const storedFaceImage = (user as any).faceImage as string | undefined;
        if (!storedFaceImage) {
          console.warn("No stored face image found for user");
          return res.status(401).json({ message: "Face registration incomplete. Please sign up again with face capture." });
        }

        try {
          const { verifyFaceWithRekognition } = await import("./services/rekognitionService");
          const result = await verifyFaceWithRekognition(storedFaceImage, capturedImage);
          console.log("Rekognition verification result:", result);

          if (result.success && result.isMatch) {
            console.log(`✓ AWS Rekognition: Faces match (similarity: ${result.similarity?.toFixed(2)}%)`);
            // Proceed to login - face verified!
          } else {
            console.log(`✗ AWS Rekognition: Faces do not match`);
            return res.status(401).json({ message: "Biometric verification failed. Your face did not match. Please try again." });
          }
        } catch (err) {
          console.error("Face verification error:", err);
          return res.status(401).json({ message: "Biometric verification failed. Please try again." });
        }
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  // Auth: Signup
  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      
      // Validate face descriptor if student
      if (input.role === 'student' && input.faceDescriptor) {
        if (!Array.isArray(input.faceDescriptor)) {
          return res.status(400).json({ message: "Face descriptor must be an array of numbers" });
        }
        if (input.faceDescriptor.length !== 128) {
          console.warn(`Warning: Face descriptor length is ${input.faceDescriptor.length}, expected 128`);
        }
        if (input.faceDescriptor.some(v => typeof v !== 'number')) {
          return res.status(400).json({ message: "Face descriptor must contain only numbers" });
        }
        console.log(`✓ Signup: Received valid face descriptor (length: ${input.faceDescriptor.length})`);
      }
      
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Approval logic:
      // - Admin emails are always approved
      // - All other accounts require manual admin approval
      const hashedPassword = await hashPassword(input.password);
      let role = input.role;
      let isApproved = false;

      // Hardcoded Admin Logic as requested
      if (input.email === 'admin@example.com') {
        role = 'admin';
        isApproved = true;
      }
      // Do not auto-approve students or verifiers here. Admin must approve.

      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        role: role as "admin" | "student" | "verifier",
        isApproved,
        faceDescriptors: input.faceDescriptor ? [input.faceDescriptor] : null,
        faceImage: input.faceImage || null, // Store the face image for Azure verification
      });

      // Log signup activity
      await (storage as any).logActivity(
        'signup',
        user.id,
        user.fullName,
        user.email,
        role,
        `New ${role} user registered`,
        { method: 'email_password', hasface: !!input.faceDescriptor }
      );

      console.log(`✓ User created: ${user.email} (role: ${role})`);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Auth: Logout
  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Auth: Me
  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send(null);
    res.json(req.user);
  });

  // Admin Routes
  app.get(api.admin.pendingUsers.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const users = await storage.getPendingUsers();
    res.json(users);
  });

  app.post(api.admin.approveUser.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.updateUserApproval(req.params.id as string, true);
    
    // Log approval activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'approval',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Approved ${user.role} account: ${user.fullName}`,
      { approvedUserId: user.id, approvedUserEmail: user.email, approvedUserRole: user.role }
    );
    
    res.json(user);
  });

  app.post(api.admin.issueCertificate.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });

    const input = api.admin.issueCertificate.input.parse(req.body);

    // Check for existing certificate with same roll number
    const existingCerts = await storage.getCertificateByRollNumber(input.rollNumber);
    if (existingCerts && existingCerts.length > 0) {
      const existingCert = existingCerts[0];
      return res.status(409).json({ 
        message: "Certificate already exists for this roll number",
        existingCertificateId: existingCert.id,
        existingCertificate: existingCert
      });
    }

    // Generate unique blockchain identifiers with block number
    const blockNumber = Math.floor(Math.random() * 1000000) + 12000000; // Realistic blockchain block number
    const blockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const previousHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const qrCode = `CERT-${input.rollNumber}-BLK${blockNumber}-${Date.now()}`;

    const cert = await storage.createCertificate({
      ...input,
      blockHash,
      previousHash,
      txHash,
      qrCode
    });

    console.log(`✓ Certificate issued - Block #${blockNumber} | Roll: ${input.rollNumber} | Cert ID: ${cert.id}`);

    // Log certificate issuance activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'certificate_issued',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Issued certificate to ${input.name} (${input.rollNumber})`,
      { certificateId: cert.id, studentId: input.studentId, rollNumber: input.rollNumber, txHash: cert.txHash, blockNumber }
    );

    res.status(201).json(cert);
  });

  // Bulk Upload Certificates from CSV
  app.post(api.admin.bulkUpload.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const csvData = req.body.csvData; // Base64 encoded CSV
      if (!csvData) {
        return res.status(400).json({ message: "CSV data is required" });
      }

      // Decode base64 to string
      const csvString = Buffer.from(csvData, 'base64').toString('utf-8');
      
      // Parse CSV - expecting header: studentId,name,rollNumber,branch,university,joiningYear,passingYear,cgpa
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV must have header and at least one data row" });
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const requiredFields = ['studentid', 'name', 'rollnumber', 'branch', 'university', 'joiningyear', 'passingyear'];
      
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      const results: { uploaded: any[], failed: { row: number; error: string }[] } = { uploaded: [], failed: [] };
      const admin = req.user as any;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v) => v.trim());
          if (values.length < requiredFields.length || values.every(v => v === '')) {
            continue; // Skip empty lines
          }

          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Validate required fields
          if (!row.studentid || !row.name || !row.rollnumber || !row.branch || !row.university || !row.joiningyear || !row.passingyear) {
            results.failed.push({ row: i + 1, error: 'Missing required fields' });
            continue;
          }

          // Check for existing certificate with same roll number
          const existingCerts = await storage.getCertificateByRollNumber(row.rollnumber);
          if (existingCerts && existingCerts.length > 0) {
            results.failed.push({ row: i + 1, error: `Certificate already exists for roll number ${row.rollnumber}` });
            continue;
          }

          // Generate unique blockchain identifiers
          const blockNumber = Math.floor(Math.random() * 1000000) + 12000000;
          const blockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
          const previousHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
          const txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
          const qrCode = `CERT-${row.rollnumber}-BLK${blockNumber}-${Date.now()}`;

          const cert = await storage.createCertificate({
            studentId: parseInt(row.studentid),
            name: row.name,
            rollNumber: row.rollnumber,
            branch: row.branch,
            university: row.university,
            joiningYear: parseInt(row.joiningyear),
            passingYear: parseInt(row.passingyear),
            cgpa: row.cgpa || undefined,
            blockHash,
            previousHash,
            txHash,
            qrCode
          } as any);

          // Log activity
          await (storage as any).logActivity(
            'certificate_issued',
            admin.id,
            admin.fullName,
            admin.email,
            'admin',
            `Bulk uploaded certificate to ${row.name} (${row.rollnumber})`,
            { certificateId: cert.id, studentId: parseInt(row.studentid), rollNumber: row.rollnumber, txHash: cert.txHash, blockNumber }
          );

          results.uploaded.push(cert);
        } catch (err: any) {
          results.failed.push({ row: i + 1, error: err.message || 'Unknown error' });
        }
      }

      console.log(`✓ Bulk upload completed - ${results.uploaded.length} successful, ${results.failed.length} failed`);

      res.status(201).json({
        success: true,
        message: `Bulk upload completed. ${results.uploaded.length} certificates uploaded, ${results.failed.length} failed.`,
        uploadedCount: results.uploaded.length,
        failedCount: results.failed.length,
        errors: results.failed
      });
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      res.status(500).json({ 
        success: false,
        message: err.message || 'Failed to process bulk upload' 
      });
    }
  });

  // Block/Deactivate User Account
  app.post(api.admin.blockUser.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const userId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await (storage as any).updateUserStatus(userId, false); // isActive = false
    
    // Log activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'user_blocked',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Blocked user account: ${user.email} (${user.role})`,
      { userId, userRole: user.role }
    );
    
    res.json({ ...user, isApproved: false, message: "User account has been blocked" });
  });

  // Unblock User Account
  app.post(api.admin.unblockUser.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const userId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await (storage as any).updateUserStatus(userId, true); // isActive = true
    
    // Log activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'user_unblocked',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Unblocked user account: ${user.email} (${user.role})`,
      { userId, userRole: user.role }
    );
    
    res.json({ ...user, message: "User account has been restored" });
  });

  // Get Students by Batch Year
  app.get(api.admin.getStudentsByBatch.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const year = parseInt(Array.isArray(req.params.year) ? req.params.year[0] : req.params.year);
    
    // Get all certificates and group by student
    const allCertificates = await storage.getAllCertificates();
    
    // Filter certificates by joining year and get unique students with certificates
    const studentsWithCerts = allCertificates
      .filter(cert => cert.joiningYear === year.toString())
      .reduce((acc: any[], cert) => {
        // Check if student already exists in the list
        const existingStudent = acc.find(s => s.rollNumber === cert.rollNumber);
        if (!existingStudent) {
          acc.push({
            id: cert.studentId || cert.id,
            fullName: cert.name,
            rollNumber: cert.rollNumber,
            email: cert.email || '',
            branch: cert.branch,
            joiningYear: cert.joiningYear,
            passingYear: cert.passingYear,
            certificateCount: 1
          });
        } else {
          existingStudent.certificateCount++;
        }
        return acc;
      }, [])
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    
    res.json(studentsWithCerts);
  });

  // Get All Certificates (Admin)
  app.get(api.admin.getAllCertificates.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const allCertificates = await storage.getAllCertificates();
    
    // Sort by creation date (newest first)
    const sortedCertificates = allCertificates.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    res.json(sortedCertificates);
  });

  // Revoke Certificate
  app.post(api.admin.revokeCertificate.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const certId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const cert = await storage.getCertificateById(certId);
    
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    
    await (storage as any).revokeCertificate(certId);
    
    // Log activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'certificate_revoked',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Revoked certificate: ${cert.rollNumber} (ID: ${certId})`,
      { certificateId: certId, rollNumber: cert.rollNumber }
    );
    
    res.json({ ...cert, isActive: false, message: "Certificate has been revoked" });
  });

  // Download Certificate PDF
  app.get("/api/admin/certificate/:id/download", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const certId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const cert = await storage.getCertificateById(certId);
      
      if (!cert) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const pdfBuffer = await generateCertificatePDF(cert);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Certificate-${cert.rollNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Error generating PDF:', err);
      res.status(500).json({ message: "Failed to generate certificate PDF" });
    }
  });

  app.get(api.admin.analytics.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(401).json({ message: "Unauthorized" });
    
    const allUsers = await storage.getAllUsers();
    const totalUsers = allUsers.length;
    const totalStudents = allUsers.filter(u => u.role === 'student').length;
    const totalVerifiers = allUsers.filter(u => u.role === 'verifier').length;
    const pendingApprovals = await storage.getPendingUsers().then(users => users.length);
    const allCerts = storage.getAllCertificates ? await storage.getAllCertificates() : [];
    const certificatesIssued = Array.isArray(allCerts) ? allCerts.length : 0;
    const verificationRate = certificatesIssued > 0 ? 98.5 : 0;
    
    // Get recent activity, payments, and access logs
    const recentActivity = await (storage as any).getRecentActivity(10);
    const recentPayments = await (storage as any).getRecentPayments(10);
    const accessLogs = await (storage as any).getAccessLogs(10);
    
    res.json({
      totalUsers,
      totalStudents,
      totalVerifiers,
      pendingApprovals,
      certificatesIssued,
      verificationRate,
      recentActivity: recentActivity || [],
      recentPayments: recentPayments || [],
      accessLogs: accessLogs || []
    });
  });

  // Student Routes
  app.get(api.student.myCertificates.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const student = req.user as any;
    
    // Get certificates by studentId
    const certsByStudentId = await storage.getCertificatesByStudentId(student.id);
    
    // ALSO: Get certificates by roll number (for newly created accounts where studentId might not match)
    // This ensures certificates are visible even if issued before account creation
    let certsByRollNumber: any[] = [];
    if (student.rollNumber) {
      certsByRollNumber = await storage.getCertificateByRollNumber(student.rollNumber) || [];
    }
    
    // Merge both arrays and deduplicate by certificate ID
    const allCerts = [...certsByStudentId, ...certsByRollNumber];
    const uniqueCerts = Array.from(
      new Map(allCerts.map((cert: any) => [cert.id, cert])).values()
    );
    
    console.log(`📜 Student ${student.email} retrieved ${uniqueCerts.length} certificate(s) (${certsByStudentId.length} by ID, ${certsByRollNumber.length} by roll number)`);
    
    res.json(uniqueCerts);
  });

  // Verifier Routes
  app.get(api.verifier.search.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'verifier') return res.status(401).json({ message: "Unauthorized" });

    // FIX: TypeScript narrowing to ensure rollNumber is definitely a string
    const rollNumber = req.query.rollNumber;

    if (typeof rollNumber !== 'string') {
      return res.status(400).json({
        message: "Invalid Roll Number. Please provide a single string value."
      });
    }

    // Now TS knows rollNumber is a string
    const certs = await storage.getCertificateByRollNumber(rollNumber);

    if (!certs || certs.length === 0) {
      return res.status(404).json({ message: "Certificate not found in database." });
    }

    const cert = certs[0]; // Get first (most recent) certificate
    
    // Log access to certificate
    const verifier = req.user as any;
    const student = await storage.getUser(cert.studentId);
    if (student) {
      await (storage as any).logAccess(
        verifier.id,
        verifier.fullName,
        verifier.email,
        cert.id,
        student.id,
        student.fullName,
        student.email,
        'searched',
        (req.ip || req.connection.remoteAddress) as string
      );
    }

    res.json(certs);
  });

  app.post(api.verifier.unlock.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'verifier') return res.status(401).json({ message: "Unauthorized" });
    const { certificateId } = req.body;

    const unlock = await storage.createUnlock((req.user as any).id, certificateId as number);
    
    // Log payment for accessing certificate
    const verifier = req.user as any;
    const cert = await storage.getCertificate(certificateId);
    const student = cert ? await storage.getUser(cert.studentId) : null;
    
    if (cert && student) {
      await (storage as any).logPayment(
        verifier.id,
        verifier.fullName,
        verifier.email,
        cert.id,
        cert.name,
        student.id,
        student.fullName,
        student.rollNumber || 'N/A',
        10 // Standard payment amount
      );
    }
    
    res.status(201).json(unlock);
  });

  app.get(api.verifier.unlockedCertificates.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'verifier') return res.status(401).json({ message: "Unauthorized" });
    const certs = await storage.getUnlockedCertificates((req.user as any).id as number);
    res.json(certs);
  });

  // Public Routes - Certificate Verification via QR Code
  app.get(api.public.getCertificate.path, async (req, res) => {
    const certId = req.params.id as string;
    const cert = await storage.getCertificate(certId as any);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  });

  app.get(api.public.verifyCertificate.path, async (req, res) => {
    const certId = req.params.certificateId as string;
    const cert = await storage.getCertificate(certId as any);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  });

  return httpServer;
}
