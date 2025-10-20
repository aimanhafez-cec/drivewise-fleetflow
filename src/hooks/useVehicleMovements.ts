import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FleetOperationsAPI, MovementFilters, CreateMovementData } from '@/lib/api/fleet-operations';
import { useToast } from '@/hooks/use-toast';

export const useVehicleMovements = (filters?: MovementFilters) => {
  return useQuery({
    queryKey: ['vehicle-movements', filters],
    queryFn: () => FleetOperationsAPI.listMovements(filters),
  });
};

export const useVehicleMovement = (id?: string) => {
  return useQuery({
    queryKey: ['vehicle-movement', id],
    queryFn: () => id ? FleetOperationsAPI.getMovement(id) : null,
    enabled: !!id,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateMovementData) => FleetOperationsAPI.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      toast({
        title: "Movement created",
        description: "Vehicle movement has been created successfully.",
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

export const useUpdateMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMovementData> }) =>
      FleetOperationsAPI.updateMovement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-movement'] });
      toast({
        title: "Movement updated",
        description: "Vehicle movement has been updated successfully.",
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

export const useSubmitMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => FleetOperationsAPI.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-movement'] });
      toast({
        title: "Movement submitted",
        description: "Movement has been submitted for approval.",
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

export const useApproveMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => FleetOperationsAPI.approveMovement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-movement'] });
      toast({
        title: "Movement approved",
        description: "Movement has been approved successfully.",
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

export const useRejectMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      FleetOperationsAPI.rejectMovement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-movement'] });
      toast({
        title: "Movement rejected",
        description: "Movement has been rejected.",
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

export const useCompleteMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => FleetOperationsAPI.completeMovement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-movement'] });
      toast({
        title: "Movement completed",
        description: "Movement has been marked as completed.",
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

export const useDeleteMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => FleetOperationsAPI.deleteMovement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-movements'] });
      toast({
        title: "Movement deleted",
        description: "Vehicle movement has been deleted successfully.",
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

export const useMovementStats = () => {
  return useQuery({
    queryKey: ['movement-stats'],
    queryFn: () => FleetOperationsAPI.getMovementStats(),
  });
};
