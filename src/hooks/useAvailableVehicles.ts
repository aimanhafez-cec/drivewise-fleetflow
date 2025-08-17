import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { vehicleAssignmentAPI } from '@/lib/api/vehicleAssignment';

export interface AvailableVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  status: string;
  daily_rate?: number;
  category: {
    id: string;
    name: string;
    description?: string;
  };
}

interface UseAvailableVehiclesParams {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  outLocationId?: string;
  inLocationId?: string;
  enabled?: boolean;
}

export const useAvailableVehicles = ({
  startDate,
  endDate,
  categoryId,
  outLocationId,
  inLocationId,
  enabled = true
}: UseAvailableVehiclesParams) => {
  return useQuery({
    queryKey: ['available-vehicles', startDate?.toISOString(), endDate?.toISOString(), categoryId, outLocationId, inLocationId],
    queryFn: async (): Promise<AvailableVehicle[]> => {
      if (!startDate || !endDate) {
        return [];
      }

      // Use the existing vehicleAssignmentAPI to get available vehicles
      const vehicles = await vehicleAssignmentAPI.getAvailableVehicles(startDate, endDate, categoryId);
      
      // Fetch additional vehicle details with category information
      const { data: vehicleDetails, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          make,
          model,
          year,
          license_plate,
          vin,
          status,
          daily_rate,
          category:categories(id, name, description)
        `)
        .in('id', vehicles.map(v => v.id));

      if (error) throw error;

      return vehicleDetails as AvailableVehicle[];
    },
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const formatVehicleDisplay = (vehicle: AvailableVehicle): string => {
  return `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.license_plate}`;
};

export const useVehicleAvailabilityCheck = (
  vehicleId?: string,
  startDate?: Date,
  endDate?: Date,
  agreementId?: string
) => {
  return useQuery({
    queryKey: ['vehicle-availability', vehicleId, startDate?.toISOString(), endDate?.toISOString(), agreementId],
    queryFn: async (): Promise<boolean> => {
      if (!vehicleId || !startDate || !endDate) {
        return false;
      }

      return await vehicleAssignmentAPI.checkVehicleAvailability({
        vehicleId,
        startDate,
        endDate,
        excludeAgreementId: agreementId
      });
    },
    enabled: !!vehicleId && !!startDate && !!endDate,
    staleTime: 30 * 1000, // 30 seconds
  });
};