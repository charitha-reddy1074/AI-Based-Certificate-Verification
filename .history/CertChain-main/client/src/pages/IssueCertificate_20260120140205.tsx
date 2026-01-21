import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useForm } from "react-hook-form";
import { Loader2, Upload, Award, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { certificateContract } from "@/utils/contract";
import { initWeb3Storage, uploadToIPFS } from "@/utils/ipfs";
import { useToast } from "@/hooks/use-toast";

interface CertificateFormData {
  certId: string;
  studentName: string;
  course: string;
  pdfFile: FileList;
}

export default function IssueCertificate() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<CertificateFormData>();
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      setLoading(true);
      const address = await certificateContract.connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CertificateFormData) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!data.pdfFile || data.pdfFile.length === 0) {
      toast({
        title: "No PDF Selected",
        description: "Please select a certificate PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Initialize Web3.Storage
      const web3Token = process.env.REACT_APP_WEB3_STORAGE_TOKEN;
      if (!web3Token) {
        throw new Error("Web3.Storage token not configured");
      }
      initWeb3Storage(web3Token);

      // Upload PDF to IPFS
      const pdfFile = data.pdfFile[0];
      const ipfsHash = await uploadToIPFS(pdfFile);

      toast({
        title: "PDF Uploaded",
        description: "Certificate PDF uploaded to IPFS successfully",
      });

      // Issue certificate on blockchain
      const tx = await certificateContract.issueCertificate(
        data.certId,
        data.studentName,
        data.course,
        ipfsHash
      );

      toast({
        title: "Certificate Issued",
        description: `Certificate ${data.certId} issued on blockchain`,
      });

      // Reset form
      setLocation("/admin");

    } catch (error: any) {
      console.error("Error issuing certificate:", error);
      toast({
        title: "Issuance Failed",
        description: error.message || "Failed to issue certificate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Issue Blockchain Certificate</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Wallet Connection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                MetaMask Connection
              </CardTitle>
              <CardDescription>
                Connect your MetaMask wallet to issue certificates on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!walletConnected ? (
                <Button
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Award className="w-4 h-4 mr-2" />
                  )}
                  Connect MetaMask
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Connected</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificate Form */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                Fill in the certificate information and upload the PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certId">Certificate ID</Label>
                    <Input
                      id="certId"
                      {...register("certId", { required: "Certificate ID is required" })}
                      placeholder="e.g., CERT-2024-001"
                    />
                    {errors.certId && (
                      <p className="text-sm text-destructive mt-1">{errors.certId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      {...register("studentName", { required: "Student name is required" })}
                      placeholder="Full name of the student"
                    />
                    {errors.studentName && (
                      <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="course">Course/Program</Label>
                  <Input
                    id="course"
                    {...register("course", { required: "Course is required" })}
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                  {errors.course && (
                    <p className="text-sm text-destructive mt-1">{errors.course.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pdfFile">Certificate PDF</Label>
                  <div className="mt-1">
                    <Input
                      id="pdfFile"
                      type="file"
                      accept=".pdf"
                      {...register("pdfFile")}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload the certificate PDF file that will be stored on IPFS
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !walletConnected}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Issuing Certificate...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}