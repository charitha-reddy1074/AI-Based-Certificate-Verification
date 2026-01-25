import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useForm } from "react-hook-form";
import { CheckCircle, Loader2, LogOut, UserPlus, Users, BarChart3, TrendingUp, Award, FileCheck, GraduationCap, Activity, CreditCard, Eye, Clock, User, Mail, MapPin, AlertCircle, CheckCheckIcon, Shield, Zap, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import React from "react";

export default function AdminDashboard() {
  const { pendingUsers, approveUser, issueCertificate, downloadCertificate } = useAdmin();
  const { logout } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const [issuedCertId, setIssuedCertId] = React.useState<number | null>(null);

  // Fetch analytics data with detailed information
  const { data: analytics } = useQuery({
    queryKey: [api.admin.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.admin.analytics.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.admin.analytics.responses[200].parse(await res.json());
    },
  });

  const onIssue = async (data: any) => {
    try {
      const cert = await issueCertificate.mutateAsync({
        ...data,
        studentId: parseInt(data.studentId),
        passingYear: parseInt(data.passingYear),
        joiningYear: parseInt(data.joiningYear),
        qrCode: `CERT-${data.rollNumber}-${Date.now()}`,
      });
      setIssuedCertId(cert.id);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900/5 flex flex-col">
      {/* Modern Header with Gradient */}
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
                <h1 className="text-3xl font-bold text-white">Admin Console</h1>
                <p className="text-sm text-white/70 mt-1">Credential Verification Platform</p>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-10">
        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                Analytics Overview
              </h2>
              <p className="text-muted-foreground mt-2">Real-time system statistics and metrics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <AnalyticsCard 
              icon={<Users className="w-6 h-6" />}
              title="Total Users"
              value={analytics?.totalUsers || 0}
              subtext="Active accounts"
              color="from-blue-600 to-blue-400"
              bgColor="from-blue-500/10 to-blue-500/5"
            />
            <AnalyticsCard 
              icon={<GraduationCap className="w-6 h-6" />}
              title="Students"
              value={analytics?.totalStudents || 0}
              subtext="Enrolled"
              color="from-cyan-600 to-cyan-400"
              bgColor="from-cyan-500/10 to-cyan-500/5"
            />
            <AnalyticsCard 
              icon={<Eye className="w-6 h-6" />}
              title="Verifiers"
              value={analytics?.totalVerifiers || 0}
              subtext="Organizations"
              color="from-violet-600 to-violet-400"
              bgColor="from-violet-500/10 to-violet-500/5"
            />
            <AnalyticsCard 
              icon={<AlertCircle className="w-6 h-6" />}
              title="Pending"
              value={analytics?.pendingApprovals || 0}
              subtext="Awaiting review"
              color="from-amber-600 to-amber-400"
              bgColor="from-amber-500/10 to-amber-500/5"
            />
            <AnalyticsCard 
              icon={<FileCheck className="w-6 h-6" />}
              title="Certificates"
              value={analytics?.certificatesIssued || 0}
              subtext="Issued"
              color="from-green-600 to-green-400"
              bgColor="from-green-500/10 to-green-500/5"
            />
          </div>
        </motion.div>

        {/* Tabs Section with Enhanced Styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="pending" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <TabsList className="bg-gradient-to-r from-muted via-muted/50 to-transparent border border-border/50 rounded-xl shadow-lg backdrop-blur-sm p-1">
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Pending Approvals
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Activity Log
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payments"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="access"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Access Logs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="issue"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Issue Cert
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

          <TabsContent value="pending" className="mt-8">
            {pendingUsers.isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Loader2 className="animate-spin w-10 h-10 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading pending users...</p>
                </div>
              </div>
            ) : pendingUsers.data?.length === 0 ? (
              <div className="text-center py-20 px-8 bg-gradient-to-br from-primary/5 via-blue-500/5 to-background border border-primary/20 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCheckIcon className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending approvals. All users have been reviewed.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingUsers.data?.map((user, idx) => (
                  <motion.div 
                    key={user.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <Card className="p-6 space-y-4 bg-gradient-to-br from-card via-card to-card/50 border-primary/30 hover:border-primary/60 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{user.fullName}</h3>
                          <p className="text-sm text-muted-foreground capitalize bg-primary/10 w-fit px-3 py-1 rounded-full mt-1">{user.role}</p>
                        </div>
                        <UserPlus className="text-primary w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2">
                        <p className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-medium">{user.email}</span></p>
                        {user.role === "student" && <p className="text-sm"><span className="text-muted-foreground">Roll:</span> <span className="text-foreground font-medium">{user.rollNumber || 'N/A'}</span></p>}
                        {user.role === "verifier" && <p className="text-sm"><span className="text-muted-foreground">Company:</span> <span className="text-foreground font-medium">{user.company || 'N/A'}</span></p>}
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg transition-all duration-300 font-semibold"
                        onClick={() => approveUser.mutate(user.id)}
                        disabled={approveUser.isPending}
                      >
                        {approveUser.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve User
                          </>
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-8">
            <Card className="p-8 bg-gradient-to-br from-card via-card to-card/50 border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">User Activity Log</h2>
                  <p className="text-sm text-muted-foreground">Real-time system events and actions</p>
                </div>
              </div>
              {!analytics?.recentActivity || analytics.recentActivity.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity: any, idx: number) => (
                    <motion.div 
                      key={activity.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-4 bg-gradient-to-r from-primary/5 via-blue-500/3 to-transparent rounded-lg border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground capitalize">{activity.type.replace('_', ' ')}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{new Date(activity.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm pl-13">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary/60" />
                          <span className="text-foreground font-medium">{activity.user.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary/60" />
                          <span className="text-muted-foreground">{activity.user.email}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-8">
            <Card className="p-8 bg-gradient-to-br from-card via-card to-card/50 border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Payment Analytics</h2>
                  <p className="text-sm text-muted-foreground">Revenue and transaction tracking</p>
                </div>
              </div>
              {!analytics?.recentPayments || analytics.recentPayments.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No recent payments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.recentPayments.map((payment: any, idx: number) => (
                    <motion.div 
                      key={payment.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-4 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                            <CreditCard className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Payment Processed</h4>
                            <p className="text-sm text-muted-foreground">Certificate verification access</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-green-600 bg-green-500/20 px-4 py-2 rounded-lg">₹{payment.amount}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm pl-13 pt-3 border-t border-green-500/10">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Verifier</p>
                          <p className="font-medium text-foreground">{payment.verifier.fullName}</p>
                          <p className="text-xs text-muted-foreground">{payment.verifier.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Student</p>
                          <p className="font-medium text-foreground">{payment.certificateDetails?.studentName}</p>
                          <p className="text-xs text-muted-foreground">Roll: {payment.certificateDetails?.rollNumber}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(payment.timestamp).toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="access" className="mt-8">
            <Card className="p-8 bg-gradient-to-br from-card via-card to-card/50 border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Security Audit Trail</h2>
                  <p className="text-sm text-muted-foreground">Certificate access logs and IP tracking</p>
                </div>
              </div>
              {!analytics?.accessLogs || analytics.accessLogs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No access logs</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.accessLogs.map((log: any, idx: number) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-4 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-transparent rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <Eye className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Certificate Accessed</h4>
                            <p className="text-sm text-muted-foreground capitalize">Action: {log.action}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{new Date(log.accessTime).toLocaleString()}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm pl-13 pt-3 border-t border-blue-500/10">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Verifier</p>
                          <p className="font-medium text-foreground">{log.verifier.fullName}</p>
                          <p className="text-xs text-muted-foreground">{log.verifier.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Student</p>
                          <p className="font-medium text-foreground">{log.studentInfo.fullName}</p>
                          <p className="text-xs text-muted-foreground">{log.studentInfo.email}</p>
                        </div>
                      </div>
                      {log.ipAddress && <p className="text-xs text-muted-foreground mt-2 bg-muted/30 px-3 py-2 rounded inline-block">🌐 IP: {log.ipAddress}</p>}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="issue" className="mt-8">
            <Card className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-card via-card to-card/50 border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Issue New Certificate</h2>
                  <p className="text-sm text-muted-foreground">Create and deploy certificate to blockchain</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(onIssue)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Student ID</Label>
                    <Input 
                      type="number" 
                      {...register("studentId", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="Enter student database ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Student Name</Label>
                    <Input 
                      {...register("name", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Roll Number</Label>
                    <Input 
                      {...register("rollNumber", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="e.g., CS2021001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">University</Label>
                    <Input 
                      defaultValue="Example University" 
                      {...register("university", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Branch/Department</Label>
                    <Input 
                      {...register("branch", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Joining Year</Label>
                    <Input 
                      type="number" 
                      {...register("joiningYear", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="2021"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">Passing Year</Label>
                    <Input 
                      type="number" 
                      {...register("passingYear", { required: true })} 
                      className="bg-input border-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="2025"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-semibold">QR Code</Label>
                    <Input 
                      defaultValue="AUTO-GENERATED" 
                      disabled 
                      className="bg-muted border-border text-muted-foreground cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <p className="text-sm text-foreground">This will deploy the certificate to the blockchain and generate a QR code automatically.</p>
                  </div>
                </div>

                {issuedCertId && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCheckIcon className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-foreground font-medium">Certificate issued successfully!</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => downloadCertificate.mutate(issuedCertId)}
                      disabled={downloadCertificate.isPending}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadCertificate.isPending ? "Downloading..." : "Download PDF"}
                    </Button>
                  </motion.div>
                )}

                <Button 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                  disabled={issueCertificate.isPending}
                >
                  {issueCertificate.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-5 h-5" />
                      Deploying to Blockchain...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-slate-900/50 via-slate-900/30 to-slate-900/50 border-t border-primary/10 mt-16 py-16 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-primary font-display font-bold text-lg mb-4">
                <Shield className="w-6 h-6" />
                CertChain
              </div>
              <p className="text-muted-foreground text-sm">Decentralized academic credential verification on blockchain.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">📊 Dashboard</li>
                <li className="hover:text-primary transition cursor-pointer">📈 Analytics</li>
                <li className="hover:text-primary transition cursor-pointer">⚙️ Settings</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">✅ Approve Users</li>
                <li className="hover:text-primary transition cursor-pointer">📜 Issue Certificates</li>
                <li className="hover:text-primary transition cursor-pointer">📋 View Reports</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition cursor-pointer">📚 Documentation</li>
                <li className="hover:text-primary transition cursor-pointer">💬 Support</li>
                <li className="hover:text-primary transition cursor-pointer">🟢 System Status</li>
              </ul>
            </motion.div>
          </div>
          <div className="border-t border-primary/10 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2026 AI-Based Credential Verification System. Built with ❤️ | All rights reserved</p>
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
  color,
  bgColor
}: { 
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext: string;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 bg-gradient-to-br ${bgColor} border border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <div className={`text-primary`}>{icon}</div>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500/60 group-hover:text-green-500/100 transition-colors" />
          </div>
          <div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
            <div className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
              {value}
            </div>
          </div>
          <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">{subtext}</p>
        </div>
      </Card>
    </motion.div>
  );
}
