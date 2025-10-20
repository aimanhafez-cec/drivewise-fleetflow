import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type VehicleStatus = Database["public"]["Enums"]["vehicle_operational_status"];

export interface VehicleWithStatus {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  operational_status: VehicleStatus | null;
  location?: string;
  branch_id?: string;
  odometer?: number;
  insurance_expiry?: string;
  license_expiry?: string;
}

export interface VehicleStatusHistory {
  id: string;
  vehicle_id: string;
  from_status?: VehicleStatus;
  to_status: VehicleStatus;
  reason_code: string;
  reason_description?: string;
  changed_by?: string;
  changed_at: string;
  odometer_reading?: number;
  location?: string;
  documents?: any;
}

export interface StatusChangeData {
  vehicle_id: string;
  to_status: VehicleStatus;
  reason_code: string;
  reason_description?: string;
  odometer_reading?: number;
  location?: string;
  documents?: any;
}

export interface VehicleActivity {
  id: string;
  type: 'status_change' | 'movement' | 'work_order' | 'agreement' | 'inspection';
  date: string;
  title: string;
  description: string;
  status?: string;
  reference_no?: string;
  metadata?: any;
}

export class VehicleStatusAPI {
  // Get vehicles grouped by status
  static async getVehiclesByStatus() {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        license_plate,
        make,
        model,
        year,
        color,
        operational_status,
        location,
        branch_id,
        odometer,
        insurance_expiry,
        license_expiry
      `)
      .order('license_plate', { ascending: true });

    if (error) throw error;

    // Group vehicles by status
    const grouped = (data || []).reduce((acc, vehicle) => {
      const status = vehicle.operational_status || 'available';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(vehicle as VehicleWithStatus);
      return acc;
    }, {} as Record<string, VehicleWithStatus[]>);

    return grouped;
  }

  // Get vehicle status history
  static async getVehicleHistory(vehicleId: string) {
    const { data, error } = await supabase
      .from('vehicle_status_history')
      .select('*, profiles:changed_by(full_name)')
      .eq('vehicle_id', vehicleId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  }

  // Get comprehensive vehicle activity timeline
  static async getVehicleActivityTimeline(vehicleId: string): Promise<VehicleActivity[]> {
    const activities: VehicleActivity[] = [];

    // Fetch status changes
    const { data: statusChanges } = await supabase
      .from('vehicle_status_history')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('changed_at', { ascending: false });

    if (statusChanges) {
      activities.push(...statusChanges.map(change => ({
        id: change.id,
        type: 'status_change' as const,
        date: change.changed_at,
        title: 'Status Changed',
        description: `${change.from_status || 'N/A'} → ${change.to_status}`,
        status: change.to_status,
        metadata: { reason_code: change.reason_code, reason_description: change.reason_description }
      })));
    }

    // Fetch movements
    const { data: movements } = await supabase
      .from('vehicle_movements')
      .select('*')
      .contains('vehicle_ids', [vehicleId])
      .order('created_at', { ascending: false })
      .limit(50);

    if (movements) {
      activities.push(...movements.map(movement => ({
        id: movement.id,
        type: 'movement' as const,
        date: movement.created_at || '',
        title: `Vehicle Movement - ${movement.movement_type}`,
        description: `From ${movement.from_branch_id || 'N/A'} to ${movement.to_branch_id || 'N/A'}`,
        status: movement.status,
        reference_no: movement.movement_no,
        metadata: movement
      })));
    }

    // Fetch work orders
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (workOrders) {
      activities.push(...workOrders.map(wo => ({
        id: wo.id,
        type: 'work_order' as const,
        date: wo.created_at || '',
        title: `Maintenance - ${wo.reason}`,
        description: wo.notes || 'No description',
        status: wo.status || undefined,
        reference_no: wo.wo_number,
        metadata: wo
      })));
    }

    // Fetch agreements
    const { data: agreements } = await supabase
      .from('agreements')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (agreements) {
      activities.push(...agreements.map(agreement => ({
        id: agreement.id,
        type: 'agreement' as const,
        date: agreement.created_at,
        title: `Agreement - ${agreement.agreement_no}`,
        description: `Check-out: ${agreement.checkout_datetime || 'Not set'}`,
        status: agreement.status,
        reference_no: agreement.agreement_no || undefined,
        metadata: agreement
      })));
    }

    // Sort all activities by date
    return activities.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Change vehicle status
  static async changeVehicleStatus(data: StatusChangeData) {
    const { vehicle_id, to_status, ...historyData } = data;

    // Get current status
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('operational_status')
      .eq('id', vehicle_id)
      .single();

    // Update vehicle status
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ operational_status: to_status })
      .eq('id', vehicle_id);

    if (updateError) throw updateError;

    // Create history record
    const { data: history, error: historyError } = await supabase
      .from('vehicle_status_history')
      .insert({
        vehicle_id,
        from_status: vehicle?.operational_status,
        to_status,
        changed_by: (await supabase.auth.getUser()).data.user?.id,
        ...historyData
      })
      .select()
      .single();

    if (historyError) throw historyError;
    return history;
  }

  // Get status counts
  static async getStatusCounts() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('operational_status');

    if (error) throw error;

    const counts = (data || []).reduce((acc, vehicle) => {
      const status = vehicle.operational_status || 'available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  }

  // Get vehicles needing attention
  static async getVehiclesNeedingAttention() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`insurance_expiry.lt.${thirtyDaysFromNow.toISOString()},license_expiry.lt.${thirtyDaysFromNow.toISOString()}`)
      .order('insurance_expiry', { ascending: true });

    if (error) throw error;
    return data;
  }
}
