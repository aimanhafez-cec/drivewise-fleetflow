import { useQuery } from '@tanstack/react-query';

// Mock payment terms data until the table is created
const mockPaymentTerms = [
  { id: 'net-30', name: 'Net 30 Days', display_order: 1, is_active: true },
  { id: 'net-15', name: 'Net 15 Days', display_order: 2, is_active: true },
  { id: 'net-7', name: 'Net 7 Days', display_order: 3, is_active: true },
  { id: 'cod', name: 'Cash on Delivery', display_order: 4, is_active: true },
  { id: 'prepaid', name: 'Prepaid', display_order: 5, is_active: true },
];

export const usePaymentTerms = () => {
  return useQuery({
    queryKey: ['payment-terms'],
    queryFn: async () => {
      // Return mock data for now
      return mockPaymentTerms;
      
      // Future implementation when table exists:
      // const { data, error } = await supabase
      //   .from('payment_terms')
      //   .select('*')
      //   .eq('is_active', true)
      //   .order('display_order', { ascending: true });
      // 
      // if (error) throw error;
      // return data || [];
    },
  });
};
