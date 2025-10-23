import { supabase } from "@/integrations/supabase/client";

// Interfaces
export interface TollTransactionCorporateRecord {
  id: string;
  transaction_no: string;
  plate_number: string;
  gate_id: string;
  gate_name: string;
  crossing_date: string;
  crossing_time: string;
  amount: number;
  toll_authority: "Salik" | "Darb";
  emirate: "Dubai" | "Abu Dhabi";
  payment_status: "charged" | "pending" | "failed" | "exempt";
  contract_id?: string;
  contract_no?: string;
  vehicle_id?: string;
  customer_id?: string;
  driver_id?: string;
  reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  billing_cycle_id?: string;
  billable_to_customer: boolean;
  integration_timestamp: string;
  integration_source: string;
  integration_batch_id?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  // Joined relations
  customer?: {
    id: string;
    full_name: string;
    email?: string;
  };
  driver?: {
    id: string;
    full_name: string;
    license_no?: string;
  };
  vehicle?: {
    id: string;
    license_plate: string;
    make?: string;
    model?: string;
    year?: number;
  };
}

export interface TollTransactionFilters {
  payment_status?: string;
  emirate?: string;
  toll_authority?: string;
  plate_number?: string;
  contract_id?: string;
  reconciled?: boolean;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
}

export interface TollTransactionStatistics {
  total_amount: number;
  total_crossings: number;
  by_emirate: {
    Dubai: { count: number; amount: number };
    "Abu Dhabi": { count: number; amount: number };
  };
  by_authority: {
    Salik: { count: number; amount: number };
    Darb: { count: number; amount: number };
  };
  by_status: {
    charged: number;
    pending: number;
    failed: number;
    exempt: number;
  };
  linked_to_contract: number;
  unlinked: number;
  reconciled_count: number;
  unreconciled_count: number;
  avg_amount_per_crossing: number;
  most_used_emirate: string;
  most_used_gate: string;
}

