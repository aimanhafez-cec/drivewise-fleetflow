import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgreementLineDriver {
  id: string;
  agreement_id: string;
  line_id: string;
  driver_id: string;
  assignment_start_date: string;
  assignment_end_date?: string;
  is_primary: boolean;
  assigned_by?: string;
  assigned_at: string;
  removed_by?: string;
  removed_at?: string;
  notes?: string;
  
  // Joined driver details
  driver?: {
    id: string;
    full_name: string;
    license_no: string;
    phone?: string;
    email?: string;
    date_of_birth?: string;
    license_expiry?: string;
    status: string;
    additional_driver_fee: number;
  };
}

export interface AssignDriverPayload {
  agreement_id: string;
  line_id: string;
  driver_id: string;
  is_primary: boolean;
  assignment_start_date?: string;
  notes?: string;
}

// Fetch all drivers for an agreement
export const useAgreementDrivers = (agreementId?: string) => {
  return useQuery({
    queryKey: ['agreement-drivers', agreementId],
    queryFn: async () => {
      if (!agreementId) return [];
      
      const { data, error } = await supabase
        .from('corporate_leasing_line_drivers')
        .select(`
          *,
          driver:drivers(*)
        `)
        .eq('agreement_id', agreementId)
        .is('removed_at', null)
        .order('line_id')
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as AgreementLineDriver[];
    },
    enabled: !!agreementId
  });
};

// Fetch drivers for a specific line
export const useLineDrivers = (lineId?: string) => {
  return useQuery({
    queryKey: ['line-drivers', lineId],
    queryFn: async () => {
      if (!lineId) return [];
      
      const { data, error } = await supabase
        .from('corporate_leasing_line_drivers')
        .select(`
          *,
          driver:drivers(*)
        `)
        .eq('line_id', lineId)
        .is('removed_at', null)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as AgreementLineDriver[];
    },
    enabled: !!lineId
  });
};

// Assign driver to line
export const useAssignDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (payload: AssignDriverPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('corporate_leasing_line_drivers')
        .insert({
          agreement_id: payload.agreement_id,
          line_id: payload.line_id,
          driver_id: payload.driver_id,
          is_primary: payload.is_primary,
          assignment_start_date: payload.assignment_start_date || new Date().toISOString().split('T')[0],
          assigned_by: user?.id,
          notes: payload.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers', variables.agreement_id] });
      queryClient.invalidateQueries({ queryKey: ['line-drivers', variables.line_id] });
      toast({
        title: 'Driver Assigned',
        description: 'Driver has been successfully assigned to the vehicle line.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Failed to assign driver to vehicle line.',
        variant: 'destructive'
      });
    }
  });
};

// Remove driver from line
export const useRemoveDriver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ assignmentId, agreementId }: { assignmentId: string; agreementId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('corporate_leasing_line_drivers')
        .update({
          removed_at: new Date().toISOString(),
          removed_by: user?.id
        })
        .eq('id', assignmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers', variables.agreementId] });
      toast({
        title: 'Driver Removed',
        description: 'Driver has been removed from the vehicle line.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Removal Failed',
        description: error.message || 'Failed to remove driver.',
        variant: 'destructive'
      });
    }
  });
};

// Update driver assignment (e.g., make primary)
export const useUpdateDriverAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      agreementId, 
      updates 
    }: { 
      assignmentId: string; 
      agreementId: string; 
      updates: Partial<Pick<AgreementLineDriver, 'is_primary' | 'assignment_end_date' | 'notes'>> 
    }) => {
      const { data, error } = await supabase
        .from('corporate_leasing_line_drivers')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-drivers', variables.agreementId] });
      toast({
        title: 'Assignment Updated',
        description: 'Driver assignment has been updated.'
      });
    }
  });
};
