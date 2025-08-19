import { useLOV, useLOVById } from './useLOV';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Driver {
  id: string;
  label: string;
  full_name: string;
  license_no: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  license_expiry?: string;
  status: string;
  additional_driver_fee: number;
  role?: 'PRIMARY' | 'ADDITIONAL';
}

export const useDrivers = (searchQuery?: string) => {
  const result = useLOV<Driver>('drivers', 'id, full_name, license_no, phone, email, date_of_birth, license_expiry, status, additional_driver_fee', {
    searchFields: ['full_name', 'license_no', 'email'],
    orderBy: 'full_name'
  });
  
  if (searchQuery !== undefined) {
    result.updateSearch(searchQuery);
  }
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.full_name} (${item.license_no})`
    }))
  };
};

export const useDriverById = (id?: string) => {
  return useLOVById<Driver>('drivers', 'id, full_name, license_no, phone, email, date_of_birth, license_expiry, status, additional_driver_fee', id);
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (driver: Omit<Driver, 'id' | 'label'>) => {
      const { data, error } = await supabase
        .from('drivers')
        .insert({
          full_name: driver.full_name,
          license_no: driver.license_no,
          phone: driver.phone,
          email: driver.email,
          date_of_birth: driver.date_of_birth,
          license_expiry: driver.license_expiry,
          status: driver.status || 'active',
          additional_driver_fee: driver.additional_driver_fee || 300.00
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const getDriverAgeWarning = (dateOfBirth?: string): string | null => {
  if (!dateOfBirth) return null;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1 < 25 ? 'Under 25 - Additional fees may apply' : null;
  }
  
  return age < 25 ? 'Under 25 - Additional fees may apply' : null;
};

export const getLicenseExpiryWarning = (licenseExpiry?: string): string | null => {
  if (!licenseExpiry) return null;
  
  const expiry = new Date(licenseExpiry);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return 'License has expired';
  } else if (daysUntilExpiry <= 30) {
    return `License expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  }
  
  return null;
};