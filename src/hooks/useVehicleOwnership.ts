import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VehicleOwnershipAPI, OwnershipFilters, UpdateOwnershipData } from '@/lib/api/vehicle-ownership';
import { toast } from 'sonner';

export const useVehicleOwnership = (filters?: OwnershipFilters) => {
  return useQuery({
    queryKey: ['vehicle-ownership', filters],
    queryFn: () => VehicleOwnershipAPI.listVehicles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVehicleOwnershipById = (id?: string) => {
  return useQuery({
    queryKey: ['vehicle-ownership', id],
    queryFn: () => VehicleOwnershipAPI.getVehicle(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOwnershipData }) =>
      VehicleOwnershipAPI.updateOwnership(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-ownership'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['ownership-statistics'] });
      toast.success('Vehicle ownership updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update ownership: ${error.message}`);
    },
  });
};

export const useOwnershipStatistics = () => {
  return useQuery({
    queryKey: ['ownership-statistics'],
    queryFn: () => VehicleOwnershipAPI.getStatistics(),
    staleTime: 5 * 60 * 1000,
  });
};
