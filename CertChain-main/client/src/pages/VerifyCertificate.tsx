import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { CertificateCard } from "@/components/CertificateCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, CheckCircle, XCircle, Home, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Certificate } from "@shared/schema";
import { api } from "@shared/routes";

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [, setLocation] = useLocation();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetch(`/api/public/verify/${certificateId}`);
        if (!res.ok) {
          throw new Error("Certificate not found");
        }
        const data = await res.json();
        setCertificate(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load certificate");
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Verification Failed
            </h3>
            <p className="text-muted-foreground mb-4">
              {error || "Certificate not found"}
            </p>
            <Button onClick={() => setLocation("/")}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900/5 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-primary/90 to-blue-600 text-background p-8 shadow-2xl sticky top-0 z-40 backdrop-blur-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg"></div>
                <div className="relative w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Verify Certificate</h1>
                <p className="text-sm text-white/70 mt-1">Public Verification Service</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation("/")} 
                className="border-white/30 text-white hover:bg-white/20 backdrop-blur-xl transition-all duration-300 font-medium"
              >
                <Home className="w-4 h-4 mr-2" /> 
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-primary" />
            Certificate Verification
          </h2>
          <p className="text-muted-foreground">Verified certificate details below</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Verification Status */}
          <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-6 flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-500/20 flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-600 text-lg mb-1">Certificate Verified</h3>
              <p className="text-green-600/80">
                This certificate has been verified and is authentic.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Certificate ID</p>
                  <p className="font-mono text-green-600 font-bold">{certificate.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued On</p>
                  <p className="font-mono text-green-600 font-bold">
                    {certificate.createdAt ? new Date(certificate.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-semibold text-foreground">{certificate.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Roll Number</p>
                  <p className="font-mono text-foreground font-bold">{certificate.rollNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Preview */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Certificate Details</h3>
            <CertificateCard certificate={certificate} variant="full" />
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-muted/30 border border-border rounded-xl"
            >
              <h4 className="font-semibold text-foreground mb-3">Blockchain Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Block Hash</p>
                  <p className="font-mono text-xs text-primary break-all">{certificate.blockHash}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Previous Hash</p>
                  <p className="font-mono text-xs text-secondary break-all">{certificate.previousHash}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-muted/30 border border-border rounded-xl"
            >
              <h4 className="font-semibold text-foreground mb-3">Academic Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Branch</p>
                  <p className="font-semibold text-foreground">{certificate.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Period</p>
                  <p className="font-semibold text-foreground">
                    {certificate.joiningYear} - {certificate.passingYear}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">University</p>
                  <p className="font-semibold text-foreground">{certificate.university}</p>
                </div>
                {certificate.cgpa && (
                  <div>
                    <p className="text-muted-foreground">CGPA/GPA</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">{certificate.cgpa}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/10 to-background border-t border-primary/10 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 AI-Based Credential Verification System | All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
