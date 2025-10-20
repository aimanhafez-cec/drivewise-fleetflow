import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  ReplacementsAPI,
  CustodyTransaction,
  CustodyFilters,
  CreateCustodyData,
  CustodyStatistics,
} from '@/lib/api/replacements';

// Query keys
const QUERY_KEYS = {
  replacements: (filters?: CustodyFilters) => ['replacements', filters],
  replacement: (id: string) => ['replacement', id],
  statistics: (dateFrom?: string, dateTo?: string) => ['replacement-stats', dateFrom, dateTo],
};

// List custody transactions
export const useReplacements = (filters?: CustodyFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.replacements(filters),
    queryFn: () => ReplacementsAPI.list(filters),
  });
};

// Get single custody transaction
export const useReplacement = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.replacement(id),
    queryFn: () => ReplacementsAPI.get(id),
    enabled: !!id,
  });
};

// Get replacement statistics
export const useReplacementStats = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.statistics(dateFrom, dateTo),
    queryFn: () => ReplacementsAPI.getStatistics(dateFrom, dateTo),
  });
};

// Create custody transaction
export const useCreateReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCustodyData) => ReplacementsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Replacement request created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update custody transaction
export const useUpdateReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustodyTransaction> }) =>
      ReplacementsAPI.update(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.replacement(variables.id) });
      toast({
        title: 'Success',
        description: 'Replacement updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Approve custody transaction
export const useApproveReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, approver_id, notes }: { id: string; approver_id: string; notes?: string }) =>
      ReplacementsAPI.approve(id, approver_id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Replacement approved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Reject custody transaction
export const useRejectReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, rejector_id, rejection_reason }: { id: string; rejector_id: string; rejection_reason: string }) =>
      ReplacementsAPI.reject(id, rejector_id, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Replacement Rejected',
        description: 'Replacement request has been rejected',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Activate custody (handover)
export const useActivateReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ReplacementsAPI.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Replacement vehicle handed over',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Return vehicle
export const useReturnReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, actual_return_date, notes }: { id: string; actual_return_date: string; notes?: string }) =>
      ReplacementsAPI.returnVehicle(id, actual_return_date, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Vehicle returned successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Close custody transaction
export const useCloseReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, closer_id, notes }: { id: string; closer_id: string; notes?: string }) =>
      ReplacementsAPI.close(id, closer_id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Replacement closed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Delete custody transaction
export const useDeleteReplacement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ReplacementsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['replacement-stats'] });
      toast({
        title: 'Success',
        description: 'Replacement deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Check vehicle availability
export const useCheckVehicleAvailability = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ vehicleId, dateFrom, dateTo }: { vehicleId: string; dateFrom: string; dateTo: string }) =>
      ReplacementsAPI.checkVehicleAvailability(vehicleId, dateFrom, dateTo),
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
