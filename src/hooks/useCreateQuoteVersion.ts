import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createQuoteVersion } from "@/lib/api/quoteVersioning";

export const useCreateQuoteVersion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createQuoteVersion,
    onSuccess: (newQuoteId) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "New Version Created",
        description: "Quote version 2 created. You can now revise the terms.",
      });
      navigate(`/quotes/${newQuoteId}/edit`);
    },
    onError: (error: any) => {
      console.error("Failed to create quote version:", error);
      toast({
        title: "Failed to Create Version",
        description: error.message || "Failed to create new quote version",
        variant: "destructive",
      });
    },
  });
};
