import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Zap, Shield, Lock, Database } from "lucide-react";

export default function Loader() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLocation("/home");
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900/5 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary animated blob */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl"
        />
        {/* Secondary animated blob */}
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl"
        />
        {/* Tertiary animated blob */}
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center"
        variants={containerVariants}
      >
        {/* Animated gradient logo container */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 relative h-40 w-40 flex items-center justify-center mx-auto"
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, linear: true }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50"
          />

          {/* Middle rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, linear: true }}
            className="absolute inset-4 rounded-full border-2 border-transparent border-b-blue-600 border-l-blue-600/50"
          />

          {/* Orbiting elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, linear: true }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div className="absolute top-0">
              <Shield className="w-5 h-5 text-primary" />
            </motion.div>
            <motion.div className="absolute right-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </motion.div>
            <motion.div className="absolute bottom-0">
              <Lock className="w-5 h-5 text-secondary" />
            </motion.div>
            <motion.div className="absolute left-0">
              <Database className="w-5 h-5 text-primary" />
            </motion.div>
          </motion.div>

          {/* Main gradient logo */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)",
                "0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4)",
                "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)",
              ],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="relative z-20 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 flex items-center justify-center shadow-2xl overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, linear: true }}
              className="relative z-10"
            >
              <GraduationCap className="w-14 h-14 text-white drop-shadow-lg" />
            </motion.div>
          </motion.div>

          {/* Pulsing rings around logo */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              animate={{ scale: [1, 1.5], opacity: [1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
              }}
              className="absolute inset-0 rounded-full border-2 border-primary/30"
            />
          ))}
        </motion.div>

        {/* Title with animated gradient text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600 mb-4 tracking-tight"
            animate={{ 
              backgroundPosition: ["0% center", "100% center"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            Verification
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground font-semibold tracking-wide"
          >
            🔐 Secured by Blockchain & AI
          </motion.p>
        </motion.div>

        {/* Advanced morphing dots animation */}
        <motion.div className="flex gap-3 justify-center mb-12 h-12">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3],
                y: [0, -16, 0],
                filter: [
                  "blur(0px) brightness(1)",
                  "blur(0px) brightness(1.2)",
                  "blur(0px) brightness(1)",
                ],
              }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/60"
            />
          ))}
        </motion.div>

        {/* Animated progress bar with flowing gradient */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 w-80 max-w-xs h-1.5 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent overflow-hidden border border-primary/20"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 bg-gradient-to-r from-primary via-blue-600 to-primary"
          />
        </motion.div>

        {/* Status text with pulsing effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-sm font-medium text-muted-foreground"
            >
              🚀 Initializing System
            </motion.span>
            <motion.span
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0, 1, 0] 
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-sm font-medium text-primary"
            >
              ●
            </motion.span>
          </div>
        </motion.div>

        {/* Feature highlights with hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto"
        >
          {[
            { text: "🔒 Secure", icon: Shield },
            { text: "⚡ Fast", icon: Zap },
            { text: "✅ Verified", icon: Lock }
          ].map((feature, i) => (
            <motion.div
              key={feature.text}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-primary/15 to-blue-600/10 border border-primary/30 backdrop-blur-sm hover:border-primary/60 transition-all"
            >
              <p className="text-xs font-bold text-primary">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

     
    </div>
  );
}
