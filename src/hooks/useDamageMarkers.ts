import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createDamageMarker,
  updateDamageMarker,
  deleteDamageMarker,
  getDamageMarkers,
  uploadDamagePhoto,
} from '@/lib/api/damage-markers';
import type { CreateDamageMarkerInput, UpdateDamageMarkerInput } from '@/types/damage-marker';

export function useDamageMarkers(markerIds: string[]) {
  return useQuery({
    queryKey: ['damage-markers', markerIds],
    queryFn: () => getDamageMarkers(markerIds),
    enabled: markerIds.length > 0,
  });
}

export function useCreateDamageMarker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDamageMarker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-markers'] });
      toast.success('Damage marker added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add damage marker: ' + error.message);
    },
  });
}

export function useUpdateDamageMarker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateDamageMarkerInput }) =>
      updateDamageMarker(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-markers'] });
      toast.success('Damage marker updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update damage marker: ' + error.message);
    },
  });
}

export function useDeleteDamageMarker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDamageMarker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-markers'] });
      toast.success('Damage marker deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete damage marker: ' + error.message);
    },
  });
}

export function useUploadDamagePhoto() {
  return useMutation({
    mutationFn: ({ file, markerId }: { file: File; markerId: string }) =>
      uploadDamagePhoto(file, markerId),
    onError: (error: Error) => {
      toast.error('Failed to upload photo: ' + error.message);
    },
  });
}
