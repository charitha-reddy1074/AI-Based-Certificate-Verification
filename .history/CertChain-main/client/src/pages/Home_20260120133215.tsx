import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck, GraduationCap, Lock, ArrowRight, CheckCircle, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-background flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl text-primary tracking-tight">
              AI Based Decentralised Academic Credential Verification System
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-foreground hover:bg-background">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-display font-black text-primary mb-6 leading-tight">
                Secure Academic <br />
                Credential Verification
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Powered by simulated blockchain technology and advanced face recognition MFA. 
                Tamper-proof certificates issued by institutions, verified by employers instantly.
              </p>
              
              <div className="mt-12 flex justify-center gap-4 flex-wrap">
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/40 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-background font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/60">
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold transition-all duration-200">
                    Verify Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-primary mb-4">Why Choose AI Based Decentralised Academic Credential Verification System?</h2>
              <p className="text-muted-foreground text-lg">Enterprise-grade security for academic credentials</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="w-10 h-10 text-secondary" />}
                title="Blockchain Security"
                description="Certificates are hashed and linked in a tamper-proof chain, ensuring absolute authenticity and integrity."
              />
              <FeatureCard 
                icon={<Lock className="w-10 h-10 text-secondary" />}
                title="Biometric MFA"
                description="Advanced face recognition technology adds an unbreakable layer of security to student accounts."
              />
              <FeatureCard 
                icon={<GraduationCap className="w-10 h-10 text-secondary" />}
                title="Instant Verification"
                description="Verifiers can instantly validate credentials via roll number search, QR code scanning, or API integration."
              />
            </div>
          </div>
        </section>

        {/* Inspirational Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-6"
            >
              <p className="text-2xl md:text-3xl font-display italic text-foreground leading-relaxed">
                "Education is the most powerful weapon which you can use to change the world."
              </p>
              <footer className="text-lg text-muted-foreground font-medium">
                — Nelson Mandela
              </footer>
            </motion.blockquote>
            <p className="mt-12 text-muted-foreground text-base max-w-2xl mx-auto">
              AI Based Decentralised Academic Credential Verification System believes in making education credentials secure, verifiable, and universally recognized. 
              We empower students, institutions, and employers with transparency and trust.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/20 to-background border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary font-display font-bold text-lg mb-4">
                <GraduationCap className="w-6 h-6" />
                AI Based Decentralised Academic Credential Verification System
              </div>
              <p className="text-muted-foreground text-sm">Secure academic credential verification powered by blockchain.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary transition">Login</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Blockchain Security</li>
                <li>Face Recognition MFA</li>
                <li>Instant Verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Academic Verification System</li>
                <li>Built by Example University</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">© 2024 AI Based Decentralised Academic Credential Verification System. All rights reserved. | Built with by Example University</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-2xl bg-gradient-to-br from-card/80 to-background border border-border/60 hover:border-primary/50 shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer"
    >
      <div className="mb-6 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-secondary group-hover:scale-125 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
