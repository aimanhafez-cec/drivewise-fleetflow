import { supabase } from "@/integrations/supabase/client";

export interface ComplianceException {
  id: string;
  exception_no: string;
  source_module: 'expense' | 'toll_fine' | 'other';
  source_record_id: string;
  exception_type: string;
  exception_reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  vehicle_id?: string;
  customer_id?: string;
  contract_id?: string;
  amount_involved?: number;
  auto_detected: boolean;
  detection_rule?: string;
  flagged_at: string;
  flagged_by?: string;
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExceptionFilters {
  source_module?: 'expense' | 'toll_fine' | 'other';
  status?: string;
  severity?: string;
  assigned_to?: string;
  vehicle_id?: string;
  customer_id?: string;
  contract_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateExceptionData {
  source_module: 'expense' | 'toll_fine' | 'other';
  source_record_id: string;
  exception_type: string;
  exception_reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vehicle_id?: string;
  customer_id?: string;
  contract_id?: string;
  amount_involved?: number;
  auto_detected?: boolean;
  detection_rule?: string;
  assigned_to?: string;
}

export interface ResolveExceptionData {
  resolution_notes: string;
  status: 'resolved' | 'dismissed';
}

export interface BulkExceptionAction {
  ids: string[];
  action: 'approve' | 'dismiss' | 'reassign' | 'escalate';
  data?: {
    resolution_notes?: string;
    assigned_to?: string;
  };
}

export interface ExceptionStatistics {
  total_count: number;
  open_count: number;
  under_review_count: number;
  resolved_count: number;
  dismissed_count: number;
  by_severity: { severity: string; count: number }[];
  by_source: { source: string; count: number }[];
  by_type: { type: string; count: number }[];
  avg_resolution_time_hours?: number;
}

export class ComplianceExceptionsAPI {
  /**
   * List exceptions with optional filtering
   */
  static async list(filters?: ExceptionFilters): Promise<ComplianceException[]> {
    let query = supabase
      .from("compliance_exceptions")
      .select(`
        *,
        vehicle:vehicles(id, license_plate, make, model),
        customer:profiles!compliance_exceptions_customer_id_fkey(id, full_name),
        assigned_user:profiles!compliance_exceptions_assigned_to_fkey(id, full_name),
        flagged_user:profiles!compliance_exceptions_flagged_by_fkey(id, full_name)
      `)
      .order("flagged_at", { ascending: false });

    if (filters?.source_module) {
      query = query.eq("source_module", filters.source_module);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.severity) {
      query = query.eq("severity", filters.severity);
    }

    if (filters?.assigned_to) {
      query = query.eq("assigned_to", filters.assigned_to);
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

    if (filters?.date_from) {
      query = query.gte("flagged_at", filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte("flagged_at", filters.date_to);
    }

    if (filters?.search) {
      query = query.or(
        `exception_no.ilike.%${filters.search}%,` +
        `exception_type.ilike.%${filters.search}%,` +
        `exception_reason.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as ComplianceException[];
  }

  /**
   * Get a single exception by ID
   */
  static async get(id: string): Promise<ComplianceException> {
    const { data, error } = await supabase
      .from("compliance_exceptions")
      .select(`
        *,
        vehicle:vehicles(id, license_plate, make, model, vin),
        customer:profiles!compliance_exceptions_customer_id_fkey(id, full_name, email),
        assigned_user:profiles!compliance_exceptions_assigned_to_fkey(id, full_name),
        flagged_user:profiles!compliance_exceptions_flagged_by_fkey(id, full_name)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ComplianceException;
  }

  /**
   * Create a new exception
   */
  static async create(data: CreateExceptionData): Promise<ComplianceException> {
    const { data: exception, error } = await supabase
      .from("compliance_exceptions")
      .insert({
        ...data,
        auto_detected: data.auto_detected || false,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return exception as ComplianceException;
  }

  /**
   * Update an exception
   */
  static async update(
    id: string,
    updates: Partial<CreateExceptionData>
  ): Promise<ComplianceException> {
    const { data, error } = await supabase
      .from("compliance_exceptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ComplianceException;
  }

  /**
   * Delete an exception
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("compliance_exceptions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Resolve an exception
   */
  static async resolve(
    id: string,
    resolution: ResolveExceptionData
  ): Promise<ComplianceException> {
    const { data, error } = await supabase
      .from("compliance_exceptions")
      .update({
        status: resolution.status,
        resolution_notes: resolution.resolution_notes,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ComplianceException;
  }

  /**
   * Assign an exception to a user
   */
  static async assign(id: string, assigned_to: string): Promise<ComplianceException> {
    return this.update(id, { assigned_to });
  }

  /**
   * Mark exception as under review
   */
  static async markUnderReview(id: string): Promise<ComplianceException> {
    const { data, error } = await supabase
      .from("compliance_exceptions")
      .update({ status: 'under_review' })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ComplianceException;
  }

  /**
   * Bulk operations on exceptions
   */
  static async bulkAction(action: BulkExceptionAction): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of action.ids) {
      try {
        switch (action.action) {
          case 'approve':
            await this.resolve(id, {
              status: 'resolved',
              resolution_notes: action.data?.resolution_notes || 'Bulk approved',
            });
            break;
          case 'dismiss':
            await this.resolve(id, {
              status: 'dismissed',
              resolution_notes: action.data?.resolution_notes || 'Bulk dismissed',
            });
            break;
          case 'reassign':
            if (action.data?.assigned_to) {
              await this.assign(id, action.data.assigned_to);
            }
            break;
          case 'escalate':
            await this.markUnderReview(id);
            break;
        }
        success++;
      } catch (error) {
        console.error(`Failed to process exception ${id}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Get exception statistics
   */
  static async getStatistics(filters?: ExceptionFilters): Promise<ExceptionStatistics> {
    const exceptions = await this.list(filters);

    const stats: ExceptionStatistics = {
      total_count: exceptions.length,
      open_count: exceptions.filter(e => e.status === 'open').length,
      under_review_count: exceptions.filter(e => e.status === 'under_review').length,
      resolved_count: exceptions.filter(e => e.status === 'resolved').length,
      dismissed_count: exceptions.filter(e => e.status === 'dismissed').length,
      by_severity: [],
      by_source: [],
      by_type: [],
    };

    // Group by severity
    const bySeverity = new Map<string, number>();
    exceptions.forEach(e => {
      bySeverity.set(e.severity, (bySeverity.get(e.severity) || 0) + 1);
    });
    stats.by_severity = Array.from(bySeverity.entries()).map(([severity, count]) => ({
      severity,
      count,
    }));

    // Group by source
    const bySource = new Map<string, number>();
    exceptions.forEach(e => {
      bySource.set(e.source_module, (bySource.get(e.source_module) || 0) + 1);
    });
    stats.by_source = Array.from(bySource.entries()).map(([source, count]) => ({
      source,
      count,
    }));

    // Group by type
    const byType = new Map<string, number>();
    exceptions.forEach(e => {
      byType.set(e.exception_type, (byType.get(e.exception_type) || 0) + 1);
    });
    stats.by_type = Array.from(byType.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    // Calculate avg resolution time
    const resolved = exceptions.filter(e => e.resolved_at && e.flagged_at);
    if (resolved.length > 0) {
      const totalHours = resolved.reduce((sum, e) => {
        const flagged = new Date(e.flagged_at).getTime();
        const resolvedTime = new Date(e.resolved_at!).getTime();
        return sum + (resolvedTime - flagged) / (1000 * 60 * 60);
      }, 0);
      stats.avg_resolution_time_hours = totalHours / resolved.length;
    }

    return stats;
  }

  /**
   * Auto-detect exceptions based on rules
   * This would be called by a background job or triggered manually
   */
  static async detectExceptions(): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    // Rule 1: Expenses detection - placeholder for when expenses module is implemented
    // This will be enabled when the expenses table is added

    // Rule 2: Tolls/fines without vehicle assignment
    try {
      const { data: tollsFines } = await supabase
        .from("tolls_fines")
        .select("*")
        .is("vehicle_id", null)
        .eq("status", "pending");

      if (tollsFines) {
        for (const tf of tollsFines) {
          const { data: existing } = await supabase
            .from("compliance_exceptions")
            .select("id")
            .eq("source_module", "toll_fine")
            .eq("source_record_id", tf.id)
            .eq("exception_type", "vehicle_not_recognized")
            .single();

          if (!existing) {
            await this.create({
              source_module: "toll_fine",
              source_record_id: tf.id,
              exception_type: "vehicle_not_recognized",
              exception_reason: `${tf.type} for plate ${tf.plate_number} cannot be matched to a vehicle`,
              severity: "medium",
              auto_detected: true,
              detection_rule: "toll_fine_no_vehicle",
              amount_involved: tf.total_amount,
            });
            created++;
          }
        }
      }
    } catch (error) {
      errors.push(`Toll/fine detection error: ${error}`);
    }

    return { created, errors };
  }
}

export const complianceExceptionsApi = new ComplianceExceptionsAPI();
