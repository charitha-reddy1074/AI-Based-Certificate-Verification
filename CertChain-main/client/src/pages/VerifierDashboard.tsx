import { useState } from "react";
import { useVerifier } from "@/hooks/use-certificates";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CertificateCard } from "@/components/CertificateCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Loader2, LogOut, Lock, GraduationCap, Shield, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifierDashboard() {
  const { search, unlock, unlockedCertificates } = useVerifier();
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await search.mutateAsync(searchTerm);
    setSearchResults(results);
  };

  const handlePayment = async () => {
    if (!selectedCertId) return;
    // Simulate payment processing time
    await new Promise(r => setTimeout(r, 1500)); 
    await unlock.mutateAsync(selectedCertId);
    setSelectedCertId(null);
    setSearchResults([]); // Clear search to show unlocked list update
  };

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
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Verifier Portal</h1>
                <p className="text-sm text-white/70 mt-1">{user?.company}</p>
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

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-12">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 flex items-center gap-3 justify-center">
              <Search className="w-8 h-8 text-primary" />
              Verify Academic Credentials
            </h2>
            <p className="text-muted-foreground mt-2">Search and unlock certificates with instant verification</p>
          </motion.div>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Enter Student Roll Number (e.g. CS2024001234)" 
                className="pl-10 h-12 text-lg bg-input border-input text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-primary text-background hover:bg-primary/90" disabled={search.isPending}>
              {search.isPending ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
          </form>

          {/* Search Results */}
          <div className="grid gap-4 text-left">
            {searchResults.length === 0 && searchTerm && (
              <div className="text-center py-8 px-4">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No certificates found matching your search.</p>
              </div>
            )}
            {searchResults.map((cert) => (
              <div key={cert.id} className="bg-card border-border border p-4 rounded-lg shadow flex justify-between items-center hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-bold text-foreground">{cert.university}</h4>
                  <p className="text-sm text-muted-foreground">Roll: {cert.rollNumber} • {cert.branch}</p>
                </div>
                <Button onClick={() => setSelectedCertId(cert.id)} className="bg-primary text-background hover:bg-primary/90">
                  View Certificate
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Unlocked Certificates */}
        <section>
          <h3 className="text-2xl font-bold mb-6 border-b border-border pb-2 text-foreground">Previously Verified</h3>
          <div className="space-y-6">
            {unlockedCertificates.data?.map((cert, idx) => (
              <motion.div 
                key={cert.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <CertificateCard certificate={cert} />
                <div className="mt-4 space-y-4">
                  {cert.txHash && (
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        <span className="font-semibold text-foreground">TX Hash:</span> {cert.txHash}
                      </p>
                    </div>
                  )}
                  <Button 
                    onClick={() => downloadCertificateFromApi(String(cert.id))}
                    disabled={downloadingCertId === String(cert.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-background font-medium transition-all"
                  >
                    {downloadingCertId === String(cert.id) ? (
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
            {unlockedCertificates.data?.length === 0 && (
              <div className="col-span-full text-center py-16 px-8 bg-gradient-to-br from-muted/30 to-background border border-border/50 rounded-2xl">
                <Lock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates unlocked yet. Use search above to find and unlock certificates.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Payment Simulation Modal */}
      <Dialog open={!!selectedCertId} onOpenChange={() => setSelectedCertId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Unlock Certificate</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A fee of ₹1000 is required to verify and download this certificate from the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg text-center my-4">
            <p className="text-3xl font-bold text-primary">₹1000.00</p>
            <p className="text-sm text-muted-foreground">One-time verification fee</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCertId(null)} className="border-border text-foreground hover:bg-muted">Cancel</Button>
            <Button onClick={handlePayment} className="bg-primary text-background hover:bg-primary/90" disabled={unlock.isPending}>
              {unlock.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Pay & Unlock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <h4 className="font-semibold text-foreground mb-4">Verification</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Instant Verification</li>
                <li className="hover:text-primary transition cursor-pointer">QR Code Scanning</li>
                <li className="hover:text-primary transition cursor-pointer">Blockchain Validation</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Documentation</li>
                <li className="hover:text-primary transition cursor-pointer">Help Center</li>
                <li className="hover:text-primary transition cursor-pointer">Contact</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">About</li>
                <li className="hover:text-primary transition cursor-pointer">Partners</li>
                <li className="hover:text-primary transition cursor-pointer">Blog</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Privacy</li>
                <li className="hover:text-primary transition cursor-pointer">Terms</li>
                <li className="hover:text-primary transition cursor-pointer">Security</li>
              </ul>
            </motion.div>
          </motion.div>
          <div className="border-t border-primary/10 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2026 AI-Based Credential Verification System.| All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
