import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleStatusAPI, StatusChangeData } from '@/lib/api/vehicle-status';
import { useToast } from '@/hooks/use-toast';

export const useVehiclesByStatus = () => {
  return useQuery({
    queryKey: ['vehicles-by-status'],
    queryFn: () => VehicleStatusAPI.getVehiclesByStatus(),
  });
};

export const useVehicleHistory = (vehicleId?: string) => {
  return useQuery({
    queryKey: ['vehicle-history', vehicleId],
    queryFn: () => vehicleId ? VehicleStatusAPI.getVehicleHistory(vehicleId) : null,
    enabled: !!vehicleId,
  });
};

export const useVehicleActivityTimeline = (vehicleId?: string) => {
  return useQuery({
    queryKey: ['vehicle-activity', vehicleId],
    queryFn: () => vehicleId ? VehicleStatusAPI.getVehicleActivityTimeline(vehicleId) : null,
    enabled: !!vehicleId,
  });
};

export const useChangeVehicleStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: StatusChangeData) => VehicleStatusAPI.changeVehicleStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles-by-status'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-history'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-activity'] });
      queryClient.invalidateQueries({ queryKey: ['status-counts'] });
      toast({
        title: "Status updated",
        description: "Vehicle status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStatusCounts = () => {
  return useQuery({
    queryKey: ['status-counts'],
    queryFn: () => VehicleStatusAPI.getStatusCounts(),
  });
};

export const useVehiclesNeedingAttention = () => {
  return useQuery({
    queryKey: ['vehicles-needing-attention'],
    queryFn: () => VehicleStatusAPI.getVehiclesNeedingAttention(),
  });
};
