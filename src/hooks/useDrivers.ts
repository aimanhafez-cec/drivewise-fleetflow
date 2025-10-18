import { useLOV, useLOVById } from './useLOV';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

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
  
  // UAE-Specific Fields
  emirates_id?: string;
  passport_number?: string;
  nationality?: string;
  license_issued_by?: string;
  license_issue_date?: string;
  license_categories?: string[];
  
  // Employment
  employment_id?: string;
  department?: string;
  
  // Verification
  verification_status?: 'unverified' | 'pending_docs' | 'verified' | 'approved' | 'rejected' | 'expired';
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  
  // Additional UAE fields
  visa_expiry?: string;
  address_emirate?: string;
  last_verification_check?: string;
}

export const useDrivers = (searchQuery?: string, useEnhanced: boolean = false) => {
  // Use enhanced search if requested and query is long enough
  const enhancedSearch = useSearchDriversEnhanced(
    searchQuery || '', 
    useEnhanced && (searchQuery?.length || 0) >= 2
  );

  // Use basic LOV search as fallback
  const result = useLOV<Driver>('drivers', 'id, full_name, license_no, phone, email, date_of_birth, license_expiry, status, additional_driver_fee, emirates_id, passport_number, nationality, license_issued_by, license_issue_date, license_categories, employment_id, department, verification_status, verified_at, verified_by, rejection_reason, visa_expiry, address_emirate, last_verification_check', {
    searchFields: ['full_name', 'license_no', 'email', 'emirates_id'],
    orderBy: 'full_name'
  });
  
  if (searchQuery !== undefined && !useEnhanced) {
    result.updateSearch(searchQuery);
  }

  // If using enhanced search and it has results, return those
  if (useEnhanced && enhancedSearch.data) {
    return {
      items: enhancedSearch.data.map(item => ({
        ...item,
        label: item.label || `${item.full_name}${item.nationality ? ` (${item.nationality})` : ''} - ${item.license_no}`
      })),
      isLoading: enhancedSearch.isLoading,
      error: enhancedSearch.error,
      updateSearch: () => {}, // Not needed for enhanced search
      loadMore: () => {},
      hasMore: false
    };
  }
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.full_name}${item.nationality ? ` (${item.nationality})` : ''} - ${item.license_no}`
    }))
  };
};

// Enhanced search across multiple driver fields
export const useSearchDriversEnhanced = (searchTerm: string, enabled: boolean = true) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return useQuery({
    queryKey: ['drivers-enhanced-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('search_drivers_enhanced', {
          p_search_term: debouncedSearch,
          p_limit: 50
        });

      if (error) throw error;
      return data as Array<Driver & { match_field: string }>;
    },
    enabled: enabled && debouncedSearch.length >= 2
  });
};

export const useDriverById = (id?: string) => {
  return useLOVById<Driver>('drivers', 'id, full_name, license_no, phone, email, date_of_birth, license_expiry, status, additional_driver_fee, emirates_id, passport_number, nationality, license_issued_by, license_issue_date, license_categories, employment_id, department, verification_status, verified_at, verified_by, rejection_reason, visa_expiry, address_emirate, last_verification_check', id);
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
          additional_driver_fee: driver.additional_driver_fee || 25.00
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