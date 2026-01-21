import { useState } from "react";
import { useVerifier } from "@/hooks/use-certificates";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CertificateCard } from "@/components/CertificateCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Loader2, LogOut, Lock, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifierDashboard() {
  const { search, unlock, unlockedCertificates } = useVerifier();
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">Verifier Portal</div>
              <p className="text-sm text-background/80">{user?.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => logout.mutate()} className="border-background text-background hover:bg-background/20">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-12">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-display font-bold text-primary">Verify Academic Credentials</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Enter Student Roll Number (e.g. 2x11CS0x0xxx)" 
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
          <div className="grid md:grid-cols-2 gap-8">
            {unlockedCertificates.data?.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </section>
      </main>

      {/* Payment Simulation Modal */}
      <Dialog open={!!selectedCertId} onOpenChange={() => setSelectedCertId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Unlock Certificate</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A fee of ₹10 is required to verify and download this certificate from the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg text-center my-4">
            <p className="text-3xl font-bold text-primary">₹10.00</p>
            <p className="text-sm text-muted-foreground">One-time verification fee</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCertId(null)} className="border-border text-foreground hover:bg-muted">Cancel</Button>
            <Button onClick={handlePayment} className="bg-gradient-to-r from-primary to-secondary text-background hover:from-primary/90 hover:to-secondary/90" disabled={unlock.isPending}>
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/20 to-background border-t border-border mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-display font-bold text-lg mb-4">
                <GraduationCap className="w-6 h-6" />
                AI Based Decentralised Academic Credential Verification System
              </div>
              <p className="text-muted-foreground text-sm">Verify academic credentials instantly.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instant Verification</li>
                <li>QR Code Scanning</li>
                <li>Blockchain Validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Documentation</li>
                <li className="hover:text-primary transition cursor-pointer">Help Center</li>
                <li className="hover:text-primary transition cursor-pointer">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary transition cursor-pointer">Terms of Service</li>
                <li className="hover:text-primary transition cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">© 2024 AI Based Decentralised Academic Credential Verification System Verifier. Built by Example University | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
