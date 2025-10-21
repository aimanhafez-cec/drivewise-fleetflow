import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TollsFinesAPI,
  TollFineRecord,
  TollFineFilters,
  CreateTollFineData,
  BulkTollFineAction,
} from "@/lib/api/tollsFines";
import { toast } from "sonner";

export const useTollsFines = (filters?: TollFineFilters) => {
  return useQuery({
    queryKey: ["tolls-fines", filters],
    queryFn: () => TollsFinesAPI.list(filters),
  });
};

export const useTollFine = (id?: string) => {
  return useQuery({
    queryKey: ["toll-fine", id],
    queryFn: () => TollsFinesAPI.get(id!),
    enabled: !!id,
  });
};

export const useTollsFinesStatistics = (filters?: TollFineFilters) => {
  return useQuery({
    queryKey: ["tolls-fines-statistics", filters],
    queryFn: () => TollsFinesAPI.getStatistics(filters),
  });
};

export const useCreateTollFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTollFineData) => TollsFinesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine record created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create toll/fine record");
      console.error(error);
    },
  });
};

export const useUpdateTollFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTollFineData> }) =>
      TollsFinesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["toll-fine"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine record updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update toll/fine record");
      console.error(error);
    },
  });
};

export const useDeleteTollFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TollsFinesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine record deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete toll/fine record");
      console.error(error);
    },
  });
};

export const useAcknowledgeTollFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      TollsFinesAPI.acknowledge(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["toll-fine"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine acknowledged");
    },
    onError: (error) => {
      toast.error("Failed to acknowledge toll/fine");
      console.error(error);
    },
  });
};

export const useMarkTollFinePaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payment_reference,
      paid_date,
    }: {
      id: string;
      payment_reference: string;
      paid_date?: string;
    }) => TollsFinesAPI.markPaid(id, payment_reference, paid_date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["toll-fine"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine marked as paid");
    },
    onError: (error) => {
      toast.error("Failed to mark toll/fine as paid");
      console.error(error);
    },
  });
};

export const useDisputeTollFine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      TollsFinesAPI.dispute(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["toll-fine"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success("Toll/fine disputed");
    },
    onError: (error) => {
      toast.error("Failed to dispute toll/fine");
      console.error(error);
    },
  });
};

export const useBulkTollFineAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: BulkTollFineAction) => TollsFinesAPI.bulkAction(action),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success(
        `Bulk action completed: ${result.success} succeeded, ${result.failed} failed`
      );
    },
    onError: (error) => {
      toast.error("Bulk action failed");
      console.error(error);
    },
  });
};

export const useSyncWithExternalSystems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider?: string) => TollsFinesAPI.syncWithExternalSystems(provider),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["tolls-fines"] });
      queryClient.invalidateQueries({ queryKey: ["tolls-fines-statistics"] });
      toast.success(
        `Sync completed: ${result.synced} records synced, ${result.failed} failed`
      );
    },
    onError: (error) => {
      toast.error("Sync with external systems failed");
      console.error(error);
    },
  });
};
