import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMarkQuoteAccepted = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      winReasonId,
      winLossNotes,
    }: {
      quoteId: string;
      winReasonId: string;
      winLossNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          customer_acceptance_status: "accepted",
          status: "accepted",
          win_reason_id: winReasonId,
          win_loss_notes: winLossNotes,
          approved_at: new Date().toISOString(),
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", data.id] });
      toast({
        title: "Quote Accepted",
        description: "Quote has been marked as accepted by customer.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark quote as accepted:", error);
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to mark quote as accepted",
        variant: "destructive",
      });
    },
  });
};

export const useMarkQuoteRejected = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      lossReasonId,
      winLossNotes,
    }: {
      quoteId: string;
      lossReasonId: string;
      winLossNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          customer_acceptance_status: "rejected",
          status: "declined",
          loss_reason_id: lossReasonId,
          win_loss_notes: winLossNotes,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", data.id] });
      toast({
        title: "Quote Rejected",
        description: "Quote has been marked as rejected by customer.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark quote as rejected:", error);
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to mark quote as rejected",
        variant: "destructive",
      });
    },
  });
};

export const useMarkQuoteWon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      winReasonId,
      winLossNotes,
    }: {
      quoteId: string;
      winReasonId: string;
      winLossNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          status: "won",
          win_reason_id: winReasonId,
          win_loss_notes: winLossNotes,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", data.id] });
      toast({
        title: "Quote Marked as Won",
        description: "Quote has been marked as won.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark quote as won:", error);
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to mark quote as won",
        variant: "destructive",
      });
    },
  });
};

export const useMarkQuoteLost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      quoteId,
      lossReasonId,
      winLossNotes,
    }: {
      quoteId: string;
      lossReasonId: string;
      winLossNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          status: "lost",
          loss_reason_id: lossReasonId,
          win_loss_notes: winLossNotes,
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", data.id] });
      toast({
        title: "Quote Marked as Lost",
        description: "Quote has been marked as lost.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to mark quote as lost:", error);
      toast({
        title: "Failed to Update",
        description: error.message || "Failed to mark quote as lost",
        variant: "destructive",
      });
    },
  });
};
