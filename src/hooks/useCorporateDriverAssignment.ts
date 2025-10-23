import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { corporateDriverAssignmentAPI, type AssignDriverRequest } from '@/lib/api/corporateDriverAssignment';
import { toast } from '@/hooks/use-toast';

export const useDriverAssignmentStats = (agreementId?: string) => {
  return useQuery({
    queryKey: ['driver-assignment-stats', agreementId],
    queryFn: () => corporateDriverAssignmentAPI.getDashboardStats(agreementId),
  });
};

export const useDriverLines = (options?: {
  agreementId?: string;
  search?: string;
  status?: 'all' | 'assigned' | 'not_assigned';
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: ['driver-lines', options],
    queryFn: () => corporateDriverAssignmentAPI.getDriverLines(options),
  });
};

export const useAssignDriverToLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignDriverRequest) => corporateDriverAssignmentAPI.assignDriver(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-assignment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['driver-lines'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers'] });
      toast({
        title: 'Success',
        description: 'Driver assigned successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign driver',
        variant: 'destructive',
      });
    },
  });
};

export const useRemoveDriverFromLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) => corporateDriverAssignmentAPI.removeDriver(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-assignment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['driver-lines'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers'] });
      toast({
        title: 'Success',
        description: 'Driver removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove driver',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDriverAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, updates }: {
      assignmentId: string;
      updates: {
        isPrimary?: boolean;
        assignmentStartDate?: string;
        assignmentEndDate?: string;
        notes?: string;
      };
    }) => corporateDriverAssignmentAPI.updateDriverAssignment(assignmentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-assignment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['driver-lines'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers'] });
      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update assignment',
        variant: 'destructive',
      });
    },
  });
};
