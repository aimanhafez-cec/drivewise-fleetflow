import { supabase } from '@/integrations/supabase/client';
import type { InspectionData } from '@/types/agreement-wizard';

/**
 * API Integration for Vehicle Inspections
 * Handles all inspection-related API calls
 */

export interface CheckoutInspectionRequest {
  agreementId: string;
  lineId: string;
  vehicleId: string;
  inspectionData: InspectionData;
}

export interface CheckinInspectionRequest {
  agreementId: string;
  lineId: string;
  vehicleId: string;
  inspectionData: InspectionData;
}

export interface ComparisonRequest {
  agreementId: string;
  lineId: string;
}

export interface ApprovalRequest {
  inspectionId: string;
  managerId: string;
  notes?: string;
  override: boolean;
}

/**
 * Save checkout inspection
 */
export async function saveCheckoutInspection(request: CheckoutInspectionRequest) {
  try {
    // Generate inspection number
    const inspectionNo = `INS-OUT-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('inspection_master')
      .insert([{
        inspection_no: inspectionNo,
        vehicle_id: request.vehicleId,
        inspection_type: 'RENTAL_CHECKOUT',
        status: 'IN_PROGRESS',
        entry_date: new Date().toISOString(),
        checklist: request.inspectionData.inspectionChecklist as any,
        metrics: {
          odometer: request.inspectionData.odometerReading,
          fuelLevel: request.inspectionData.fuelLevel,
        },
        damage_marker_ids: request.inspectionData.damageMarkers.map(m => m.id),
        inspector_name: request.inspectionData.inspectorName,
        notes: request.inspectionData.notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to save checkout inspection:', error);
    throw error;
  }
}

/**
 * Update checkout inspection
 */
export async function updateCheckoutInspection(
  inspectionId: string,
  request: CheckoutInspectionRequest
) {
  try {
    const { data, error } = await supabase
      .from('inspection_master')
      .update({
        checklist: request.inspectionData.inspectionChecklist,
        metrics: {
          odometer: request.inspectionData.odometerReading,
          fuelLevel: request.inspectionData.fuelLevel,
        },
        damage_marker_ids: request.inspectionData.damageMarkers.map(m => m.id),
        inspector_name: request.inspectionData.inspectorName,
        notes: request.inspectionData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to update checkout inspection:', error);
    throw error;
  }
}

/**
 * Save checkin inspection
 */
export async function saveCheckinInspection(request: CheckinInspectionRequest) {
  try {
    // Generate inspection number
    const inspectionNo = `INS-IN-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('inspection_master')
      .insert([{
        inspection_no: inspectionNo,
        vehicle_id: request.vehicleId,
        inspection_type: 'RENTAL_CHECKIN',
        status: 'IN_PROGRESS',
        entry_date: new Date().toISOString(),
        checklist: request.inspectionData.inspectionChecklist as any,
        metrics: {
          odometer: request.inspectionData.odometerReading,
          fuelLevel: request.inspectionData.fuelLevel,
        },
        damage_marker_ids: request.inspectionData.damageMarkers.map(m => m.id),
        inspector_name: request.inspectionData.inspectorName,
        notes: request.inspectionData.notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to save checkin inspection:', error);
    throw error;
  }
}

/**
 * Update checkin inspection
 */
export async function updateCheckinInspection(
  inspectionId: string,
  request: CheckinInspectionRequest
) {
  try {
    const { data, error } = await supabase
      .from('inspection_master')
      .update({
        checklist: request.inspectionData.inspectionChecklist,
        metrics: {
          odometer: request.inspectionData.odometerReading,
          fuelLevel: request.inspectionData.fuelLevel,
        },
        damage_marker_ids: request.inspectionData.damageMarkers.map(m => m.id),
        inspector_name: request.inspectionData.inspectorName,
        notes: request.inspectionData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to update checkin inspection:', error);
    throw error;
  }
}

/**
 * Get comparison report between checkout and checkin
 */
export async function getComparisonReport(request: ComparisonRequest) {
  try {
    // In production, this would fetch from the database
    // For now, return a mock structure
    console.log('[API] Fetching comparison report for:', request);
    
    return {
      checkout: null,
      checkin: null,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[API] Failed to get comparison report:', error);
    throw error;
  }
}

/**
 * Submit inspection for manager approval
 */
export async function submitForApproval(request: ApprovalRequest) {
  try {
    const { data, error } = await supabase
      .from('inspection_master')
      .update({
        status: 'APPROVED',
        completed_date: new Date().toISOString(),
        notes: request.notes,
      })
      .eq('id', request.inspectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to submit for approval:', error);
    throw error;
  }
}

/**
 * Get inspection by ID
 */
export async function getInspectionById(inspectionId: string) {
  try {
    const { data, error } = await supabase
      .from('inspection_master')
      .select('*')
      .eq('id', inspectionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to get inspection:', error);
    throw error;
  }
}

/**
 * Get all inspections for an agreement
 */
export async function getInspectionsByAgreement(agreementId: string) {
  try {
    const { data, error } = await supabase
      .from('inspection_master')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Failed to get inspections:', error);
    throw error;
  }
}
