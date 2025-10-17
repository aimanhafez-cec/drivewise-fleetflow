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
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'obsolete';
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
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'obsolete';
  submitted_by?: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  approver?: {
    full_name: string;
    email: string;
  };
  submitter?: {
    full_name: string;
    email: string;
  };
  lines?: CostSheetLine[];
}

// Fetch all cost sheets for a quote or agreement
export const useCostSheets = (entityId?: string, entityType: 'quote' | 'agreement' = 'quote') => {
  return useQuery({
    queryKey: ['cost-sheets', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      const column = entityType === 'quote' ? 'quote_id' : 'corporate_leasing_agreement_id';
      
      const { data, error } = await supabase
        .from('quote_cost_sheets')
        .select('id, cost_sheet_no, version, status, created_at, submitted_at, approved_at, approved_by')
        .eq(column, entityId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      return data as CostSheetListItem[];
    },
    enabled: !!entityId,
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
      if (!data) return null;
      
      // Fetch approver and submitter profiles separately
      const profileIds = [data.approved_by, data.submitted_by].filter(Boolean);
      
      let profiles: any = {};
      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', profileIds);
        
        if (profilesData) {
          profiles = profilesData.reduce((acc: any, p: any) => {
            acc[p.id] = { full_name: p.full_name, email: p.email };
            return acc;
          }, {});
        }
      }
      
      return {
        ...data,
        approver: data.approved_by ? profiles[data.approved_by] : undefined,
        submitter: data.submitted_by ? profiles[data.submitted_by] : undefined,
      } as CostSheet;
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
      status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'obsolete';
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

export const useApplyCostSheetRates = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { cost_sheet_id: string }) => {
      const { data, error } = await supabase.functions.invoke('apply-cost-sheet-rates', {
        body: { cost_sheet_id: params.cost_sheet_id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      // Invalidate the specific quote being edited
      if (data.quote_id) {
        queryClient.invalidateQueries({ queryKey: ['quote', data.quote_id] });
      }
      
      toast({
        title: 'Rates Applied Successfully',
        description: `Updated ${data.updated_lines} vehicle line(s) with approved rates.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Apply Rates',
        description: error.message || 'Could not apply rates to vehicle lines',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCostSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { cost_sheet_id: string }) => {
      const { error } = await supabase
        .from('quote_cost_sheets')
        .delete()
        .eq('id', params.cost_sheet_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      toast({
        title: 'Draft Deleted',
        description: 'Cost sheet draft has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete cost sheet',
        variant: 'destructive',
      });
    },
  });
};

// Mark a cost sheet as obsolete
export const useMarkCostSheetObsolete = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      costSheetId, 
      reason 
    }: { 
      costSheetId: string; 
      reason: string;
    }) => {
      // Fetch existing notes
      const { data: existingSheet } = await supabase
        .from('quote_cost_sheets')
        .select('notes_assumptions')
        .eq('id', costSheetId)
        .single();

      const existingNotes = existingSheet?.notes_assumptions || '';
      const timestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('quote_cost_sheets')
        .update({ 
          status: 'obsolete',
          notes_assumptions: `[OBSOLETE - ${timestamp}]\n${reason}\n\n${existingNotes}`
        })
        .eq('id', costSheetId);

      if (error) throw error;
      return { costSheetId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] });
      queryClient.invalidateQueries({ queryKey: ['cost-sheet', data.costSheetId] });
      toast({
        title: 'Cost Sheet Marked Obsolete',
        description: 'The cost sheet has been marked as obsolete due to vehicle line changes.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark cost sheet as obsolete',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCostSheetLines = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      cost_sheet_id: string;
      financing_rate_percent: number;
      line_updates: Array<{
        id: string;
        acquisition_cost_aed?: number;
        maintenance_per_month_aed?: number;
        insurance_per_month_aed?: number;
        registration_admin_per_month_aed?: number;
        other_costs_per_month_aed?: number;
        suggested_rate_per_month_aed?: number;
      }>;
    }) => {
      // Update each line
      for (const update of params.line_updates) {
        const { id, ...fields } = update;
        
        // Fetch current line data to recalculate totals
        const { data: currentLine, error: fetchError } = await supabase
          .from('quote_cost_sheet_lines')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Merge updates with current data
        const updatedLine = { ...currentLine, ...fields };
        
        // Fetch cost sheet for overhead calculation
        const { data: costSheet } = await supabase
          .from('quote_cost_sheets')
          .select('overhead_percent')
          .eq('id', currentLine.cost_sheet_id)
          .single();
        
        const overheadPercent = costSheet?.overhead_percent ?? 8.0;
        
        // Recalculate total_cost_per_month_aed with overhead
        const depreciation = (updatedLine.acquisition_cost_aed * (1 - updatedLine.residual_value_percent / 100)) / updatedLine.lease_term_months;
        const financing = (updatedLine.acquisition_cost_aed * (params.financing_rate_percent / 100)) / 12;
        
        const baseCost = depreciation + financing +
          updatedLine.maintenance_per_month_aed +
          updatedLine.insurance_per_month_aed +
          updatedLine.registration_admin_per_month_aed +
          updatedLine.other_costs_per_month_aed;
        
        const overhead = baseCost * (overheadPercent / 100);
        const total_cost = baseCost + overhead;
        
        // Recalculate actual_margin_percent
        const actual_margin = updatedLine.quoted_rate_per_month_aed > 0
          ? ((updatedLine.quoted_rate_per_month_aed - total_cost) / updatedLine.quoted_rate_per_month_aed) * 100
          : 0;
        
        // Update the line in database
        const { error: updateError } = await supabase
          .from('quote_cost_sheet_lines')
          .update({
            ...fields,
            total_cost_per_month_aed: total_cost,
            actual_margin_percent: actual_margin,
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      return { updated_count: params.line_updates.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheet'] });
      toast({
        title: 'Changes Saved',
        description: `Updated ${data.updated_count} line(s) successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
    },
  });
};
