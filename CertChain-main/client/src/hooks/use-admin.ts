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
      if (!res.ok) throw new Error("Failed to issue certificate");
      return api.admin.issueCertificate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.analytics.path] });
      toast({ title: "Success", description: "Certificate issued on the blockchain" });
    },
  });

  return {
    pendingUsers: pendingUsersQuery,
    approveUser: approveUserMutation,
    issueCertificate: issueCertificateMutation,
  };
}
