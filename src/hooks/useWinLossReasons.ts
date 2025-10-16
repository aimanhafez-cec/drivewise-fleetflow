import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WinLossReason {
  id: string;
  category: 'WIN' | 'LOSS';
  reason_code: string;
  reason_label: string;
  sort_order: number;
  is_active: boolean;
}

export const useWinReasons = () => {
  return useQuery({
    queryKey: ["win-reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("win_loss_reasons")
        .select("*")
        .eq("category", "WIN")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as WinLossReason[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLossReasons = () => {
  return useQuery({
    queryKey: ["loss-reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("win_loss_reasons")
        .select("*")
        .eq("category", "LOSS")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as WinLossReason[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWinLossReasonById = (id?: string) => {
  return useQuery({
    queryKey: ["win-loss-reason", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("win_loss_reasons")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as WinLossReason;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
