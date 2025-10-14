import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CostSheetLine {
  id: string;
  line_no: number;
  vehicle_class_id?: string;
  vehicle_id?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    license_plate?: string;
  };
  vehicle_class?: {
    name: string;
  };
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

export interface CostSheetListItem {
  id: string;
  cost_sheet_no: string;
  version: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface CostSheet {
  id: string;
  quote_id: string;
  version: number;
  cost_sheet_no: string;
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

// Fetch all cost sheets for a quote
export const useCostSheets = (quoteId?: string) => {
  return useQuery({
    queryKey: ['cost-sheets', quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      const { data, error } = await supabase
        .from('quote_cost_sheets')
        .select('id, cost_sheet_no, version, status, created_at, submitted_at, approved_at, approved_by')
        .eq('quote_id', quoteId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as CostSheetListItem[];
    },
    enabled: !!quoteId,
  });
};

// Fetch a single cost sheet by ID
export const useCostSheet = (costSheetId?: string) => {
  return useQuery({
    queryKey: ['cost-sheet', costSheetId],
    queryFn: async () => {
      if (!costSheetId) return null;
      
      const { data, error } = await supabase
        .from('quote_cost_sheets')
        .select(`
          *,
          lines:quote_cost_sheet_lines(
            *,
            vehicle:vehicles(make, model, year, license_plate),
            vehicle_class:categories(name)
          )
        `)
        .eq('id', costSheetId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CostSheet | null;
    },
    enabled: !!costSheetId,
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
      queryClient.invalidateQueries({ queryKey: ['cost-sheets', variables.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
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
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      toast({
        title: 'Cost Sheet Approved',
        description: 'Cost sheet has been auto-approved successfully.',
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
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
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

export const useUpdateCostSheetStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      cost_sheet_id: string;
      status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
    }) => {
      const { data, error } = await supabase
        .from('quote_cost_sheets')
        .update({ status: params.status })
        .eq('id', params.cost_sheet_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      toast({
        title: 'Status Updated',
        description: 'Cost sheet status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update cost sheet status',
        variant: 'destructive',
      });
    },
  });
};
