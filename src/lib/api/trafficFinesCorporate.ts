import { supabase } from "@/integrations/supabase/client";

export interface TrafficFineCorporateRecord {
  id: string;
  fine_no: string;
  emirate: string;
  authority_source: string;
  violation_description: string;
  plate_number: string;
  amount: number;
  discount_amount: number;
  final_amount: number;
  black_points: number;
  confiscation_days: number;
  violation_date: string;
  payment_date?: string;
  payment_reference?: string;
  status: 'unpaid' | 'paid' | 'disputed' | 'cancelled';
  agreement_id?: string;
  contract_no?: string;
  customer_id?: string;
  driver_id?: string;
  vehicle_id?: string;
  integration_timestamp?: string;
  reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  contract?: any;
  customer?: any;
  driver?: any;
  vehicle?: any;
}

export interface TrafficFineFilters {
  emirate?: string[];
  status?: string[];
  authority?: string[];
  plate_number?: string;
  vin?: string;
  contract_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  has_confiscation?: boolean;
  linked_to_contract?: boolean;
}

export interface TrafficFineStatistics {
  total_count: number;
  unpaid_count: number;
  paid_count: number;
  disputed_count: number;
  total_amount: number;
  unpaid_amount: number;
  average_amount: number;
  by_emirate: { emirate: string; count: number; amount: number }[];
  by_authority: { authority: string; count: number }[];
  by_status: { status: string; count: number; amount: number }[];
  total_black_points: number;
  vehicles_with_confiscation: number;
}

export class TrafficFinesCorporateAPI {
  /**
   * List traffic fines with optional filtering
   */
  static async list(filters?: TrafficFineFilters): Promise<TrafficFineCorporateRecord[]> {
    let query = (supabase as any)
      .from("traffic_fines_corporate")
      .select(`
        *,
        contract:agreements(id, agreement_no, customer_id),
        customer:profiles!traffic_fines_corporate_customer_id_fkey(id, full_name, email),
        driver:drivers(id, full_name, license_no),
        vehicle:vehicles(id, license_plate, make, model, vin)
      `)
      .order("violation_date", { ascending: false });

    if (filters?.emirate && filters.emirate.length > 0) {
      query = query.in("emirate", filters.emirate);
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }

    if (filters?.authority && filters.authority.length > 0) {
      query = query.in("authority_source", filters.authority);
    }

    if (filters?.plate_number) {
      query = query.ilike("plate_number", `%${filters.plate_number}%`);
    }

    if (filters?.vin) {
      query = query.ilike("vin", `%${filters.vin}%`);
    }

    if (filters?.contract_id) {
      query = query.eq("contract_id", filters.contract_id);
    }

    if (filters?.date_from) {
      query = query.gte("violation_date", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("violation_date", filters.date_to);
    }

    if (filters?.amount_min !== undefined) {
      query = query.gte("amount", filters.amount_min);
    }

    if (filters?.amount_max !== undefined) {
      query = query.lte("amount", filters.amount_max);
    }

    if (filters?.has_confiscation) {
      query = query.gt("confiscation_days", 0);
    }

    if (filters?.linked_to_contract !== undefined) {
      if (filters.linked_to_contract) {
        query = query.not("contract_id", "is", null);
      } else {
        query = query.is("contract_id", null);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as TrafficFineCorporateRecord[];
  }

  /**
   * Get a single traffic fine by ID
   */
  static async get(id: string): Promise<TrafficFineCorporateRecord> {
    const { data, error } = await (supabase as any)
      .from("traffic_fines_corporate")
      .select(`
        *,
        contract:agreements(id, agreement_no, customer_id),
        customer:profiles!traffic_fines_corporate_customer_id_fkey(id, full_name, email, phone),
        driver:drivers(id, full_name, license_no, phone),
        vehicle:vehicles(id, license_plate, make, model, vin, year)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as TrafficFineCorporateRecord;
  }

  /**
   * Get statistics for traffic fines
   */
  static async getStatistics(filters?: TrafficFineFilters): Promise<TrafficFineStatistics> {
    const records = await this.list(filters);

    const stats: TrafficFineStatistics = {
      total_count: records.length,
      unpaid_count: records.filter(r => r.status === 'unpaid').length,
      paid_count: records.filter(r => r.status === 'paid').length,
      disputed_count: records.filter(r => r.status === 'disputed').length,
      total_amount: records.reduce((sum, r) => sum + r.final_amount, 0),
      unpaid_amount: records
        .filter(r => r.status === 'unpaid')
        .reduce((sum, r) => sum + r.final_amount, 0),
      average_amount: records.length > 0 
        ? records.reduce((sum, r) => sum + r.final_amount, 0) / records.length 
        : 0,
      by_emirate: [],
      by_authority: [],
      by_status: [],
      total_black_points: records.reduce((sum, r) => sum + r.black_points, 0),
      vehicles_with_confiscation: records.filter(r => r.confiscation_days > 0).length,
    };

    // Group by emirate
    const byEmirate = new Map<string, { count: number; amount: number }>();
    records.forEach(r => {
      const existing = byEmirate.get(r.emirate) || { count: 0, amount: 0 };
      byEmirate.set(r.emirate, {
        count: existing.count + 1,
        amount: existing.amount + r.final_amount,
      });
    });
    stats.by_emirate = Array.from(byEmirate.entries()).map(([emirate, data]) => ({
      emirate,
      ...data,
    }));

    // Group by authority
    const byAuthority = new Map<string, number>();
    records.forEach(r => {
      byAuthority.set(r.authority_source, (byAuthority.get(r.authority_source) || 0) + 1);
    });
    stats.by_authority = Array.from(byAuthority.entries()).map(([authority, count]) => ({
      authority,
      count,
    }));

    // Group by status
    const byStatus = new Map<string, { count: number; amount: number }>();
    records.forEach(r => {
      const existing = byStatus.get(r.status) || { count: 0, amount: 0 };
      byStatus.set(r.status, {
        count: existing.count + 1,
        amount: existing.amount + r.final_amount,
      });
    });
    stats.by_status = Array.from(byStatus.entries()).map(([status, data]) => ({
      status,
      ...data,
    }));

    return stats;
  }

  /**
   * Simulate integration run (UI only - updates timestamp)
   */
  static async simulateIntegrationRun(): Promise<{ synced: number }> {
    // Update all integration_timestamp fields to now
    const { data, error } = await (supabase as any)
      .from("traffic_fines_corporate")
      .update({ integration_timestamp: new Date().toISOString() })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all
      .select("id");

    if (error) throw error;
    return { synced: data?.length || 0 };
  }
}

export const trafficFinesCorporateApi = TrafficFinesCorporateAPI;
