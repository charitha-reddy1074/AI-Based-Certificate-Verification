import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaceCapture } from "@/components/FaceCapture";
import { ThemeToggle } from "@/components/theme-toggle";
import { Loader2, AlertCircle, CheckCircle, GraduationCap, ChevronLeft } from "lucide-react";

export default function Signup() {
  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState("student");
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data: any) => {
    setSignupError(null);
    
    if (data.password !== data.confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }
    if (role === "student" && !faceDescriptor) {
      setSignupError("Face capture is required for students");
      return;
    }

    try {
      await signup.mutateAsync({
        ...data,
        role,
        isApproved: false,
        faceDescriptors: faceDescriptor ? [faceDescriptor] : undefined,
        joinedYear: data.joinedYear ? parseInt(data.joinedYear) : undefined,
        leavingYear: data.leavingYear ? parseInt(data.leavingYear) : undefined,
      });
      setLocation("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      setSignupError(error.message || "Signup failed. Please try again.");
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

      {/* Signup Content */}

      {/* Signup Content */}
      <div className="flex-1 py-12 flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl p-8 bg-gradient-to-br from-background to-background border-primary/20 shadow-2xl shadow-primary/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join the academic verification network</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">I am a</Label>
            <Select onValueChange={setRole} defaultValue="student">
              <SelectTrigger className="bg-input border-border/50 text-foreground">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border/50">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="verifier">Verifier (Company)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Full Name</Label>
              <Input 
                className="bg-input border-border/50 text-foreground h-10" 
                placeholder="John Doe"
                {...register("fullName", { 
                  required: "Full name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" }
                })} 
              />
              {errors.fullName && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.fullName.message)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Email</Label>
              <Input 
                type="email" 
                className="bg-input border-border/50 text-foreground h-10" 
                placeholder="you@example.com"
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
              <Label className="text-foreground text-sm font-medium">Password</Label>
              <Input 
                type="password" 
                className="bg-input border-border/50 text-foreground h-10" 
                placeholder="Min 8 characters"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" }
                })} 
              />
              {errors.password && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.password.message)}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Confirm Password</Label>
              <Input 
                type="password" 
                className="bg-input border-border/50 text-foreground h-10" 
                placeholder="Re-enter password"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords don't match"
                })} 
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  {String(errors.confirmPassword.message)}
                </div>
              )}
            </div>
          </div>

          {role === "student" && (
            <div className="space-y-6 border-t border-border pt-6">
              <h3 className="font-semibold text-lg text-primary">Student Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Roll Number</Label>
                  <Input placeholder="CS2024001234" className="bg-input border-border/50 text-foreground" {...register("rollNumber")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">University Email</Label>
                  <Input placeholder="student@example.edu" className="bg-input border-border/50 text-foreground" {...register("universityEmail")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Joined Year</Label>
                  <Input type="number" className="bg-input border-border/50 text-foreground" {...register("joinedYear")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Leaving Year</Label>
                  <Input type="number" className="bg-input border-border/50 text-foreground" {...register("leavingYear")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">School</Label>
                  <Select onValueChange={(val) => register("school").onChange({ target: { value: val } })}>
                    <SelectTrigger className="bg-input border-border/50 text-foreground">
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/50">
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Branch</Label>
                  <Select onValueChange={(val) => register("branch").onChange({ target: { value: val } })}>
                    <SelectTrigger className="bg-input border-border/50 text-foreground">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/50">
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="AI&ML">AI & ML</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="CS">CS</SelectItem>
                      <SelectItem value="IOT">IOT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">Biometric Enrollment (MFA)</Label>
                <p className="text-xs text-muted-foreground">Required for secure login</p>
                {faceDescriptor ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Face captured successfully
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No face captured yet</p>
                )}
                <FaceCapture 
                  onCapture={(desc) => {
                    setFaceDescriptor(desc);
                    setSignupError(null);
                  }}
                  label="Capture your face for secure login" 
                />
              </div>
            </div>
          )}

          {role === "verifier" && (
            <div className="space-y-6 border-t border-border pt-6">
              <h3 className="font-semibold text-lg text-primary">Verifier Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Company Name</Label>
                  <Input className="bg-input border-border/50 text-foreground" {...register("company")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Position</Label>
                  <Input className="bg-input border-border/50 text-foreground" {...register("position")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Company Email</Label>
                  <Input className="bg-input border-border/50 text-foreground" {...register("companyEmail")} />
                </div>
              </div>
            </div>
          )}

          <Button 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-background font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={signup.isPending || (role === "student" && !faceDescriptor)}
          >
            {signup.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {signupError && (
            <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-sm text-destructive flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          )}
        </form>
        </Card>
      </div>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/10 to-background border-t border-primary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Already have an account? <Link href="/login" className="text-primary hover:text-secondary transition font-semibold">🔐 Sign in</Link></p>
          <p className="mt-3">© 2026 AI-Based Credential Verification System. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
