import { supabase } from '@/integrations/supabase/client';

export type OwnershipType = 'owned' | 'leased' | 'financed' | 'rental_pool' | 'consignment';

export interface VehicleOwnershipRecord {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  ownership_type: OwnershipType | null;
  category_id?: string;
  categories?: {
    id: string;
    name: string;
  };
  status: string;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  license_expiry?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface OwnershipFilters {
  ownership_type?: OwnershipType;
  category_id?: string;
  status?: string;
  search?: string;
}

export interface UpdateOwnershipData {
  ownership_type?: OwnershipType;
  category_id?: string;
  daily_rate?: number;
  weekly_rate?: number;
  monthly_rate?: number;
  license_expiry?: string;
  insurance_expiry?: string;
}

export interface OwnershipStatistics {
  total_vehicles: number;
  by_ownership_type: {
    owned: number;
    leased: number;
    financed: number;
    rental_pool: number;
    consignment: number;
  };
  by_status: {
    available: number;
    rented: number;
    maintenance: number;
    out_of_service: number;
  };
  expiring_licenses_30_days: number;
  expiring_insurance_30_days: number;
  total_fleet_value: number;
}

export class VehicleOwnershipAPI {
  static async listVehicles(filters?: OwnershipFilters): Promise<VehicleOwnershipRecord[]> {
    let query = supabase
      .from('vehicles')
      .select(`
        id,
        make,
        model,
        year,
        license_plate,
        vin,
        ownership_type,
        category_id,
        categories (
          id,
          name
        ),
        status,
        daily_rate,
        weekly_rate,
        monthly_rate,
        license_expiry,
        insurance_expiry,
        created_at,
        updated_at
      `)
      .order('make, model');

    if (filters?.ownership_type) {
      query = query.eq('ownership_type', filters.ownership_type);
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status as any);
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.or(`make.ilike.${searchPattern},model.ilike.${searchPattern},license_plate.ilike.${searchPattern},vin.ilike.${searchPattern}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as VehicleOwnershipRecord[];
  }

  static async getVehicle(id: string): Promise<VehicleOwnershipRecord> {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        make,
        model,
        year,
        license_plate,
        vin,
        ownership_type,
        category_id,
        categories (
          id,
          name
        ),
        status,
        daily_rate,
        weekly_rate,
        monthly_rate,
        license_expiry,
        insurance_expiry,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as VehicleOwnershipRecord;
  }

  static async updateOwnership(
    id: string,
    data: UpdateOwnershipData
  ): Promise<VehicleOwnershipRecord> {
    const { data: result, error } = await supabase
      .from('vehicles')
      .update(data)
      .eq('id', id)
      .select(`
        id,
        make,
        model,
        year,
        license_plate,
        vin,
        ownership_type,
        category_id,
        categories (
          id,
          name
        ),
        status,
        daily_rate,
        weekly_rate,
        monthly_rate,
        license_expiry,
        insurance_expiry,
        created_at,
        updated_at
      `)
      .single();

    if (error) throw error;
    return result as VehicleOwnershipRecord;
  }

  static async getStatistics(): Promise<OwnershipStatistics> {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('ownership_type, status, license_expiry, insurance_expiry');

    if (error) throw error;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const stats: OwnershipStatistics = {
      total_vehicles: vehicles.length,
      by_ownership_type: {
        owned: 0,
        leased: 0,
        financed: 0,
        rental_pool: 0,
        consignment: 0,
      },
      by_status: {
        available: 0,
        rented: 0,
        maintenance: 0,
        out_of_service: 0,
      },
      expiring_licenses_30_days: 0,
      expiring_insurance_30_days: 0,
      total_fleet_value: 0,
    };

    vehicles.forEach((vehicle) => {
      // Count by ownership type
      if (vehicle.ownership_type && vehicle.ownership_type in stats.by_ownership_type) {
        stats.by_ownership_type[vehicle.ownership_type as keyof typeof stats.by_ownership_type]++;
      }

      // Count by status
      if (vehicle.status && vehicle.status in stats.by_status) {
        stats.by_status[vehicle.status as keyof typeof stats.by_status]++;
      }

      // Count expiring licenses
      if (vehicle.license_expiry) {
        const expiryDate = new Date(vehicle.license_expiry);
        if (expiryDate > now && expiryDate <= thirtyDaysFromNow) {
          stats.expiring_licenses_30_days++;
        }
      }

      // Count expiring insurance
      if (vehicle.insurance_expiry) {
        const expiryDate = new Date(vehicle.insurance_expiry);
        if (expiryDate > now && expiryDate <= thirtyDaysFromNow) {
          stats.expiring_insurance_30_days++;
        }
      }
    });

    return stats;
  }
}
