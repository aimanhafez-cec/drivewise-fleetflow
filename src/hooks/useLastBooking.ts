import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LastBookingData {
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin';
  vehicleClassId?: string;
  vehicleClassName?: string;
  makeModel?: string;
  specificVehicleId?: string;
  pickupLocation: string;
  returnLocation: string;
  selectedAddOns: string[];
  addOnCharges: Record<string, number>;
  insurancePackage?: string;
  notes?: string;
}

export const useLastBooking = (customerId: string | null) => {
  return useQuery({
    queryKey: ['last-booking', customerId],
    queryFn: async (): Promise<LastBookingData | null> => {
      if (!customerId) return null;

      // Fetch the most recent agreement for this customer
      const { data: agreements, error } = await supabase
        .from('agreements')
        .select(`
          *,
          agreement_lines(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!agreements || agreements.length === 0) return null;

      const lastAgreement = agreements[0];
      const lastLine = lastAgreement.agreement_lines?.[0];

      // Determine reservation type based on what was booked
      let reservationType: 'vehicle_class' | 'make_model' | 'specific_vin' = 'vehicle_class';
      let vehicleClassId: string | undefined;
      let vehicleClassName: string | undefined;
      let makeModel: string | undefined;
      let specificVehicleId: string | undefined;

      if (lastAgreement.vehicle_id) {
        // Specific vehicle was booked
        reservationType = 'specific_vin';
        specificVehicleId = lastAgreement.vehicle_id;
      } else if (lastLine?.vehicle_class_id) {
        // Vehicle class was booked
        reservationType = 'vehicle_class';
        vehicleClassId = lastLine.vehicle_class_id;

        // Fetch vehicle class name
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', lastLine.vehicle_class_id)
          .single();

        vehicleClassName = categoryData?.name;
      }

      // Extract add-ons
      const addOns = (lastAgreement.add_ons as any[]) || [];
      const selectedAddOns = addOns.map(addon => addon.id || addon.addOnId).filter(Boolean);
      const addOnCharges: Record<string, number> = {};
      addOns.forEach(addon => {
        const id = addon.id || addon.addOnId;
        if (id) {
          addOnCharges[id] = addon.cost || addon.total || 0;
        }
      });

      return {
        reservationType,
        vehicleClassId,
        vehicleClassName,
        makeModel,
        specificVehicleId,
        pickupLocation: lastLine?.out_location_id || 'Dubai Airport Terminal 1',
        returnLocation: lastLine?.in_location_id || 'Dubai Airport Terminal 1',
        selectedAddOns,
        addOnCharges,
        insurancePackage: lastAgreement.insurance_package_type,
        notes: lastAgreement.notes,
      };
    },
    enabled: !!customerId,
  });
};
