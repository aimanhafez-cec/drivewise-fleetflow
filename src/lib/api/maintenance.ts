import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type WorkOrderStatus = Database["public"]["Enums"]["work_order_status"];
export type WorkOrderPriority = Database["public"]["Enums"]["priority_level"];
export type WorkOrderReason = Database["public"]["Enums"]["work_order_reason"];

export interface WorkOrder {
  id: string;
  wo_number: string;
  vehicle_id: string;
  reason: WorkOrderReason;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  scheduled_start?: string;
  actual_start?: string;
  completed_at?: string;
  mileage?: number;
  estimated_cost?: number;
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  workshop_vendor?: string;
  assigned_to?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  custody_transaction_id?: string;
  requires_approval?: boolean;
  cost_approved?: boolean;
  cost_posted?: boolean;
}

export interface WorkOrderTask {
  id: string;
  work_order_id: string;
  task_number: number;
  complaint: string;
  cause?: string;
  correction?: string;
  status: string;
  estimated_hours?: number;
  actual_hours?: number;
  technician_id?: string;
  completed_at?: string;
  labor_rate?: number;
  labor_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus[];
  reason?: WorkOrderReason[];
  priority?: WorkOrderPriority[];
  vehicle_id?: string;
  workshop_vendor?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface CreateWorkOrderData {
  vehicle_id: string;
  reason: WorkOrderReason;
  priority?: WorkOrderPriority;
  scheduled_start?: string;
  notes?: string;
  mileage?: number;
  workshop_vendor?: string;
  estimated_cost?: number;
  requires_approval?: boolean;
  tasks?: {
    complaint: string;
    estimated_hours?: number;
  }[];
}

export class MaintenanceAPI {
  // List work orders with filters
  static async listWorkOrders(filters?: WorkOrderFilters) {
    let query = supabase
      .from('work_orders')
      .select('*, vehicles(make, model, plate_no)')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.reason && filters.reason.length > 0) {
      query = query.in('reason', filters.reason);
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.vehicle_id) {
      query = query.eq('vehicle_id', filters.vehicle_id);
    }

    if (filters?.workshop_vendor) {
      query = query.eq('workshop_vendor', filters.workshop_vendor);
    }

    if (filters?.date_from) {
      query = query.gte('scheduled_start', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('scheduled_start', filters.date_to);
    }

    if (filters?.search) {
      query = query.or(`wo_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Get single work order
  static async getWorkOrder(id: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*, vehicles(*), work_order_tasks(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create work order
  static async createWorkOrder(data: CreateWorkOrderData) {
    const { tasks, ...workOrderData } = data;
    
    const { data: result, error } = await supabase
      .from('work_orders')
      .insert({
        ...workOrderData,
        status: 'open',
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Create tasks if provided
    if (tasks && tasks.length > 0) {
      const tasksData = tasks.map((task, index) => ({
        work_order_id: result.id,
        task_number: index + 1,
        complaint: task.complaint,
        estimated_hours: task.estimated_hours,
        status: 'pending'
      }));

      const { error: tasksError } = await supabase
        .from('work_order_tasks')
        .insert(tasksData);

      if (tasksError) throw tasksError;
    }

    return result;
  }

  // Update work order
  static async updateWorkOrder(id: string, data: Partial<CreateWorkOrderData>) {
    const { data: result, error } = await supabase
      .from('work_orders')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  // Start work order
  static async startWorkOrder(id: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'in_progress',
        actual_start: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Complete work order
  static async completeWorkOrder(id: string, totalCost?: number) {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'closed',
        completed_at: new Date().toISOString(),
        total_cost: totalCost
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Cancel work order
  static async cancelWorkOrder(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete work order
  static async deleteWorkOrder(id: string) {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get maintenance statistics
  static async getMaintenanceStats() {
    const { data, error } = await supabase
      .from('work_orders')
      .select('status, reason, priority, total_cost')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      open: data?.filter(w => w.status === 'open').length || 0,
      in_progress: data?.filter(w => w.status === 'in_progress').length || 0,
      waiting_parts: data?.filter(w => w.status === 'waiting_parts').length || 0,
      qa: data?.filter(w => w.status === 'qa').length || 0,
      closed: data?.filter(w => w.status === 'closed').length || 0,
      cancelled: data?.filter(w => w.status === 'cancelled').length || 0,
      totalCost: data?.reduce((sum, w) => sum + (w.total_cost || 0), 0) || 0,
      byReason: {
        pm: data?.filter(w => w.reason === 'pm').length || 0,
        breakdown: data?.filter(w => w.reason === 'breakdown').length || 0,
        accident: data?.filter(w => w.reason === 'accident').length || 0,
        recall: data?.filter(w => w.reason === 'recall').length || 0,
        inspection: data?.filter(w => w.reason === 'inspection').length || 0,
        other: data?.filter(w => w.reason === 'other').length || 0,
      },
      byPriority: {
        low: data?.filter(w => w.priority === 'low').length || 0,
        normal: data?.filter(w => w.priority === 'normal').length || 0,
        high: data?.filter(w => w.priority === 'high').length || 0,
        urgent: data?.filter(w => w.priority === 'urgent').length || 0,
      }
    };

    return stats;
  }

  // Task operations
  static async updateTask(id: string, data: Partial<WorkOrderTask>) {
    const { data: result, error } = await supabase
      .from('work_order_tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async completeTask(id: string, correction: string, actualHours?: number) {
    const { data, error } = await supabase
      .from('work_order_tasks')
      .update({
        status: 'completed',
        correction,
        actual_hours: actualHours,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
