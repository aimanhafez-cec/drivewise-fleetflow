import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TollTransactionsCorporateAPI,
  TollTransactionFilters,
} from "@/lib/api/tollTransactionsCorporate";
import { toast } from "sonner";

export const useTollTransactionsCorporate = (filters?: TollTransactionFilters) => {
  return useQuery({
    queryKey: ["toll-transactions-corporate", filters],
    queryFn: () => TollTransactionsCorporateAPI.list(filters),
  });
};

export const useTollTransactionCorporate = (id?: string) => {
  return useQuery({
    queryKey: ["toll-transaction-corporate", id],
    queryFn: () => TollTransactionsCorporateAPI.get(id!),
    enabled: !!id,
  });
};

export const useTollTransactionsStatistics = (filters?: TollTransactionFilters) => {
  return useQuery({
    queryKey: ["toll-transactions-corporate-statistics", filters],
    queryFn: () => TollTransactionsCorporateAPI.getStatistics(filters),
  });
};

export const useSimulateTollIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => TollTransactionsCorporateAPI.simulateIntegrationRun(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["toll-transactions-corporate"] });
      queryClient.invalidateQueries({ queryKey: ["toll-transactions-corporate-statistics"] });
      toast.success(`Integration simulation completed - ${result.synced} toll transactions synced`);
    },
    onError: (error) => {
      toast.error("Integration simulation failed");
      console.error(error);
    },
  });
};