export class TollTransactionsCorporateAPI {
  /**
   * List toll transactions with optional filters
   */
  static async list(
    filters?: TollTransactionFilters
  ): Promise<TollTransactionCorporateRecord[]> {
    let query = supabase
      .from("toll_transactions_corporate")
      .select("*")
      .order("crossing_date", { ascending: false })
      .order("crossing_time", { ascending: false });

    // Apply filters
    if (filters?.payment_status) {
      query = query.eq("payment_status", filters.payment_status);
    }

    if (filters?.emirate) {
      query = query.eq("emirate", filters.emirate);
    }

    if (filters?.toll_authority) {
      query = query.eq("toll_authority", filters.toll_authority);
    }

    if (filters?.plate_number) {
      query = query.ilike("plate_number", `%${filters.plate_number}%`);
    }

    if (filters?.contract_id) {
      query = query.eq("contract_id", filters.contract_id);
    }

    if (filters?.reconciled !== undefined) {
      query = query.eq("reconciled", filters.reconciled);
    }

    if (filters?.date_from) {
      query = query.gte("crossing_date", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("crossing_date", filters.date_to);
    }

    if (filters?.amount_min !== undefined) {
      query = query.gte("amount", filters.amount_min);
    }

    if (filters?.amount_max !== undefined) {
      query = query.lte("amount", filters.amount_max);
    }

    // Search across multiple fields
    if (filters?.search) {
      const searchTerm = filters.search;
      query = query.or(
        `transaction_no.ilike.%${searchTerm}%,plate_number.ilike.%${searchTerm}%,gate_name.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching toll transactions:", error);
      throw error;
    }

    // Fetch related data for joined records
    const records = data || [];
    
    // Extract unique IDs
    const customerIds = [...new Set(records.map(r => r.customer_id).filter(Boolean))];
    const driverIds = [...new Set(records.map(r => r.driver_id).filter(Boolean))];
    const vehicleIds = [...new Set(records.map(r => r.vehicle_id).filter(Boolean))];

    // Fetch related data in parallel
    const [customersData, driversData, vehiclesData] = await Promise.all([
      customerIds.length > 0
        ? supabase.from("profiles").select("id, full_name, email").in("id", customerIds)
        : Promise.resolve({ data: [] }),
      driverIds.length > 0
        ? supabase.from("drivers").select("id, full_name, license_no").in("id", driverIds)
        : Promise.resolve({ data: [] }),
      vehicleIds.length > 0
        ? supabase.from("vehicles").select("id, license_plate, make, model, year").in("id", vehicleIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Create lookup maps
    const customersMap = new Map<string, any>();
    customersData.data?.forEach(c => customersMap.set(c.id, c));
    
    const driversMap = new Map<string, any>();
    driversData.data?.forEach(d => driversMap.set(d.id, d));
    
    const vehiclesMap = new Map<string, any>();
    vehiclesData.data?.forEach(v => vehiclesMap.set(v.id, v));

    // Enrich records with joined data
    const enrichedRecords = records.map(record => ({
      ...record,
      customer: record.customer_id ? customersMap.get(record.customer_id) : undefined,
      driver: record.driver_id ? driversMap.get(record.driver_id) : undefined,
      vehicle: record.vehicle_id ? vehiclesMap.get(record.vehicle_id) : undefined,
    }));

    return enrichedRecords as TollTransactionCorporateRecord[];
  }

  /**
   * Get a single toll transaction by ID
   */
  static async get(id: string): Promise<TollTransactionCorporateRecord> {
    const { data, error } = await supabase
      .from("toll_transactions_corporate")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching toll transaction:", error);
      throw error;
    }

    return data as TollTransactionCorporateRecord;
  }

  /**
   * Get statistics for toll transactions
   */
  static async getStatistics(
    filters?: TollTransactionFilters
  ): Promise<TollTransactionStatistics> {
    // Fetch filtered records
    const records = await this.list(filters);

    // Calculate statistics
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalCrossings = records.length;

    // By emirate
    const dubaiRecords = records.filter((r) => r.emirate === "Dubai");
    const abuDhabiRecords = records.filter((r) => r.emirate === "Abu Dhabi");

    // By authority
    const salikRecords = records.filter((r) => r.toll_authority === "Salik");
    const darbRecords = records.filter((r) => r.toll_authority === "Darb");

    // By status
    const statusCounts = {
      charged: records.filter((r) => r.payment_status === "charged").length,
      pending: records.filter((r) => r.payment_status === "pending").length,
      failed: records.filter((r) => r.payment_status === "failed").length,
      exempt: records.filter((r) => r.payment_status === "exempt").length,
    };

    // Linked/unlinked
    const linkedCount = records.filter((r) => r.contract_id).length;
    const unlinkedCount = records.filter((r) => !r.contract_id).length;

    // Reconciled
    const reconciledCount = records.filter((r) => r.reconciled).length;
    const unreconciledCount = records.filter((r) => !r.reconciled).length;

    // Most used emirate
    const mostUsedEmirate =
      dubaiRecords.length > abuDhabiRecords.length ? "Dubai" : "Abu Dhabi";

    // Most used gate
    const gateCounts = records.reduce((acc, r) => {
      acc[r.gate_name] = (acc[r.gate_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedGate =
      Object.entries(gateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A";

    return {
      total_amount: totalAmount,
      total_crossings: totalCrossings,
      by_emirate: {
        Dubai: {
          count: dubaiRecords.length,
          amount: dubaiRecords.reduce((sum, r) => sum + Number(r.amount), 0),
        },
        "Abu Dhabi": {
          count: abuDhabiRecords.length,
          amount: abuDhabiRecords.reduce((sum, r) => sum + Number(r.amount), 0),
        },
      },
      by_authority: {
        Salik: {
          count: salikRecords.length,
          amount: salikRecords.reduce((sum, r) => sum + Number(r.amount), 0),
        },
        Darb: {
          count: darbRecords.length,
          amount: darbRecords.reduce((sum, r) => sum + Number(r.amount), 0),
        },
      },
      by_status: statusCounts,
      linked_to_contract: linkedCount,
      unlinked: unlinkedCount,
      reconciled_count: reconciledCount,
      unreconciled_count: unreconciledCount,
      avg_amount_per_crossing:
        totalCrossings > 0 ? totalAmount / totalCrossings : 0,
      most_used_emirate: mostUsedEmirate,
      most_used_gate: mostUsedGate,
    };
  }

  /**
   * Simulate integration run (update integration_timestamp)
   */
  static async simulateIntegrationRun(): Promise<{ synced: number }> {
    const { data, error } = await supabase
      .from("toll_transactions_corporate")
      .update({ integration_timestamp: new Date().toISOString() })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all records
      .select();

    if (error) {
      console.error("Error simulating integration:", error);
      throw error;
    }

    return { synced: data?.length || 0 };
  }
}
