import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { convertQuoteToCorporateLease } from "@/lib/api/quoteToCorporateLeasing";

export const useConvertQuoteToMasterAgreement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: convertQuoteToCorporateLease,
    onSuccess: (agreementId) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["corporate-leasing"] });
      toast({
        title: "Success",
        description: "Quote converted to Corporate Leasing Agreement",
      });
      navigate(`/corporate-leasing/master-agreements/${agreementId}`);
    },
    onError: (error: any) => {
      console.error("Failed to convert quote:", error);
      toast({
        title: "Conversion Failed",
        description:
          error.message || "Failed to convert quote to master agreement",
        variant: "destructive",
      });
    },
  });
};
