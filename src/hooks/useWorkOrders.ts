import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceAPI, WorkOrderFilters, CreateWorkOrderData } from '@/lib/api/maintenance';
import { useToast } from '@/hooks/use-toast';

export const useWorkOrders = (filters?: WorkOrderFilters) => {
  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => MaintenanceAPI.listWorkOrders(filters),
  });
};

export const useWorkOrder = (id?: string) => {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: () => id ? MaintenanceAPI.getWorkOrder(id) : null,
    enabled: !!id,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateWorkOrderData) => MaintenanceAPI.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Work order created",
        description: "Maintenance work order has been created successfully.",
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

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkOrderData> }) =>
      MaintenanceAPI.updateWorkOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order'] });
      toast({
        title: "Work order updated",
        description: "Work order has been updated successfully.",
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

export const useStartWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => MaintenanceAPI.startWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order'] });
      toast({
        title: "Work order started",
        description: "Work has begun on this order.",
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

export const useCompleteWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, totalCost }: { id: string; totalCost?: number }) =>
      MaintenanceAPI.completeWorkOrder(id, totalCost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order'] });
      toast({
        title: "Work order completed",
        description: "Work order has been marked as completed.",
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

export const useCancelWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      MaintenanceAPI.cancelWorkOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order'] });
      toast({
        title: "Work order cancelled",
        description: "Work order has been cancelled.",
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

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => MaintenanceAPI.deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Work order deleted",
        description: "Work order has been deleted successfully.",
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

export const useMaintenanceStats = () => {
  return useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: () => MaintenanceAPI.getMaintenanceStats(),
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, correction, actualHours }: { id: string; correction: string; actualHours?: number }) =>
      MaintenanceAPI.completeTask(id, correction, actualHours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order'] });
      toast({
        title: "Task completed",
        description: "Task has been marked as completed.",
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
