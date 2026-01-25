
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
      console.error('❌ Invalid stored password format. Stored:', stored);
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
    console.error('❌ Password comparison error:', err);
    return false;
  }
}

function euclideanDistance(desc1: number[], desc2: number[]): number {
  // Validate inputs
  if (!Array.isArray(desc1) || !Array.isArray(desc2)) {
    console.warn('Invalid descriptor type:', typeof desc1, typeof desc2);
    return 1.0;
  }
  
  if (desc1.length !== desc2.length) {
    console.warn(`Descriptor length mismatch: ${desc1.length} vs ${desc2.length}`);
    return 1.0;
  }
  
  if (desc1.length === 0) {
    console.warn('Empty descriptors');
    return 1.0;
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = (desc1[i] || 0) - (desc2[i] || 0);
    sum += diff * diff;
  }
  
  const distance = Math.sqrt(sum);
  console.log(`✓ Face match distance: ${distance.toFixed(4)} (threshold: 0.6)`);
  return distance;
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
          const user = await storage.getUserByEmail(email);
          if (!user) {
            console.warn(`Login attempt for non-existent user: ${email}`);
            return done(null, false, { message: "Invalid email or password" });
          }
          
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.warn(`Invalid password for user: ${email}`);
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
      console.log('✅ Admin user created with password: Admin@2026');
    } else {
      // Update existing admin with fresh password hash
      await storage.updateUser('admin@example.com', {
        password: hashedPassword,
      });
      console.log('✅ Admin password reset to: Admin@2026');
    }
  } catch (err) {
    console.log('ℹ️  Admin user seed error:', (err as Error).message);
  }

  // --- API Routes ---

  // Auth: Login
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json(info);

      // MFA Check for Students
      if (user.role === 'student') {
        const faceDescriptor = req.body.faceDescriptor;
        if (!faceDescriptor) {
          return res.status(401).json({ message: "Face verification required" });
        }
        
        // Validate descriptor is array of numbers
        if (!Array.isArray(faceDescriptor) || faceDescriptor.some(v => typeof v !== 'number')) {
          console.warn('Invalid face descriptor format');
          return res.status(401).json({ message: "Invalid face descriptor format" });
        }
        
        console.log(`\nFace verification for user: ${user.email}`);
        console.log(`Incoming descriptor length: ${faceDescriptor.length}`);
        
        // Check against stored descriptors
        let storedDescriptors = user.faceDescriptors as any;
        
        if (!storedDescriptors) {
           return res.status(401).json({ message: "No face data registered" });
        }

        // Normalize to array of arrays
        if (Array.isArray(storedDescriptors) && storedDescriptors.length > 0 && typeof storedDescriptors[0] === 'number') {
           storedDescriptors = [storedDescriptors];
        }

        if (!Array.isArray(storedDescriptors) || storedDescriptors.length === 0) {
           console.error('Invalid stored descriptors:', storedDescriptors);
           return res.status(401).json({ message: "Invalid face data" });
        }

        console.log(`Checking against ${storedDescriptors.length} stored descriptor(s)`);

        // Check if ANY stored descriptor matches the login descriptor
        let match = false;
        let bestDistance = 1.0;
        
        for (let i = 0; i < storedDescriptors.length; i++) {
          const stored = storedDescriptors[i];
          // Ensure stored is array
          if (Array.isArray(stored)) {
            const distance = euclideanDistance(stored, faceDescriptor);
            bestDistance = Math.min(bestDistance, distance);
            
            if (distance < 0.6) {
              match = true;
              console.log(`✓ Face match found at index ${i}`);
              break;
            }
          } else {
            console.warn(`Stored descriptor at index ${i} is not an array:`, typeof stored);
          }
        }

        if (!match) {
          console.log(`✗ Face verification failed. Best distance: ${bestDistance.toFixed(4)} (threshold: 0.6)`);
          return res.status(401).json({ message: "Face verification failed" });
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

      // Auto-approve admin (or seed one). 
      // If email is admin@example.com, make it admin and approved.
      // Else, default student/verifier and not approved.
      
      const hashedPassword = await hashPassword(input.password);
      let role = input.role;
      let isApproved = false;

      // Hardcoded Admin Logic as requested
      if (input.email === 'admin@example.com') {
        role = 'admin';
        isApproved = true;
      }

      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        role: role as "admin" | "student" | "verifier",
        isApproved,
        faceDescriptors: input.faceDescriptor ? [input.faceDescriptor] : null,
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
    const user = await storage.updateUserApproval(Number(req.params.id as string), true);
    
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

    // Simulate Blockchain Hash
    const blockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const previousHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const cert = await storage.createCertificate({
      ...input,
      blockHash,
      previousHash,
      txHash
    });

    // Log certificate issuance activity
    const admin = req.user as any;
    await (storage as any).logActivity(
      'certificate_issued',
      admin.id,
      admin.fullName,
      admin.email,
      'admin',
      `Issued certificate to ${input.name} (${input.rollNumber})`,
      { certificateId: cert.id, studentId: input.studentId, rollNumber: input.rollNumber, txHash: cert.txHash }
    );

    res.status(201).json(cert);
  });

  // Download Certificate PDF
  app.get("/api/admin/certificate/:id/download", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const certId = req.params.id as string;
      const cert = await storage.getCertificateById(Number(certId));
      
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
    // Assuming student can only see their own.
    // For simplicity, we assume req.user.id is the studentId if user is student.
    // Wait, schema certificates.studentId refers to users.id? Yes.
    const certs = await storage.getCertificatesByStudentId((req.user as any).id);
    res.json(certs);
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
    const certId = parseInt(req.params.id as string);
    const cert = await storage.getCertificate(certId);
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  });

  app.get(api.public.verifyCertificate.path, async (req, res) => {
    const certId = req.params.certificateId as string;
    const cert = await storage.getCertificate(parseInt(certId));
    if (!cert) return res.status(404).json({ message: "Certificate not found" });
    res.json(cert);
  });

  return httpServer;
}
