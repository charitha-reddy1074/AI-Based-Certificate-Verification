import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FaceCapture } from "@/components/FaceCapture";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, AlertCircle, CheckCircle, GraduationCap, ChevronLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<string>("student");
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoginError(null);
    
    if (role === "student" && !faceDescriptor) {
      setLoginError("Face verification is required for student login.");
      return;
    }

    try {
      await login.mutateAsync({
        email: data.email,
        password: data.password,
        faceDescriptor: faceDescriptor || undefined
      });
      
      // Redirect based on role
      if (data.email === "admin@example.com") setLocation("/admin");
      else if (role === "student") setLocation("/student");
      else setLocation("/verifier");
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modern Gradient Header */}
      <header className="bg-gradient-to-r from-background via-primary/5 to-background border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-background" />
              </div>
              <span className="font-bold text-lg text-primary group-hover:text-secondary transition">🎓 Credential Verification</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-primary/10">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-gradient-to-br from-background to-background border-primary/20 shadow-2xl shadow-primary/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Access your credential portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">I am a</Label>
            <Select onValueChange={(val) => setRole(val)} defaultValue="student">
              <SelectTrigger className="bg-background border-border/50 text-foreground">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border/50">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="verifier">Verifier</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground text-sm font-medium">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@university.edu"
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground h-10"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })} 
            />
            {errors.email && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {String(errors.email.message)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground text-sm font-medium">Password</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="Enter your password"
              className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground h-10"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })} 
            />
            {errors.password && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {String(errors.password.message)}
              </div>
            )}
          </div>

          {role === "student" && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Label className="text-foreground text-sm font-medium block">Biometric Verification</Label>
              {faceDescriptor ? (
                <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-sm text-green-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Face captured successfully
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Complete face verification to proceed with login</p>
              )}
              <FaceCapture 
                onCapture={(desc) => {
                  setFaceDescriptor(desc);
                  setLoginError(null);
                }} 
                label="Required for Student Login" 
              />
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-lg font-medium bg-primary hover:bg-primary/90 text-background transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={login.isPending || (!faceDescriptor && role === "student")}
          >
            {login.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-secondary font-semibold hover:text-secondary/80">
              Sign up
            </Link>
          </p>
        </form>
        </Card>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/10 to-background border-t border-primary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 AI-Based Credential Verification System. Built with ❤️ | <Link href="/" className="text-primary hover:text-secondary transition">🏠 Back to Home</Link></p>
        </div>
      </footer>
    </div>
  );
}
