import { supabase } from '@/integrations/supabase/client';

// Types matching database schema
export type CustodyStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed' | 'voided';
export type CustodyReasonCode = 'accident' | 'breakdown' | 'maintenance' | 'damage' | 'other';
export type RatePolicy = 'inherit' | 'prorate' | 'free' | 'special_code';
export type CustodianType = 'customer' | 'driver' | 'originator';

export interface CustodyTransaction {
  id: string;
  custody_no: string;
  agreement_id: string;
  agreement_line_id?: string;
  customer_id: string;
  original_vehicle_id: string;
  replacement_vehicle_id?: string;
  custodian_name: string;
  custodian_type: CustodianType;
  reason_code: CustodyReasonCode;
  incident_date: string;
  incident_narrative?: string;
  effective_from: string;
  expected_return_date?: string;
  actual_return_date?: string;
  rate_policy: RatePolicy;
  special_rate_code?: string;
  branch_id?: string;
  status: CustodyStatus;
  sla_breached: boolean;
  sla_target_approve_by?: string;
  sla_target_handover_by?: string;
  approved_by?: string;
  approved_at?: string;
  closed_by?: string;
  closed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CustodyFilters {
  status?: CustodyStatus[];
  reason_code?: CustodyReasonCode[];
  branch_id?: string;
  customer_id?: string;
  vehicle_id?: string;
  sla_breached?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateCustodyData {
  agreement_id: string;
  agreement_line_id?: string;
  customer_id: string;
  original_vehicle_id: string;
  replacement_vehicle_id?: string;
  custodian_name: string;
  custodian_type: CustodianType;
  reason_code: CustodyReasonCode;
  incident_narrative?: string;
  incident_date: string;
  effective_from: string;
  expected_return_date?: string;
  rate_policy: RatePolicy;
  special_rate_code?: string;
  branch_id?: string;
  notes?: string;
}

export interface CustodyStatistics {
  active_custodies: number;
  pending_approvals: number;
  sla_breaches: number;
  closed_this_period: number;
  avg_duration_days: number;
  sla_compliance_pct: number;
  period_from: string;
  period_to: string;
}

export class ReplacementsAPI {
  // List custody transactions with filters
  static async list(filters: CustodyFilters = {}) {
    let query = supabase
      .from('custody_transactions')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        original_vehicle:vehicles!custody_transactions_original_vehicle_id_fkey(
          id, license_plate, make, model, year
        ),
        replacement_vehicle:vehicles!custody_transactions_replacement_vehicle_id_fkey(
          id, license_plate, make, model, year
        ),
        agreement:agreements(id, agreement_no)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.reason_code && filters.reason_code.length > 0) {
      query = query.in('reason_code', filters.reason_code);
    }

    if (filters.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters.vehicle_id) {
      query = query.or(`original_vehicle_id.eq.${filters.vehicle_id},replacement_vehicle_id.eq.${filters.vehicle_id}`);
    }

    if (filters.sla_breached !== undefined) {
      query = query.eq('sla_breached', filters.sla_breached);
    }

    if (filters.date_from) {
      query = query.gte('effective_from', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('effective_from', filters.date_to);
    }

    if (filters.search) {
      query = query.or(
        `custody_no.ilike.%${filters.search}%,incident_narrative.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CustodyTransaction[];
  }

  // Get single custody transaction
  static async get(id: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .select(`
        *,
        customer:customers(id, name, email, phone),
        original_vehicle:vehicles!custody_transactions_original_vehicle_id_fkey(
          id, license_plate, make, model, year, color, vin
        ),
        replacement_vehicle:vehicles!custody_transactions_replacement_vehicle_id_fkey(
          id, license_plate, make, model, year, color, vin
        ),
        agreement:agreements(id, agreement_no)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Create new custody transaction
  static async create(custodyData: CreateCustodyData) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .insert(custodyData)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Update custody transaction
  static async update(id: string, updates: Partial<CustodyTransaction>) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Approve custody transaction
  static async approve(id: string, approver_id: string, notes?: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'approved',
        approved_by: approver_id,
        approved_at: new Date().toISOString(),
        notes: notes || undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Void custody transaction
  static async reject(id: string, rejector_id: string, rejection_reason: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'voided',
        notes: rejection_reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Activate custody (handover replacement vehicle)
  static async activate(id: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'active',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Return custody (close with return date)
  static async returnVehicle(id: string, actual_return_date: string, notes?: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update({
        actual_return_date,
        notes: notes || undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Close custody transaction
  static async close(id: string, closer_id: string, notes?: string) {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'closed',
        closed_by: closer_id,
        closed_at: new Date().toISOString(),
        notes: notes || undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CustodyTransaction;
  }

  // Delete custody transaction (only if pending)
  static async delete(id: string) {
    const { error } = await supabase
      .from('custody_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get custody statistics
  static async getStatistics(dateFrom?: string, dateTo?: string) {
    const { data, error } = await supabase.rpc('get_custody_statistics', {
      p_date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_date_to: dateTo || new Date().toISOString(),
    });

    if (error) throw error;
    return data as unknown as CustodyStatistics;
  }

  // Check vehicle availability for custody period
  static async checkVehicleAvailability(
    vehicleId: string,
    dateFrom: string,
    dateTo: string
  ) {
    const { data, error } = await supabase.rpc('check_vehicle_custody_availability', {
      p_vehicle_id: vehicleId,
      p_date_from: dateFrom,
      p_date_to: dateTo,
    });

    if (error) throw error;
    return data as boolean;
  }
}
