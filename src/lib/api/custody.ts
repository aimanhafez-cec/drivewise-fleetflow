import { supabase } from '@/integrations/supabase/client';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type CustodyStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed' | 'voided';
export type CustodianType = 'customer' | 'driver' | 'originator';
export type CustodyReason = 'accident' | 'breakdown' | 'maintenance' | 'damage' | 'other';
export type RatePolicyType = 'inherit' | 'prorate' | 'free' | 'special_code';
export type DocumentType = 'customer_acknowledgment' | 'incident_report' | 'photos' | 'police_report' | 'insurance_docs' | 'handover_checklist' | 'signature';
export type DocumentCategory = 'required' | 'optional';
export type ChargeType = 'damage' | 'upgrade' | 'downgrade' | 'admin_fee' | 'other';
export type ChargeResponsibility = 'customer' | 'company' | 'insurance' | 'third_party';
export type ChargeStatus = 'draft' | 'posted' | 'invoiced' | 'paid';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface CustodyTransaction {
  id: string;
  custody_no: string;
  status: CustodyStatus;
  agreement_id?: string;
  agreement_line_id?: string;
  branch_id?: string;
  customer_id: string;
  custodian_type: CustodianType;
  custodian_party_id?: string;
  custodian_name: string;
  custodian_contact: any;
  original_vehicle_id?: string;
  replacement_vehicle_id?: string;
  reason_code: CustodyReason;
  reason_subcode?: string;
  incident_date: string;
  incident_ref?: string;
  incident_narrative?: string;
  incident_odometer?: number;
  incident_location?: any;
  effective_from: string;
  expected_return_date?: string;
  actual_return_date?: string;
  until_original_ready: boolean;
  linked_maintenance_ticket_id?: string;
  rate_policy: RatePolicyType;
  special_rate_code?: string;
  deposit_carryover: boolean;
  damage_preauth_hold?: number;
  damage_preauth_card_ref?: string;
  tax_profile_id?: string;
  sla_target_approve_by?: string;
  sla_target_handover_by?: string;
  sla_breached: boolean;
  approved_by?: string;
  approved_at?: string;
  closed_by?: string;
  closed_at?: string;
  notes?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustodyDocument {
  id: string;
  custody_id: string;
  document_type: DocumentType;
  document_category: DocumentCategory;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  esign_status?: 'pending' | 'signed' | 'declined';
  esign_signed_at?: string;
  esign_signed_by?: string;
  uploaded_by?: string;
  uploaded_at: string;
  metadata: any;
}

export interface CustodyCharge {
  id: string;
  custody_id: string;
  charge_type: ChargeType;
  item_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number;
  responsibility: ChargeResponsibility;
  status: ChargeStatus;
  posted_by?: string;
  posted_at?: string;
  invoice_id?: string;
  created_at: string;
  notes?: string;
}

export interface CustodyApproval {
  id: string;
  custody_id: string;
  approval_level: number;
  approver_role: string;
  approver_user_id?: string;
  required: boolean;
  status: ApprovalStatus;
  decision_timestamp?: string;
  decision_notes?: string;
  due_by?: string;
  reminded_at?: string;
  created_at: string;
}

export interface CustodyAuditLog {
  id: string;
  custody_id: string;
  action_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  performed_by?: string;
  performed_at: string;
  api_source?: string;
  metadata: any;
}

export interface CustodyFilters {
  status?: CustodyStatus[];
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  reasonCode?: CustodyReason[];
  customerId?: string;
  agreementId?: string;
  originalVehicleId?: string;
  replacementVehicleId?: string;
  custodianType?: CustodianType;
  slaBreached?: boolean;
  search?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustodyTransactionCreate {
  agreement_id?: string;
  agreement_line_id?: string;
  branch_id?: string;
  customer_id: string;
  custodian_type: CustodianType;
  custodian_party_id?: string;
  custodian_name: string;
  custodian_contact?: Record<string, any>;
  original_vehicle_id?: string;
  replacement_vehicle_id?: string;
  reason_code: CustodyReason;
  reason_subcode?: string;
  incident_date: string;
  incident_ref?: string;
  incident_narrative?: string;
  incident_odometer?: number;
  incident_location?: Record<string, any>;
  effective_from: string;
  expected_return_date?: string;
  until_original_ready?: boolean;
  rate_policy?: RatePolicyType;
  special_rate_code?: string;
  deposit_carryover?: boolean;
  damage_preauth_hold?: number;
  damage_preauth_card_ref?: string;
  notes?: string;
  tags?: string[];
}

export interface CustodyCloseData {
  actual_return_date: string;
  return_odometer?: number;
  return_fuel_level?: number;
  return_notes?: string;
}

export interface VehicleAvailabilityFilters {
  branchId?: string;
  vehicleClassId?: string;
  transmission?: string;
  fuelType?: string;
  insuranceClassId?: string;
  dateFrom: string;
  dateTo: string;
}

export interface VehicleEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export interface CustodyKPIs {
  active_custodies: number;
  avg_duration_days: number;
  sla_on_time_percentage: number;
  open_approvals: number;
  unposted_charges: number;
  total_cost_this_month: number;
}

export interface ApprovalPath {
  approval_level: number;
  approver_role: string;
  approver_user_id?: string;
  required: boolean;
  status: ApprovalStatus;
}

// ==========================================
// CUSTODY API CLASS
// ==========================================

export class CustodyAPI {
  // ==========================================
  // CORE CRUD OPERATIONS
  // ==========================================

  async createCustodyTransaction(data: CustodyTransactionCreate, createdBy?: string): Promise<CustodyTransaction> {
    const { data: custody, error } = await supabase
      .from('custody_transactions')
      .insert({
        ...data,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return custody;
  }

  async getCustodyTransaction(id: string): Promise<CustodyTransaction> {
    const { data, error } = await supabase
      .from('custody_transactions')
      .select(`
        *,
        agreement:agreements(id, agreement_no, customer_id),
        customer:customer_id(id, name, email, phone),
        original_vehicle:vehicles!original_vehicle_id(id, make, model, year, license_plate, vin),
        replacement_vehicle:vehicles!replacement_vehicle_id(id, make, model, year, license_plate, vin)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustodyTransaction(id: string, updates: Partial<CustodyTransaction>): Promise<CustodyTransaction> {
    const { data, error } = await supabase
      .from('custody_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustodyTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ==========================================
  // LIST & SEARCH
  // ==========================================

  async listCustodyTransactions(
    filters: CustodyFilters,
    pagination: Pagination
  ): Promise<PaginatedResult<CustodyTransaction>> {
    let query = supabase
      .from('custody_transactions')
      .select(`
        *,
        agreement:agreements(id, agreement_no),
        customer:customer_id(id, name),
        original_vehicle:vehicles!original_vehicle_id(license_plate, vin),
        replacement_vehicle:vehicles!replacement_vehicle_id(license_plate, vin)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters.dateFrom) {
      query = query.gte('effective_from', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('effective_from', filters.dateTo);
    }
    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }
    if (filters.reasonCode && filters.reasonCode.length > 0) {
      query = query.in('reason_code', filters.reasonCode);
    }
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters.agreementId) {
      query = query.eq('agreement_id', filters.agreementId);
    }
    if (filters.custodianType) {
      query = query.eq('custodian_type', filters.custodianType);
    }
    if (filters.slaBreached !== undefined) {
      query = query.eq('sla_breached', filters.slaBreached);
    }
    if (filters.search) {
      query = query.or(`custody_no.ilike.%${filters.search}%,custodian_name.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil((count || 0) / pagination.pageSize),
    };
  }

  async searchCustody(query: string): Promise<CustodyTransaction[]> {
    const { data, error } = await supabase
      .from('custody_transactions')
      .select('*')
      .or(`custody_no.ilike.%${query}%,custodian_name.ilike.%${query}%,incident_ref.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // LIFECYCLE MANAGEMENT
  // ==========================================

  async submitForApproval(id: string): Promise<void> {
    // Validate before submission
    const validation = await this.validateCustodyForSubmission(id);
    if (!validation.valid) {
      throw new Error(`Cannot submit: ${validation.errors.join(', ')}`);
    }

    // Calculate SLA targets
    const { data: slaData } = await supabase.rpc('calculate_custody_sla', { p_custody_id: id });
    
    const slaTimestamps = slaData as any;

    // Update status and SLA targets
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'pending_approval',
        sla_target_approve_by: slaTimestamps?.approve_by,
        sla_target_handover_by: slaTimestamps?.handover_by,
      })
      .eq('id', id);

    if (error) throw error;

    // Create approval records based on matrix
    await this.createApprovalRecords(id);
  }

  async approveCustody(id: string, approvedBy: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Update approval record
    await supabase
      .from('custody_approvals')
      .update({
        status: 'approved',
        decision_timestamp: new Date().toISOString(),
        decision_notes: notes,
      })
      .eq('custody_id', id)
      .eq('approver_user_id', approvedBy);
  }

  async rejectCustody(id: string, rejectedBy: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'draft',
      })
      .eq('id', id);

    if (error) throw error;

    // Update approval record
    await supabase
      .from('custody_approvals')
      .update({
        status: 'rejected',
        decision_timestamp: new Date().toISOString(),
        decision_notes: reason,
      })
      .eq('custody_id', id)
      .eq('approver_user_id', rejectedBy);
  }

  async activateCustody(id: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'active',
      })
      .eq('id', id);

    if (error) throw error;
  }

  async closeCustody(id: string, closeData: CustodyCloseData, closedBy: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'closed',
        actual_return_date: closeData.actual_return_date,
        closed_by: closedBy,
        closed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  async voidCustody(id: string, reason: string, voidedBy: string): Promise<void> {
    const { error } = await supabase
      .from('custody_transactions')
      .update({
        status: 'voided',
        notes: reason,
        closed_by: voidedBy,
        closed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  async uploadDocument(
    custodyId: string,
    file: File,
    documentType: DocumentType,
    category: DocumentCategory = 'optional',
    uploadedBy?: string
  ): Promise<CustodyDocument> {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${custodyId}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('custody-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('custody-documents')
      .getPublicUrl(fileName);

    // Create document record
    const { data, error } = await supabase
      .from('custody_documents')
      .insert({
        custody_id: custodyId,
        document_type: documentType,
        document_category: category,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDocument(docId: string): Promise<void> {
    const { error } = await supabase
      .from('custody_documents')
      .delete()
      .eq('id', docId);

    if (error) throw error;
  }

  async getDocuments(custodyId: string): Promise<CustodyDocument[]> {
    const { data, error } = await supabase
      .from('custody_documents')
      .select('*')
      .eq('custody_id', custodyId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // CHARGES
  // ==========================================

  async addCharge(custodyId: string, charge: Omit<CustodyCharge, 'id' | 'custody_id' | 'created_at'>): Promise<CustodyCharge> {
    const { data, error } = await supabase
      .from('custody_charges')
      .insert({
        custody_id: custodyId,
        ...charge,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCharge(chargeId: string, updates: Partial<CustodyCharge>): Promise<CustodyCharge> {
    const { data, error } = await supabase
      .from('custody_charges')
      .update(updates)
      .eq('id', chargeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async postCharges(custodyId: string, chargeIds: string[], postedBy: string): Promise<void> {
    const { error } = await supabase
      .from('custody_charges')
      .update({
        status: 'posted',
        posted_by: postedBy,
        posted_at: new Date().toISOString(),
      })
      .in('id', chargeIds)
      .eq('custody_id', custodyId);

    if (error) throw error;
  }

  async getCharges(custodyId: string): Promise<CustodyCharge[]> {
    const { data, error } = await supabase
      .from('custody_charges')
      .select('*')
      .eq('custody_id', custodyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // VEHICLE AVAILABILITY
  // ==========================================

  async getAvailableReplacementVehicles(filters: VehicleAvailabilityFilters) {
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available');

    if (filters.vehicleClassId) {
      query = query.eq('category_id', filters.vehicleClassId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Filter by custody availability
    const availableVehicles = [];
    for (const vehicle of data || []) {
      const { data: isAvailable } = await supabase.rpc('check_vehicle_custody_availability', {
        p_vehicle_id: vehicle.id,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
      });

      if (isAvailable) {
        availableVehicles.push(vehicle);
      }
    }

    return availableVehicles;
  }

  async checkVehicleEligibility(vehicleId: string, custodyId: string): Promise<VehicleEligibilityResult> {
    const reasons: string[] = [];

    // Check vehicle status
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('status')
      .eq('id', vehicleId)
      .single();

    if (vehicle?.status !== 'available') {
      reasons.push('Vehicle is not available');
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  }

  // ==========================================
  // APPROVALS
  // ==========================================

  async getApprovalMatrix(custodyId: string): Promise<ApprovalPath[]> {
    const { data, error } = await supabase
      .from('custody_approvals')
      .select('*')
      .eq('custody_id', custodyId)
      .order('approval_level', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createApprovalRecords(custodyId: string): Promise<void> {
    // Get custody details to determine approval matrix
    const custody = await this.getCustodyTransaction(custodyId);

    // Simple approval matrix logic
    const approvals = [
      {
        custody_id: custodyId,
        approval_level: 1,
        approver_role: 'ops_supervisor',
        required: true,
        status: 'pending' as ApprovalStatus,
        due_by: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      },
    ];

    const { error } = await supabase
      .from('custody_approvals')
      .insert(approvals);

    if (error) throw error;
  }

  // ==========================================
  // ANALYTICS & KPIs
  // ==========================================

  async getCustodyKPIs(dateRange?: { from: string; to: string }, branchId?: string): Promise<CustodyKPIs> {
    // Implement KPI calculations
    const { count: activeCustodies } = await supabase
      .from('custody_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return {
      active_custodies: activeCustodies || 0,
      avg_duration_days: 0,
      sla_on_time_percentage: 0,
      open_approvals: 0,
      unposted_charges: 0,
      total_cost_this_month: 0,
    };
  }

  // ==========================================
  // AUDIT LOG
  // ==========================================

  async getAuditLog(custodyId: string): Promise<CustodyAuditLog[]> {
    const { data, error } = await supabase
      .from('custody_audit_log')
      .select('*')
      .eq('custody_id', custodyId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ==========================================
  // VALIDATION
  // ==========================================

  private async validateCustodyForSubmission(custodyId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const { data: custody } = await supabase
      .from('custody_transactions')
      .select('*')
      .eq('id', custodyId)
      .single();

    if (!custody) {
      errors.push('Custody transaction not found');
      return { valid: false, errors };
    }

    // Check for required documents
    const { data: docs } = await supabase
      .from('custody_documents')
      .select('*')
      .eq('custody_id', custodyId)
      .eq('document_category', 'required');

    if (!docs || docs.length === 0) {
      errors.push('Required documents not uploaded');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const custodyApi = new CustodyAPI();
