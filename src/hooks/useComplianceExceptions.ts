import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ComplianceExceptionsAPI,
  ComplianceException,
  ExceptionFilters,
  CreateExceptionData,
  ResolveExceptionData,
  BulkExceptionAction,
} from "@/lib/api/complianceExceptions";
import { toast } from "sonner";

export const useComplianceExceptions = (filters?: ExceptionFilters) => {
  return useQuery({
    queryKey: ["compliance-exceptions", filters],
    queryFn: () => ComplianceExceptionsAPI.list(filters),
  });
};

export const useComplianceException = (id?: string) => {
  return useQuery({
    queryKey: ["compliance-exception", id],
    queryFn: () => ComplianceExceptionsAPI.get(id!),
    enabled: !!id,
  });
};

export const useExceptionStatistics = (filters?: ExceptionFilters) => {
  return useQuery({
    queryKey: ["exception-statistics", filters],
    queryFn: () => ComplianceExceptionsAPI.getStatistics(filters),
  });
};

export const useCreateException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExceptionData) => ComplianceExceptionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success("Exception created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create exception");
      console.error(error);
    },
  });
};

export const useUpdateException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExceptionData> }) =>
      ComplianceExceptionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-exception"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success("Exception updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update exception");
      console.error(error);
    },
  });
};

export const useDeleteException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ComplianceExceptionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success("Exception deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete exception");
      console.error(error);
    },
  });
};

export const useResolveException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: ResolveExceptionData }) =>
      ComplianceExceptionsAPI.resolve(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-exception"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success("Exception resolved");
    },
    onError: (error) => {
      toast.error("Failed to resolve exception");
      console.error(error);
    },
  });
};

export const useAssignException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigned_to }: { id: string; assigned_to: string }) =>
      ComplianceExceptionsAPI.assign(id, assigned_to),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-exception"] });
      toast.success("Exception assigned");
    },
    onError: (error) => {
      toast.error("Failed to assign exception");
      console.error(error);
    },
  });
};

export const useMarkExceptionUnderReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ComplianceExceptionsAPI.markUnderReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-exception"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success("Exception marked as under review");
    },
    onError: (error) => {
      toast.error("Failed to mark exception as under review");
      console.error(error);
    },
  });
};

export const useBulkExceptionAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: BulkExceptionAction) =>
      ComplianceExceptionsAPI.bulkAction(action),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
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

export const useDetectExceptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ComplianceExceptionsAPI.detectExceptions(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["exception-statistics"] });
      toast.success(
        `Exception detection completed: ${result.created} new exceptions found`
      );
      if (result.errors.length > 0) {
        console.error("Detection errors:", result.errors);
      }
    },
    onError: (error) => {
      toast.error("Exception detection failed");
      console.error(error);
    },
  });
};
