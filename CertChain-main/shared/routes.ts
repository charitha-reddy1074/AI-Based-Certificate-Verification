import { z } from 'zod';
import { insertUserSchema, insertCertificateSchema, users, certificates, verifierUnlocks } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ email: z.string().email(), password: z.string(), faceDescriptor: z.array(z.number()).optional(), faceImage: z.string().optional() }),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    signup: { method: 'POST' as const, path: '/api/auth/signup', input: insertUserSchema.extend({ faceDescriptor: z.array(z.number()).optional() }), responses: { 201: z.custom<typeof users.$inferSelect>(), 400: errorSchemas.validation } },
    logout: { method: 'POST' as const, path: '/api/auth/logout', responses: { 200: z.object({ message: z.string() }) } },
    me: { method: 'GET' as const, path: '/api/auth/me', responses: { 200: z.custom<typeof users.$inferSelect>(), 401: z.null() } },
  },
  admin: {
    pendingUsers: { method: 'GET' as const, path: '/api/admin/users/pending', responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) } },
    approveUser: { method: 'POST' as const, path: '/api/admin/users/:id/approve', responses: { 200: z.custom<typeof users.$inferSelect>() } },
    blockUser: { method: 'POST' as const, path: '/api/admin/users/:id/block', responses: { 200: z.custom<typeof users.$inferSelect>() } },
    unblockUser: { method: 'POST' as const, path: '/api/admin/users/:id/unblock', responses: { 200: z.custom<typeof users.$inferSelect>() } },
    getStudentsByBatch: { method: 'GET' as const, path: '/api/admin/students/batch/:year', responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) } },
    getAllCertificates: { method: 'GET' as const, path: '/api/admin/certificates/all', responses: { 200: z.array(z.custom<typeof certificates.$inferSelect>()) } },
    issueCertificate: { method: 'POST' as const, path: '/api/admin/certificates', input: z.object({
      studentId: z.union([z.number(), z.string()]).pipe(z.coerce.number()),
      name: z.string(),
      rollNumber: z.string(),
      passingYear: z.union([z.number(), z.string()]).pipe(z.coerce.number()),
      joiningYear: z.union([z.number(), z.string()]).pipe(z.coerce.number()),
      branch: z.string(),
      university: z.string(),
      cgpa: z.string().optional(),
      imageUrl: z.string().optional(),
      txHash: z.string().optional(),
      blockHash: z.string().optional(),
      previousHash: z.string().optional(),
      blockNumber: z.union([z.number(), z.string()]).pipe(z.coerce.number()).optional(),
      qrCode: z.string().optional(),
    }), responses: { 201: z.custom<typeof certificates.$inferSelect>() } },
    bulkUpload: { method: 'POST' as const, path: '/api/admin/certificates/bulk/upload', responses: { 201: z.object({ success: z.boolean(), message: z.string(), uploadedCount: z.number(), failedCount: z.number(), errors: z.array(z.object({ row: z.number(), error: z.string() })) }) } },
    revokeCertificate: { method: 'POST' as const, path: '/api/admin/certificates/:id/revoke', responses: { 200: z.custom<typeof certificates.$inferSelect>() } },
    analytics: { 
      method: 'GET' as const, 
      path: '/api/admin/analytics', 
      responses: { 
        200: z.object({ 
          totalUsers: z.number(),
          totalStudents: z.number(),
          totalVerifiers: z.number(),
          pendingApprovals: z.number(),
          certificatesIssued: z.number(),
          verificationRate: z.number(),
          recentActivity: z.array(z.object({
            id: z.string(),
            type: z.enum(['signup', 'approval', 'certificate_issued', 'verification']),
            user: z.object({ id: z.any(), fullName: z.string(), email: z.string(), role: z.string() }),
            description: z.string(),
            timestamp: z.string(),
            details: z.record(z.any()).optional()
          })),
          recentPayments: z.array(z.object({
            id: z.string(),
            verifier: z.object({ id: z.any(), fullName: z.string(), email: z.string() }),
            certificate: z.object({ id: z.any(), name: z.string(), studentId: z.number() }),
            amount: z.number(),
            timestamp: z.string(),
            certificateDetails: z.object({ studentName: z.string(), rollNumber: z.string() }).optional()
          })),
          accessLogs: z.array(z.object({
            id: z.string(),
            verifier: z.object({ id: z.any(), fullName: z.string(), email: z.string() }),
            certificateId: z.any(),
            studentInfo: z.object({ id: z.any(), fullName: z.string(), email: z.string() }),
            accessTime: z.string(),
            action: z.string(),
            ipAddress: z.string().optional()
          }))
        }) 
      } 
    },
  },
  student: { myCertificates: { method: 'GET' as const, path: '/api/student/certificates', responses: { 200: z.array(z.custom<typeof certificates.$inferSelect>()) } } },
  verifier: {
    search: { method: 'GET' as const, path: '/api/verifier/certificates/search', input: z.object({ rollNumber: z.string() }), responses: { 200: z.array(z.custom<typeof certificates.$inferSelect>()) } },
    unlock: { method: 'POST' as const, path: '/api/verifier/unlock', input: z.object({ certificateId: z.number() }), responses: { 201: z.custom<typeof verifierUnlocks.$inferSelect>() } },
    unlockedCertificates: { method: 'GET' as const, path: '/api/verifier/certificates/unlocked', responses: { 200: z.array(z.custom<typeof certificates.$inferSelect>()) } },
  },
  public: {
    getCertificate: { method: 'GET' as const, path: '/api/public/certificates/:id', responses: { 200: z.custom<typeof certificates.$inferSelect>(), 404: errorSchemas.notFound } },
    verifyCertificate: { method: 'GET' as const, path: '/api/public/verify/:certificateId', responses: { 200: z.custom<typeof certificates.$inferSelect>(), 404: errorSchemas.notFound } },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => { if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value)); });
  }
  return url;
}

// Type exports for frontend hooks
export type InsertUser = z.infer<typeof api.auth.signup.input>;
export type LoginRequest = z.infer<typeof api.auth.login.input>;
export type InsertCertificate = z.infer<typeof api.admin.issueCertificate.input>;
