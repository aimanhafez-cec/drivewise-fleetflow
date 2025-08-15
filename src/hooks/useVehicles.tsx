import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
  category_id?: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description?: string;
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate, status, category_id')
        .eq('status', 'available')
        .order('make, model');
      
      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });
};

export const useVehicleCategories = () => {
  return useQuery({
    queryKey: ['vehicle-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      return (data || []) as VehicleCategory[];
    },
  });
};

export const useAllVehicles = () => {
  return useQuery({
    queryKey: ['vehicles-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate, status, category_id')
        .order('make, model');
      
      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });
};

export const formatVehicleDisplay = (vehicle: Vehicle): string => {
  return `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.license_plate}`;
};