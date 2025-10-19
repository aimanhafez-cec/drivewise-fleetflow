import { useQuery } from '@tanstack/react-query';

// Mock business units data until the table is created
const mockBusinessUnits = [
  { id: 'bu-001', name: 'Dubai Operations', code: 'DXB', is_active: true },
  { id: 'bu-002', name: 'Abu Dhabi Operations', code: 'AUH', is_active: true },
  { id: 'bu-003', name: 'Sharjah Operations', code: 'SHJ', is_active: true },
  { id: 'bu-004', name: 'Corporate Fleet', code: 'CORP', is_active: true },
];

export const useBusinessUnits = () => {
  return useQuery({
    queryKey: ['business-units'],
    queryFn: async () => {
      // Return mock data for now
      return mockBusinessUnits;
      
      // Future implementation when table exists:
      // const { data, error } = await supabase
      //   .from('business_units')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('name');
      // 
      // if (error) throw error;
      // return data || [];
    },
  });
};
