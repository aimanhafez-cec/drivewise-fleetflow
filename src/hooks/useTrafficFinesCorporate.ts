import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrafficFinesCorporateAPI,
  TrafficFineFilters,
} from "@/lib/api/trafficFinesCorporate";
import { toast } from "sonner";

export const useTrafficFinesCorporate = (filters?: TrafficFineFilters) => {
  return useQuery({
    queryKey: ["traffic-fines-corporate", filters],
    queryFn: () => TrafficFinesCorporateAPI.list(filters),
  });
};

export const useTrafficFineCorporate = (id?: string) => {
  return useQuery({
    queryKey: ["traffic-fine-corporate", id],
    queryFn: () => TrafficFinesCorporateAPI.get(id!),
    enabled: !!id,
  });
};

export const useTrafficFinesCorporateStatistics = (filters?: TrafficFineFilters) => {
  return useQuery({
    queryKey: ["traffic-fines-corporate-statistics", filters],
    queryFn: () => TrafficFinesCorporateAPI.getStatistics(filters),
  });
};

export const useSimulateIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => TrafficFinesCorporateAPI.simulateIntegrationRun(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["traffic-fines-corporate"] });
      queryClient.invalidateQueries({ queryKey: ["traffic-fines-corporate-statistics"] });
      toast.success(`Integration simulation completed - ${result.synced} records loaded`);
    },
    onError: (error) => {
      toast.error("Integration simulation failed");
      console.error(error);
    },
  });
};
