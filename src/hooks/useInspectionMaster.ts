import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionMasterApi } from '@/lib/api/inspectionMaster';
import type { InspectionType, InspectionMaster } from '@/types/inspection';
import { toast } from 'sonner';

export function useInspectionDashboard() {
  return useQuery({
    queryKey: ['inspection-dashboard'],
    queryFn: () => inspectionMasterApi.getDashboardStats()
  });
}

export function useInspectionSearch(params: any) {
  return useQuery({
    queryKey: ['inspections', params],
    queryFn: () => inspectionMasterApi.searchInspections(params)
  });
}

export function useSmartVinSearch(query: string, inspectionType: InspectionType) {
  return useQuery({
    queryKey: ['smart-vin-search', query, inspectionType],
    queryFn: () => inspectionMasterApi.smartVinSearch(query, inspectionType),
    enabled: query.length >= 2
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: ['inspection', id],
    queryFn: () => inspectionMasterApi.getInspection(id),
    enabled: !!id
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inspectionMasterApi.createInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-dashboard'] });
      toast.success('Inspection created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create inspection');
    }
  });
}

export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InspectionMaster> }) =>
      inspectionMasterApi.updateInspection(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspection', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update inspection');
    }
  });
}

export function useCompleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, signature }: { id: string; signature: any }) =>
      inspectionMasterApi.completeInspection(id, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-dashboard'] });
      toast.success('Inspection completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete inspection');
    }
  });
}

export function useDeleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inspectionMasterApi.deleteInspection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-dashboard'] });
      toast.success('Inspection deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete inspection');
    }
  });
}
