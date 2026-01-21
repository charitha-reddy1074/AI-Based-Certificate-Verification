import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useStudentCertificates() {
  return useQuery({
    queryKey: [api.student.myCertificates.path],
    queryFn: async () => {
      const res = await fetch(api.student.myCertificates.path);
      if (!res.ok) throw new Error("Failed to fetch certificates");
      return api.student.myCertificates.responses[200].parse(await res.json());
    },
  });
}

export function useVerifier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const unlockedCertificatesQuery = useQuery({
    queryKey: [api.verifier.unlockedCertificates.path],
    queryFn: async () => {
      const res = await fetch(api.verifier.unlockedCertificates.path);
      if (!res.ok) throw new Error("Failed to fetch unlocked certificates");
      return api.verifier.unlockedCertificates.responses[200].parse(await res.json());
    },
  });

  const searchCertificatesMutation = useMutation({
    mutationFn: async (rollNumber: string) => {
      const params = new URLSearchParams({ rollNumber });
      const res = await fetch(`${api.verifier.search.path}?${params}`);
      if (!res.ok) throw new Error("Search failed");
      return api.verifier.search.responses[200].parse(await res.json());
    },
  });

  const unlockCertificateMutation = useMutation({
    mutationFn: async (certificateId: number) => {
      const res = await fetch(api.verifier.unlock.path, {
        method: api.verifier.unlock.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });
      if (!res.ok) throw new Error("Payment/Unlock failed");
      return api.verifier.unlock.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.verifier.unlockedCertificates.path] });
      toast({ title: "Verified", description: "Certificate verified and unlocked successfully!" });
    },
  });

  return {
    unlockedCertificates: unlockedCertificatesQuery,
    search: searchCertificatesMutation,
    unlock: unlockCertificateMutation,
  };
}
