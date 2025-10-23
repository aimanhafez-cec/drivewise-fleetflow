import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { corporateVinAssignmentAPI, type AssignVinRequest } from '@/lib/api/corporateVinAssignment';
import { toast } from '@/hooks/use-toast';

export const useVinAssignmentStats = (agreementId?: string) => {
  return useQuery({
    queryKey: ['vin-assignment-stats', agreementId],
    queryFn: () => corporateVinAssignmentAPI.getDashboardStats(agreementId),
  });
};

export const useVehicleLines = (options?: {
  agreementId?: string;
  search?: string;
  status?: 'all' | 'assigned' | 'not_assigned';
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ['vehicle-lines', options],
    queryFn: () => corporateVinAssignmentAPI.getVehicleLines(options),
  });
};

export const useAvailableVins = (itemCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['available-vins', itemCode],
    queryFn: () => corporateVinAssignmentAPI.getAvailableVins(itemCode),
    enabled: enabled && !!itemCode,
  });
};

export const useAssignVin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignVinRequest) => corporateVinAssignmentAPI.assignVin(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vin-assignment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-lines'] });
      toast({
        title: 'Success',
        description: 'VIN assigned successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign VIN',
        variant: 'destructive',
      });
    },
  });
};

export const useUnassignVin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => corporateVinAssignmentAPI.unassignVin(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vin-assignment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-lines'] });
      toast({
        title: 'Success',
        description: 'VIN unassigned successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unassign VIN',
        variant: 'destructive',
      });
    },
  });
};
