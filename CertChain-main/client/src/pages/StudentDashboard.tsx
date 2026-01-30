import { useStudentCertificates } from "@/hooks/use-certificates";
import { useAuth } from "@/hooks/use-auth";
import { CertificateCard } from "@/components/CertificateCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Loader2, GraduationCap, FileText, Home, BookOpen, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function StudentDashboard() {
  const { data: certificates, isLoading } = useStudentCertificates();
  const { logout, user } = useAuth();
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const downloadCertificateFromApi = async (certId: string) => {
    try {
      setDownloadingCertId(certId);
      const response = await fetch(`/api/admin/certificate/${certId}/download`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900/5 flex flex-col">
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
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Credentials</h1>
                <p className="text-sm text-white/70 mt-1">{user?.fullName}</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logout.mutate()} 
                className="border-white/30 text-white hover:bg-white/20 backdrop-blur-xl transition-all duration-300 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" /> 
                Logout
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                Your Academic Certificates
              </h2>
              <p className="text-muted-foreground mt-2">View and manage your verified credentials</p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {certificates?.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="space-y-4">
                  <CertificateCard certificate={cert} />
                  <Button 
                    onClick={() => downloadCertificateFromApi(cert.id as string)}
                    disabled={downloadingCertId === cert.id}
                    className="w-full bg-primary hover:bg-primary/90 text-background font-medium transition-all"
                  >
                    {downloadingCertId === cert.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {certificates?.length === 0 && (
              <div className="col-span-full text-center py-16 px-8 bg-gradient-to-br from-muted/30 to-background border border-border/50 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                    <FileText className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-1">You haven't received any certificates yet.</p>
                <p className="text-muted-foreground text-sm">Your certificates will appear here once issued by your institution.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-background via-muted/10 to-background border-t border-primary/10 mt-12 py-12 w-full">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">📚 My Certificates</li>
                <li className="hover:text-primary transition cursor-pointer">⚙️ Settings</li>
                <li className="hover:text-primary transition cursor-pointer">🔒 Security</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">📖 Documentation</li>
                <li className="hover:text-primary transition cursor-pointer">❓ FAQ</li>
                <li className="hover:text-primary transition cursor-pointer">💬 Support</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">📄 Privacy</li>
                <li className="hover:text-primary transition cursor-pointer">⚖️ Terms</li>
                <li className="hover:text-primary transition cursor-pointer">🔐 Security</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">🌐 Website</li>
                <li className="hover:text-primary transition cursor-pointer">📧 Contact</li>
                <li className="hover:text-primary transition cursor-pointer">🔔 Updates</li>
              </ul>
            </motion.div>
          </motion.div>
          <div className="border-t border-primary/10 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2026 AI-Based Credential Verification System. Built with ❤️ | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
