import { supabase } from "@/integrations/supabase/client";

export type MovementType = 'ownership_transfer' | 'inter_branch' | 'department_reallocation' | 'third_party';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface VehicleMovement {
  id: string;
  movement_no: string;
  movement_type: MovementType;
  status: ApprovalStatus;
  vehicle_ids: string[];
  from_owner?: string;
  from_branch_id?: string;
  from_department?: string;
  from_cost_center?: string;
  to_owner?: string;
  to_branch_id?: string;
  to_department?: string;
  to_cost_center?: string;
  effective_from: string;
  expected_arrival?: string;
  actual_arrival?: string;
  transport_job_ref?: string;
  carrier_vendor?: string;
  tracking_ref?: string;
  odometer_at_dispatch?: number;
  fuel_level_at_dispatch?: number;
  handover_photos?: any[];
  handover_notes?: string;
  transfer_price?: number;
  cost_center_change?: boolean;
  gl_accounts?: any;
  requires_finance_approval?: boolean;
  reason_code: string;
  reason_description?: string;
  documents?: any[];
  submitted_at?: string;
  submitted_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  completed_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MovementFilters {
  status?: ApprovalStatus[];
  movement_type?: MovementType[];
  from_branch?: string;
  to_branch?: string;
  date_from?: string;
  date_to?: string;
  created_by?: string;
  search?: string;
}

export interface CreateMovementData {
  movement_type: MovementType;
  vehicle_ids: string[];
  from_owner?: string;
  from_branch_id?: string;
  from_department?: string;
  to_owner?: string;
  to_branch_id?: string;
  to_department?: string;
  effective_from: string;
  expected_arrival?: string;
  transport_job_ref?: string;
  carrier_vendor?: string;
  odometer_at_dispatch?: number;
  fuel_level_at_dispatch?: number;
  handover_photos?: any[];
  handover_notes?: string;
  transfer_price?: number;
  requires_finance_approval?: boolean;
  reason_code: string;
  reason_description?: string;
  documents?: any[];
}

export class FleetOperationsAPI {
  // List movements with filters
  static async listMovements(filters?: MovementFilters) {
    let query = supabase
      .from('vehicle_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.movement_type && filters.movement_type.length > 0) {
      query = query.in('movement_type', filters.movement_type);
    }

    if (filters?.from_branch) {
      query = query.eq('from_branch_id', filters.from_branch);
    }

    if (filters?.to_branch) {
      query = query.eq('to_branch_id', filters.to_branch);
    }

    if (filters?.date_from) {
      query = query.gte('effective_from', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('effective_from', filters.date_to);
    }

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters?.search) {
      query = query.or(`movement_no.ilike.%${filters.search}%,reason_description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as VehicleMovement[];
  }

  // Get single movement
  static async getMovement(id: string) {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as VehicleMovement;
  }

  // Create movement
  static async createMovement(data: CreateMovementData) {
    const { data: result, error } = await supabase
      .from('vehicle_movements')
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return result as VehicleMovement;
  }

  // Update movement
  static async updateMovement(id: string, data: Partial<CreateMovementData>) {
    const { data: result, error } = await supabase
      .from('vehicle_movements')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as VehicleMovement;
  }

  // Submit for approval
  static async submitForApproval(id: string) {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .update({
        submitted_at: new Date().toISOString(),
        submitted_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Approve movement
  static async approveMovement(id: string) {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reject movement
  static async rejectMovement(id: string, reason: string) {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: (await supabase.auth.getUser()).data.user?.id,
        rejection_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Complete movement
  static async completeMovement(id: string) {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .update({
        completed_at: new Date().toISOString(),
        actual_arrival: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete movement
  static async deleteMovement(id: string) {
    const { error } = await supabase
      .from('vehicle_movements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get movement statistics
  static async getMovementStats() {
    const { data, error } = await supabase
      .from('vehicle_movements')
      .select('status, movement_type')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(m => m.status === 'pending').length || 0,
      approved: data?.filter(m => m.status === 'approved').length || 0,
      rejected: data?.filter(m => m.status === 'rejected').length || 0,
      byType: {
        ownership_transfer: data?.filter(m => m.movement_type === 'ownership_transfer').length || 0,
        inter_branch: data?.filter(m => m.movement_type === 'inter_branch').length || 0,
        department_reallocation: data?.filter(m => m.movement_type === 'department_reallocation').length || 0,
        third_party: data?.filter(m => m.movement_type === 'third_party').length || 0,
      }
    };

    return stats;
  }
}
