import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CostSheetLine {
  id: string;
  line_no: number;
  vehicle_class_id?: string;
  vehicle_id?: string;
  lease_term_months: number;
  acquisition_cost_aed: number;
  residual_value_percent: number;
  maintenance_per_month_aed: number;
  insurance_per_month_aed: number;
  registration_admin_per_month_aed: number;
  other_costs_per_month_aed: number;
  total_cost_per_month_aed: number;
  suggested_rate_per_month_aed: number;
  quoted_rate_per_month_aed: number;
  actual_margin_percent: number;
}

export interface CostSheet {
  id: string;
  quote_id: string;
  financing_rate_percent: number;
  overhead_percent: number;
  target_margin_percent: number;
  residual_value_percent: number;
  notes_assumptions?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  submitted_by?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  lines?: CostSheetLine[];
}

export const useCostSheet = (quoteId?: string) => {
  return useQuery({
    queryKey: ['cost-sheet', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      
      const { data, error } = await supabase
        .from('quote_cost_sheets')
        .select('*, lines:quote_cost_sheet_lines(*)')
        .eq('quote_id', quoteId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CostSheet | null;
    },
    enabled: !!quoteId,
  });
};

export const useCalculateCostSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      quote_id: string;
      financing_rate?: number;
      overhead_percent?: number;
      target_margin?: number;
      residual_value_percent?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('calculate-cost-sheet', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheet', variables.quote_id] });
      toast({
        title: 'Cost Sheet Calculated',
        description: 'Cost sheet has been calculated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Calculation Failed',
        description: error.message || 'Failed to calculate cost sheet',
        variant: 'destructive',
      });
    },
  });
};

export const useSubmitCostSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      cost_sheet_id: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('submit-cost-sheet-approval', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      toast({
        title: 'Submitted for Approval',
        description: 'Cost sheet has been submitted for approval.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit cost sheet',
        variant: 'destructive',
      });
    },
  });
};

export const useApproveCostSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      cost_sheet_id: string;
      action: 'approved' | 'rejected';
      comments?: string;
      apply_suggested_rates?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('approve-cost-sheet', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      toast({
        title: variables.action === 'approved' ? 'Cost Sheet Approved' : 'Cost Sheet Rejected',
        description: variables.action === 'approved' 
          ? 'Cost sheet has been approved successfully.' 
          : 'Cost sheet has been rejected.',
        variant: variables.action === 'approved' ? 'default' : 'destructive',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to process cost sheet approval',
        variant: 'destructive',
      });
    },
  });
};