import { supabase } from '@/integrations/supabase/client';
import type { InspectionMaster, InspectionType, InspectionStatus, VehicleOption } from '@/types/inspection';

export interface DashboardStats {
  upcomingCheckouts: number;
  upcomingCheckins: number;
  periodicInspections: number;
  randomInspections: number;
}

export interface SearchInspectionsParams {
  q?: string;
  type?: InspectionType;
  status?: InspectionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const inspectionMasterApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    // Upcoming Checkouts: assigned lines without checkout inspection
    const { count: checkoutCount } = await supabase
      .from('corporate_leasing_line_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_status', 'assigned')
      .is('inspection_checkout_id', null);

    // Upcoming Check-ins: Active assignments that will need check-in
    const { count: checkinCount } = await supabase
      .from('corporate_leasing_line_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_status', 'active')
      .is('inspection_checkin_id', null);

    // Periodic Inspections count (completed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: periodicCount } = await supabase
      .from('inspection_master')
      .select('*', { count: 'exact', head: true })
      .eq('inspection_type', 'PERIODIC')
      .gte('entry_date', thirtyDaysAgo.toISOString());

    // Random Inspections count (completed in last 30 days)
    const { count: randomCount } = await supabase
      .from('inspection_master')
      .select('*', { count: 'exact', head: true })
      .eq('inspection_type', 'RANDOM')
      .gte('entry_date', thirtyDaysAgo.toISOString());

    return {
      upcomingCheckouts: checkoutCount || 0,
      upcomingCheckins: checkinCount || 0,
      periodicInspections: periodicCount || 0,
      randomInspections: randomCount || 0
    };
  },

  async searchInspections(params: SearchInspectionsParams) {
    const {
      q = '',
      type,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20
    } = params;

    let query = supabase
      .from('inspection_master')
      .select('*, vehicles(make, model, year, color)', { count: 'exact' });

    if (q) {
      query = query.or(`inspection_no.ilike.%${q}%,vin.ilike.%${q}%`);
    }

    if (type) {
      query = query.eq('inspection_type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('entry_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('entry_date', dateTo);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('entry_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },

  async smartVinSearch(q: string, inspectionType: InspectionType): Promise<VehicleOption[]> {
    const results: VehicleOption[] = [];

    if (inspectionType === 'RENTAL_CHECKOUT' || inspectionType === 'RENTAL_CHECKIN') {
      const { data: assignments } = await supabase
        .from('corporate_leasing_line_assignments')
        .select(`
          *,
          vehicles(make, model, year, color),
          corporate_leasing_agreements(agreement_no)
        `)
        .eq('assignment_status', 'assigned')
        .or(`vin.ilike.%${q}%,item_code.ilike.%${q}%`)
        .limit(10);

      if (assignments) {
        results.push(...assignments.map((a: any) => ({
          vehicleId: a.vehicle_id,
          vin: a.vin,
          itemCode: a.item_code,
          description: `${a.vehicles?.make || ''} ${a.vehicles?.model || ''} ${a.vehicles?.year || ''} ${a.vehicles?.color || ''}`.trim(),
          agreementId: a.agreement_id,
          agreementNo: a.corporate_leasing_agreements?.agreement_no,
          lineId: a.line_no?.toString(),
          driverName: a.driver_name || undefined
        })));
      }
    }

    if (inspectionType === 'PERIODIC' || inspectionType === 'RANDOM') {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .ilike('vin', `%${q}%`)
        .limit(10);

      if (vehicles) {
        results.push(...vehicles.map((v: any) => ({
          vehicleId: v.id,
          vin: v.vin || '',
          itemCode: v.registration_number || v.vin || '',
          description: `${v.make} ${v.model} ${v.year} ${v.color || ''}`.trim()
        })));
      }
    }

    return results;
  },

  async createInspection(data: {
    inspection_type: InspectionType;
    vehicle_id: string;
    vin: string;
    item_code?: string;
    agreement_id?: string;
    line_id?: string;
  }): Promise<InspectionMaster> {
    const user = (await supabase.auth.getUser()).data.user;

    const { data: inspection, error } = await supabase
      .from('inspection_master')
      .insert({
        inspection_type: data.inspection_type,
        vehicle_id: data.vehicle_id,
        vin: data.vin,
        item_code: data.item_code,
        agreement_id: data.agreement_id,
        line_id: data.line_id,
        status: 'DRAFT',
        performed_by_user_id: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return inspection;
  },

  async updateInspection(id: string, updates: Partial<InspectionMaster>): Promise<InspectionMaster> {
    const { data, error } = await supabase
      .from('inspection_master')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeInspection(id: string, signature: any): Promise<InspectionMaster> {
    const { data, error } = await supabase
      .from('inspection_master')
      .update({
        status: 'APPROVED',
        signature,
        completed_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data.inspection_type === 'RENTAL_CHECKOUT' && data.agreement_id) {
      await supabase
        .from('corporate_leasing_line_assignments')
        .update({
          inspection_checkout_completed: true,
          inspection_checkout_id: id
        })
        .eq('agreement_id', data.agreement_id)
        .eq('vin', data.vin);
    }

    return data;
  },

  async getInspection(id: string): Promise<InspectionMaster | null> {
    const { data, error } = await supabase
      .from('inspection_master')
      .select('*, vehicles(make, model, year, color, registration_number)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInspection(id: string): Promise<void> {
    const { error } = await supabase
      .from('inspection_master')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
