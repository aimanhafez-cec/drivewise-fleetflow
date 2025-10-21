import { supabase } from "@/integrations/supabase/client";
import { TollsFinesAPI } from "./tollsFines";
import { ComplianceExceptionsAPI } from "./complianceExceptions";

export interface CostComplianceDashboard {
  total_expenses: number;
  pending_tolls_fines: number;
  open_exceptions: number;
  awaiting_approval: number;
  total_expenses_count: number;
  total_tolls_fines_count: number;
  total_exceptions_count: number;
}

export interface ContractBillingCycle {
  id: string;
  contract_id: string;
  billing_cycle_no: string;
  period_start: string;
  period_end: string;
  status: 'open' | 'preview' | 'finalized' | 'invoiced';
  total_expenses: number;
  total_tolls: number;
  total_fines: number;
  total_exceptions: number;
  generated_at?: string;
  generated_by?: string;
  finalized_at?: string;
  invoice_id?: string;
  export_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingPreviewData {
  contract_id: string;
  period_start: string;
  period_end: string;
  expenses: any[];
  tolls: any[];
  fines: any[];
  exceptions: any[];
  summary: {
    total_expenses: number;
    total_tolls: number;
    total_fines: number;
    subtotal: number;
    vat: number;
    grand_total: number;
  };
}

export interface CreateBillingCycleData {
  contract_id: string;
  billing_cycle_no: string;
  period_start: string;
  period_end: string;
}

export class CostComplianceAPI {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<CostComplianceDashboard> {
    // Get tolls/fines statistics
    const tollsFinesStats = await TollsFinesAPI.getStatistics();

    // Get exceptions statistics
    const exceptionsStats = await ComplianceExceptionsAPI.getStatistics();

    return {
      total_expenses: 0, // Placeholder - will be implemented with expenses module
      pending_tolls_fines: tollsFinesStats.pending_amount,
      open_exceptions: exceptionsStats.open_count,
      awaiting_approval: 0, // Placeholder - will be implemented with expenses module
      total_expenses_count: 0,
      total_tolls_fines_count: tollsFinesStats.total_count,
      total_exceptions_count: exceptionsStats.total_count,
    };
  }

  /**
   * List billing cycles for a contract
   */
  static async listBillingCycles(contractId?: string): Promise<ContractBillingCycle[]> {
    let query = supabase
      .from("contract_billing_cycles")
      .select("*")
      .order("period_start", { ascending: false });

    if (contractId) {
      query = query.eq("contract_id", contractId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as ContractBillingCycle[];
  }

  /**
   * Get a single billing cycle
   */
  static async getBillingCycle(id: string): Promise<ContractBillingCycle> {
    const { data, error } = await supabase
      .from("contract_billing_cycles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ContractBillingCycle;
  }

  /**
   * Create a new billing cycle
   */
  static async createBillingCycle(
    data: CreateBillingCycleData
  ): Promise<ContractBillingCycle> {
    const { data: cycle, error } = await supabase
      .from("contract_billing_cycles")
      .insert({
        ...data,
        status: 'open',
        total_expenses: 0,
        total_tolls: 0,
        total_fines: 0,
        total_exceptions: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return cycle as ContractBillingCycle;
  }

  /**
   * Generate billing preview for a contract period
   */
  static async generateBillingPreview(
    contractId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<BillingPreviewData> {
    // Fetch expenses for the period - placeholder
    const expenses: any[] = []; // Will be implemented with expenses module

    // Fetch tolls for the period
    const { data: tolls } = await supabase
      .from("tolls_fines")
      .select("*")
      .eq("contract_id", contractId)
      .eq("type", "toll")
      .eq("billable_to_contract", true)
      .gte("incident_date", periodStart)
      .lte("incident_date", periodEnd);

    // Fetch fines for the period
    const { data: fines } = await supabase
      .from("tolls_fines")
      .select("*")
      .eq("contract_id", contractId)
      .eq("type", "fine")
      .eq("billable_to_contract", true)
      .gte("incident_date", periodStart)
      .lte("incident_date", periodEnd);

    // Fetch related exceptions
    const { data: exceptions } = await supabase
      .from("compliance_exceptions")
      .select("*")
      .eq("contract_id", contractId)
      .eq("status", "open")
      .gte("flagged_at", periodStart)
      .lte("flagged_at", periodEnd);

    const totalExpenses = 0; // Placeholder
    const totalTolls = tolls?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
    const totalFines = fines?.reduce((sum, f) => sum + (f.total_amount || 0), 0) || 0;
    const subtotal = totalExpenses + totalTolls + totalFines;
    const vat = subtotal * 0.05; // 5% VAT for UAE
    const grandTotal = subtotal + vat;

    return {
      contract_id: contractId,
      period_start: periodStart,
      period_end: periodEnd,
      expenses: expenses || [],
      tolls: tolls || [],
      fines: fines || [],
      exceptions: exceptions || [],
      summary: {
        total_expenses: totalExpenses,
        total_tolls: totalTolls,
        total_fines: totalFines,
        subtotal,
        vat,
        grand_total: grandTotal,
      },
    };
  }

  /**
   * Finalize a billing cycle
   */
  static async finalizeBillingCycle(
    id: string,
    invoiceId?: string
  ): Promise<ContractBillingCycle> {
    const { data, error } = await supabase
      .from("contract_billing_cycles")
      .update({
        status: 'finalized',
        finalized_at: new Date().toISOString(),
        invoice_id: invoiceId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ContractBillingCycle;
  }

  /**
   * Mark billing cycle as invoiced
   */
  static async markAsInvoiced(
    id: string,
    invoiceId: string
  ): Promise<ContractBillingCycle> {
    const { data, error } = await supabase
      .from("contract_billing_cycles")
      .update({
        status: 'invoiced',
        invoice_id: invoiceId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ContractBillingCycle;
  }

  /**
   * Export billing data (placeholder)
   */
  static async exportBillingData(
    billingPreview: BillingPreviewData,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<{ url: string; filename: string }> {
    // This is a placeholder - in production, this would generate actual files
    console.log('Exporting billing data in format:', format);
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const filename = `billing_${billingPreview.contract_id}_${billingPreview.period_start}_${billingPreview.period_end}.${format}`;
    
    return {
      url: `/exports/${filename}`,
      filename,
    };
  }

  /**
   * Batch generate billing for multiple contracts
   */
  static async batchGenerateBilling(
    contracts: Array<{ contract_id: string; period_start: string; period_end: string }>
  ): Promise<{ success: number; failed: number; previews: BillingPreviewData[] }> {
    let success = 0;
    let failed = 0;
    const previews: BillingPreviewData[] = [];

    for (const contract of contracts) {
      try {
        const preview = await this.generateBillingPreview(
          contract.contract_id,
          contract.period_start,
          contract.period_end
        );
        previews.push(preview);
        success++;
      } catch (error) {
        console.error(`Failed to generate billing for ${contract.contract_id}:`, error);
        failed++;
      }
    }

    return { success, failed, previews };
  }

  /**
   * Run exception detection across all modules
   */
  static async runExceptionDetection(): Promise<{ created: number; errors: string[] }> {
    return await ComplianceExceptionsAPI.detectExceptions();
  }
}

export const costComplianceApi = new CostComplianceAPI();
