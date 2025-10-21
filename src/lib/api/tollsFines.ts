import { supabase } from "@/integrations/supabase/client";

export interface TollFineRecord {
  id: string;
  toll_fine_no: string;
  vehicle_id?: string;
  driver_id?: string;
  customer_id?: string;
  contract_id?: string;
  type: 'toll' | 'fine';
  category: string;
  amount: number;
  currency: string;
  penalty_amount?: number;
  total_amount: number;
  incident_date: string;
  incident_time?: string;
  location?: string;
  gate_id?: string;
  plate_number?: string;
  status: 'pending' | 'acknowledged' | 'paid' | 'disputed' | 'closed';
  external_reference_no?: string;
  issuing_authority: string;
  violation_code?: string;
  due_date?: string;
  paid_date?: string;
  payment_reference?: string;
  responsibility?: 'customer' | 'company' | 'driver';
  billable_to_contract: boolean;
  integration_source?: string;
  sync_status: 'manual' | 'synced' | 'pending' | 'failed';
  last_sync_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TollFineFilters {
  type?: 'toll' | 'fine';
  status?: string;
  vehicle_id?: string;
  customer_id?: string;
  contract_id?: string;
  issuing_authority?: string;
  date_from?: string;
  date_to?: string;
  responsibility?: 'customer' | 'company' | 'driver';
  sync_status?: string;
  search?: string;
}

export interface CreateTollFineData {
  vehicle_id?: string;
  driver_id?: string;
  customer_id?: string;
  contract_id?: string;
  type: 'toll' | 'fine';
  category: string;
  amount: number;
  penalty_amount?: number;
  incident_date: string;
  incident_time?: string;
  location?: string;
  gate_id?: string;
  plate_number?: string;
  issuing_authority: string;
  violation_code?: string;
  external_reference_no?: string;
  due_date?: string;
  responsibility?: 'customer' | 'company' | 'driver';
  billable_to_contract?: boolean;
  integration_source?: string;
  notes?: string;
}

export interface BulkTollFineAction {
  ids: string[];
  action: 'acknowledge' | 'pay' | 'dispute' | 'close' | 'assign_responsibility' | 'link_contract';
  data?: {
    responsibility?: 'customer' | 'company' | 'driver';
    contract_id?: string;
    payment_reference?: string;
    notes?: string;
  };
}

export interface TollFineStatistics {
  total_count: number;
  pending_count: number;
  paid_count: number;
  disputed_count: number;
  total_amount: number;
  pending_amount: number;
  tolls_count: number;
  fines_count: number;
  by_authority: { authority: string; count: number; amount: number }[];
  by_vehicle: { vehicle_id: string; count: number; amount: number }[];
}

export class TollsFinesAPI {
  /**
   * List toll/fine records with optional filtering
   */
  static async list(filters?: TollFineFilters): Promise<TollFineRecord[]> {
    let query = supabase
      .from("tolls_fines")
      .select(`
        *,
        vehicle:vehicles(id, plate_number, make, model),
        driver:drivers(id, full_name),
        customer:profiles(id, full_name)
      `)
      .order("incident_date", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.vehicle_id) {
      query = query.eq("vehicle_id", filters.vehicle_id);
    }

    if (filters?.customer_id) {
      query = query.eq("customer_id", filters.customer_id);
    }

    if (filters?.contract_id) {
      query = query.eq("contract_id", filters.contract_id);
    }

    if (filters?.issuing_authority) {
      query = query.eq("issuing_authority", filters.issuing_authority);
    }

    if (filters?.responsibility) {
      query = query.eq("responsibility", filters.responsibility);
    }

    if (filters?.sync_status) {
      query = query.eq("sync_status", filters.sync_status);
    }

    if (filters?.date_from) {
      query = query.gte("incident_date", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("incident_date", filters.date_to);
    }

    if (filters?.search) {
      query = query.or(
        `toll_fine_no.ilike.%${filters.search}%,` +
        `plate_number.ilike.%${filters.search}%,` +
        `external_reference_no.ilike.%${filters.search}%,` +
        `location.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as TollFineRecord[];
  }

  /**
   * Get a single toll/fine record by ID
   */
  static async get(id: string): Promise<TollFineRecord> {
    const { data, error } = await supabase
      .from("tolls_fines")
      .select(`
        *,
        vehicle:vehicles(id, plate_number, make, model, vin),
        driver:drivers(id, full_name, license_no),
        customer:profiles(id, full_name, email)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as TollFineRecord;
  }

  /**
   * Create a new toll/fine record
   */
  static async create(data: CreateTollFineData): Promise<TollFineRecord> {
    const totalAmount = (data.amount || 0) + (data.penalty_amount || 0);

    const { data: record, error } = await supabase
      .from("tolls_fines")
      .insert({
        ...data,
        total_amount: totalAmount,
        currency: 'AED',
        status: 'pending',
        sync_status: data.integration_source ? 'synced' : 'manual',
      })
      .select()
      .single();

    if (error) throw error;
    return record as TollFineRecord;
  }

  /**
   * Update a toll/fine record
   */
  static async update(
    id: string,
    updates: Partial<CreateTollFineData>
  ): Promise<TollFineRecord> {
    const { data, error } = await supabase
      .from("tolls_fines")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as TollFineRecord;
  }

  /**
   * Delete a toll/fine record
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("tolls_fines")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Acknowledge toll/fine records
   */
  static async acknowledge(id: string, notes?: string): Promise<TollFineRecord> {
    return this.update(id, {
      status: 'acknowledged',
      notes,
    } as any);
  }

  /**
   * Mark toll/fine as paid
   */
  static async markPaid(
    id: string,
    payment_reference: string,
    paid_date?: string
  ): Promise<TollFineRecord> {
    return this.update(id, {
      status: 'paid',
      payment_reference,
      paid_date: paid_date || new Date().toISOString().split('T')[0],
    } as any);
  }

  /**
   * Dispute a toll/fine
   */
  static async dispute(id: string, notes: string): Promise<TollFineRecord> {
    return this.update(id, {
      status: 'disputed',
      notes,
    } as any);
  }

  /**
   * Close a toll/fine
   */
  static async close(id: string, notes?: string): Promise<TollFineRecord> {
    return this.update(id, {
      status: 'closed',
      notes,
    } as any);
  }

  /**
   * Bulk operations on toll/fine records
   */
  static async bulkAction(action: BulkTollFineAction): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of action.ids) {
      try {
        switch (action.action) {
          case 'acknowledge':
            await this.acknowledge(id, action.data?.notes);
            break;
          case 'pay':
            await this.markPaid(
              id,
              action.data?.payment_reference || 'BULK-' + Date.now(),
              new Date().toISOString().split('T')[0]
            );
            break;
          case 'dispute':
            await this.dispute(id, action.data?.notes || 'Disputed');
            break;
          case 'close':
            await this.close(id, action.data?.notes);
            break;
          case 'assign_responsibility':
            if (action.data?.responsibility) {
              await this.update(id, { responsibility: action.data.responsibility } as any);
            }
            break;
          case 'link_contract':
            if (action.data?.contract_id) {
              await this.update(id, {
                contract_id: action.data.contract_id,
                billable_to_contract: true,
              } as any);
            }
            break;
        }
        success++;
      } catch (error) {
        console.error(`Failed to process ${id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Get statistics for tolls and fines
   */
  static async getStatistics(filters?: TollFineFilters): Promise<TollFineStatistics> {
    const records = await this.list(filters);

    const stats: TollFineStatistics = {
      total_count: records.length,
      pending_count: records.filter(r => r.status === 'pending').length,
      paid_count: records.filter(r => r.status === 'paid').length,
      disputed_count: records.filter(r => r.status === 'disputed').length,
      total_amount: records.reduce((sum, r) => sum + r.total_amount, 0),
      pending_amount: records
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + r.total_amount, 0),
      tolls_count: records.filter(r => r.type === 'toll').length,
      fines_count: records.filter(r => r.type === 'fine').length,
      by_authority: [],
      by_vehicle: [],
    };

    // Group by authority
    const byAuthority = new Map<string, { count: number; amount: number }>();
    records.forEach(r => {
      const existing = byAuthority.get(r.issuing_authority) || { count: 0, amount: 0 };
      byAuthority.set(r.issuing_authority, {
        count: existing.count + 1,
        amount: existing.amount + r.total_amount,
      });
    });
    stats.by_authority = Array.from(byAuthority.entries()).map(([authority, data]) => ({
      authority,
      ...data,
    }));

    // Group by vehicle
    const byVehicle = new Map<string, { count: number; amount: number }>();
    records.forEach(r => {
      if (r.vehicle_id) {
        const existing = byVehicle.get(r.vehicle_id) || { count: 0, amount: 0 };
        byVehicle.set(r.vehicle_id, {
          count: existing.count + 1,
          amount: existing.amount + r.total_amount,
        });
      }
    });
    stats.by_vehicle = Array.from(byVehicle.entries()).map(([vehicle_id, data]) => ({
      vehicle_id,
      ...data,
    }));

    return stats;
  }

  /**
   * Sync with external systems (placeholder for integration)
   */
  static async syncWithExternalSystems(provider?: string): Promise<{ synced: number; failed: number }> {
    // This is a placeholder for real integration
    // In production, this would call external APIs (Salik, RTA, etc.)
    console.log('Triggering sync with provider:', provider || 'all');
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { synced: 0, failed: 0 };
  }
}

export const tollsFinesApi = new TollsFinesAPI();
