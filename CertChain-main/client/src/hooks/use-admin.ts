import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCertificate } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pendingUsersQuery = useQuery({
    queryKey: [api.admin.pendingUsers.path],
    queryFn: async () => {
      const res = await fetch(api.admin.pendingUsers.path);
      if (!res.ok) throw new Error("Failed to fetch pending users");
      return api.admin.pendingUsers.responses[200].parse(await res.json());
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const url = buildUrl(api.admin.approveUser.path, { id: userId });
      const res = await fetch(url, { method: api.admin.approveUser.method });
      if (!res.ok) throw new Error("Failed to approve user");
      return api.admin.approveUser.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingUsers.path] });
      toast({ title: "Success", description: "User approved successfully" });
    },
  });

  const issueCertificateMutation = useMutation({
    mutationFn: async (data: InsertCertificate) => {
      const res = await fetch(api.admin.issueCertificate.path, {
        method: api.admin.issueCertificate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to issue certificate");
      }
      return api.admin.issueCertificate.responses[201].parse(await res.json());
    },
    onSuccess: (cert) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.analytics.path] });
      toast({ 
        title: "Success", 
        description: `Certificate issued to ${cert.name}. You can now download the PDF.` 
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to issue certificate";
      if (message.includes("already exists")) {
        toast({ 
          title: "Certificate Exists", 
          description: "A certificate already exists for this roll number.",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Error", 
          description: message,
          variant: "destructive"
        });
      }
    }
  });

  const downloadCertificateMutation = useMutation({
    mutationFn: async (certId: number) => {
      const res = await fetch(`/api/admin/certificate/${certId}/download`);
      if (!res.ok) throw new Error("Failed to download certificate");
      const blob = await res.blob();
      return { blob, filename: res.headers.get('content-disposition')?.split('filename="')[1]?.split('"')[0] || `certificate-${certId}.pdf` };
    },
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Downloaded", description: "Certificate PDF downloaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to download certificate", variant: "destructive" });
    }
  });

  return {
    pendingUsers: pendingUsersQuery,
    approveUser: approveUserMutation,
    issueCertificate: issueCertificateMutation,
    downloadCertificate: downloadCertificateMutation,
  };
}
