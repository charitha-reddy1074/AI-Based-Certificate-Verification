import { useStudentCertificates } from "@/hooks/use-certificates";
import { useAuth } from "@/hooks/use-auth";
import { CertificateCard } from "@/components/CertificateCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Loader2, GraduationCap, FileText, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { data: certificates, isLoading } = useStudentCertificates();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-gradient-to-r from-background to-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary text-background flex items-center justify-center font-bold text-lg">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">{user?.fullName}</h1>
              <p className="text-xs text-muted-foreground">{user?.rollNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => logout.mutate()} className="text-foreground hover:bg-primary/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">My Credentials</h2>
          <p className="text-muted-foreground mt-2">View and manage your academic certificates</p>
        </div>

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
                <CertificateCard certificate={cert} />
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/20 to-background border-t border-border py-12 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-display font-bold text-lg mb-4">
                <GraduationCap className="w-6 h-6" />
                AI Based Decentralised Academic Credential Verification System
              </div>
              <p className="text-muted-foreground text-sm">View and manage your academic certificates securely.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">My Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">My Certificates</li>
                <li className="hover:text-primary transition cursor-pointer">Profile Settings</li>
                <li className="hover:text-primary transition cursor-pointer">Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">How to Share</li>
                <li className="hover:text-primary transition cursor-pointer">FAQ</li>
                <li className="hover:text-primary transition cursor-pointer">Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Information</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Privacy Policy</li>
                <li className="hover:text-primary transition cursor-pointer">Terms of Use</li>
                <li className="hover:text-primary transition cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">© 2024 AI Based Decentralised Academic Credential Verification System Student Portal. Built by Example University | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
