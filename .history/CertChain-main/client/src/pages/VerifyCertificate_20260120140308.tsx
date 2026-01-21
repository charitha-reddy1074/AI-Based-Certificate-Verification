import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { CertificateCard } from "@/components/CertificateCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, CheckCircle, XCircle, Home, Database, Blocks } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Certificate } from "@shared/schema";
import { api } from "@shared/routes";
import { certificateContract, type Certificate as BlockchainCertificate } from "@/utils/contract";
import { getIPFSUrl } from "@/utils/ipfs";

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [, setLocation] = useLocation();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [blockchainCertificate, setBlockchainCertificate] = useState<BlockchainCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("database");

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

  const verifyBlockchainCertificate = async () => {
    if (!certificateId) return;

    try {
      setBlockchainLoading(true);
      setBlockchainError(null);
      const cert = await certificateContract.verifyCertificate(certificateId);
      setBlockchainCertificate(cert);
    } catch (err: any) {
      setBlockchainError(err.message || "Failed to verify on blockchain");
      setBlockchainCertificate(null);
    } finally {
      setBlockchainLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "blockchain") {
      verifyBlockchainCertificate();
    }
  }, [activeTab, certificateId]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-background to-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-background flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Certificate Verification</h1>
              <p className="text-xs text-muted-foreground">Public Verification Service</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLocation("/")} className="text-foreground hover:bg-primary/10">
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-display font-bold text-primary">
            Certificate Verification
          </h2>
          <p className="text-muted-foreground mt-2">Verify the authenticity of a certificate using database or blockchain</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Verification
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Blocks className="w-4 h-4" />
              Blockchain Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database">
            {renderDatabaseVerification()}
          </TabsContent>

          <TabsContent value="blockchain">
            {renderBlockchainVerification()}
          </TabsContent>
        </Tabs>
      </main>
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
                  This certificate has been verified on the blockchain and is authentic.
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
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/20 to-background border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 AI Based Decentralised Academic Credential Verification System Verification Service. Built by Example University | All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
