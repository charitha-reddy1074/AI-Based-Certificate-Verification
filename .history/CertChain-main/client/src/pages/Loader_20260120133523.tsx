import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { GraduationCap } from "lucide-react";

export default function Loader() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLocation("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
            <GraduationCap className="w-16 h-16 text-background" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 text-center"
        >
          AI Based Decentralised Academic Credential Verification System
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-muted-foreground text-center text-lg mb-12 max-w-md"
        >
          Secure. Verifiable. Blockchain-Backed Credentials
        </motion.p>

        {/* Loading animation - Dots */}
        <div className="flex gap-3 justify-center mb-12">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-3 h-3 rounded-full bg-primary"
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full mb-8 w-48"
        />

        {/* Loading text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-muted-foreground text-sm"
        >
          Initializing...
        </motion.p>
      </motion.div>

      {/* Inspirational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-12 left-0 right-0 text-center z-10"
      >
        <p className="text-muted-foreground italic text-sm md:text-base max-w-lg mx-auto px-4">
          "Education is the most powerful weapon to change the world." — Nelson Mandela
        </p>
      </motion.div>
    </div>
  );
}
