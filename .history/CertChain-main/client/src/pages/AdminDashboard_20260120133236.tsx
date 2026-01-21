import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useForm } from "react-hook-form";
import { CheckCircle, Loader2, LogOut, UserPlus, Users, BarChart3, TrendingUp, Award, FileCheck, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function AdminDashboard() {
  const { pendingUsers, approveUser, issueCertificate } = useAdmin();
  const { logout } = useAuth();
  const { register, handleSubmit, reset } = useForm();

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: [api.admin.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.admin.analytics.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.admin.analytics.responses[200].parse(await res.json());
    },
  });

  const onIssue = async (data: any) => {
    // Generate simulated block hash
    const blockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    
    try {
      await issueCertificate.mutateAsync({
        ...data,
        studentId: parseInt(data.studentId),
        passingYear: parseInt(data.passingYear),
        joiningYear: parseInt(data.joiningYear),
        qrCode: `CERT-${data.rollNumber}-${Date.now()}`,
      });
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-background p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-background">Admin Dashboard</h1>
              <p className="text-sm text-background/90">System & Analytics Management</p>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Analytics Dashboard */}
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics Overview
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard 
              icon={<Users className="w-6 h-6" />}
              title="Total Users"
              value={analytics?.totalUsers || 0}
              subtext="Registered users"
              color="from-blue-500/20 to-blue-500/5"
            />
            <AnalyticsCard 
              icon={<UserPlus className="w-6 h-6" />}
              title="Pending Approvals"
              value={analytics?.pendingApprovals || 0}
              subtext="Awaiting verification"
              color="from-blue-500/20 to-blue-500/5"
            />
            <AnalyticsCard 
              icon={<FileCheck className="w-6 h-6" />}
              title="Certificates Issued"
              value={analytics?.certificatesIssued || 0}
              subtext="On blockchain"
              color="from-green-500/20 to-green-500/5"
            />
            <AnalyticsCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Verification Rate"
              value={`${analytics?.verificationRate || 0}%`}
              subtext="Success rate"
              color="from-purple-500/20 to-purple-500/5"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-background">Pending Approvals</TabsTrigger>
            <TabsTrigger value="issue" className="data-[state=active]:bg-primary data-[state=active]:text-background">Issue Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.isLoading ? (
                <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
              ) : pendingUsers.data?.length === 0 ? (
                <div className="col-span-full text-center py-16 px-8 bg-gradient-to-br from-muted/30 to-background border border-border/50 rounded-2xl">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">No pending user approvals at this time.</p>
                </div>
              ) : (
                pendingUsers.data?.map((user) => (
                  <Card key={user.id} className="p-6 space-y-4 bg-card border-border hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{user.fullName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                      </div>
                      <UserPlus className="text-primary w-5 h-5" />
                    </div>
                    <div className="text-sm space-y-1 text-foreground">
                      <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                      {user.role === "student" && <p><span className="text-muted-foreground">Roll:</span> {user.rollNumber}</p>}
                      {user.role === "verifier" && <p><span className="text-muted-foreground">Company:</span> {user.company}</p>}
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-background hover:from-primary/90 hover:to-secondary/90"
                      onClick={() => approveUser.mutate(user.id)}
                      disabled={approveUser.isPending}
                    >
                      {approveUser.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        "Approve User"
                      )}
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="issue" className="mt-6">
            <Card className="max-w-2xl mx-auto p-8 bg-card border-border">
              <h2 className="text-2xl font-display mb-6 text-foreground">Issue New Certificate</h2>
              <form onSubmit={handleSubmit(onIssue)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground">Student ID (Internal DB ID)</Label>
                    <Input type="number" {...register("studentId", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Student Name</Label>
                    <Input {...register("name", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Roll Number</Label>
                    <Input {...register("rollNumber", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">University</Label>
                    <Input defaultValue="Example University" {...register("university", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Branch</Label>
                    <Input {...register("branch", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Joining Year</Label>
                    <Input type="number" {...register("joiningYear", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Passing Year</Label>
                    <Input type="number" {...register("passingYear", { required: true })} className="bg-input border-input text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">QR Code Payload</Label>
                    <Input defaultValue="AUTO-GENERATED" disabled className="bg-muted border-border text-muted-foreground" />
                  </div>
                </div>

                <Button className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary text-background hover:from-primary/90 hover:to-secondary/90" disabled={issueCertificate.isPending}>
                  {issueCertificate.isPending ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                  Issue Certificate to Blockchain
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-background via-muted/20 to-background border-t border-border mt-12 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-display font-bold text-lg mb-4">
                <GraduationCap className="w-6 h-6" />
                AI Based Decentralised Academic Credential Verification System
              </div>
              <p className="text-muted-foreground text-sm">Enterprise credential verification platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Dashboard</li>
                <li className="hover:text-primary transition cursor-pointer">Analytics</li>
                <li className="hover:text-primary transition cursor-pointer">Settings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Issue Certificates</li>
                <li className="hover:text-primary transition cursor-pointer">Approve Users</li>
                <li className="hover:text-primary transition cursor-pointer">View Reports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">Documentation</li>
                <li className="hover:text-primary transition cursor-pointer">Contact Admin</li>
                <li className="hover:text-primary transition cursor-pointer">System Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">© 2024 AI Based Decentralised Academic Credential Verification System Admin Panel. Built by Sai Pranay Tadakamalla | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AnalyticsCard({ 
  icon, 
  title, 
  value, 
  subtext, 
  color 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 bg-gradient-to-br ${color} border border-border/60 hover:border-primary/50 transition-all duration-300 group`}>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <div className="text-primary">{icon}</div>
          </div>
          <TrendingUp className="w-4 h-4 text-green-500/60" />
        </div>
        <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
        <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </Card>
    </motion.div>
  );
}
