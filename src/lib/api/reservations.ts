// Mock API service for reservation form data
export interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  billToOptions: DropdownOption[];
}

export interface ReservationFormData {
  reservationNo: string | null;
  entryDate: Date;
  reservationMethodId: string;
  currencyCode: string;
  reservationTypeId: string;
  businessUnitId: string;
  customerId: string;
  billToId: string;
  paymentTermsId: string;
  validityDateTo: Date | null;
  discountTypeId: string | null;
  discountValue: number | string | null;
  contractBillingPlanId: string | null;
  taxLevelId: string | null;
  taxCodeId: string | null;
  leaseToOwn: boolean;
}

export interface CreateReservationResponse {
  id: string;
  reservationNo: string;
  status: string;
}

// Mock data sources
const currencies: DropdownOption[] = [
  { id: 'USD', label: 'US Dollar', value: 'USD' },
  { id: 'EUR', label: 'Euro', value: 'EUR' },
  { id: 'GBP', label: 'British Pound', value: 'GBP' },
  { id: 'CAD', label: 'Canadian Dollar', value: 'CAD' },
];

const reservationMethods: DropdownOption[] = [
  { id: 'online', label: 'Online Booking', value: 'online' },
  { id: 'phone', label: 'Phone Reservation', value: 'phone' },
  { id: 'walkin', label: 'Walk-in', value: 'walkin' },
  { id: 'agent', label: 'Travel Agent', value: 'agent' },
];

const reservationTypes: DropdownOption[] = [
  { id: 'standard', label: 'Standard Rental', value: 'standard' },
  { id: 'corporate', label: 'Corporate Rental', value: 'corporate' },
  { id: 'longterm', label: 'Long-term Lease', value: 'longterm' },
  { id: 'replacement', label: 'Replacement Vehicle', value: 'replacement' },
];

const businessUnits: DropdownOption[] = [
  { id: 'downtown', label: 'Downtown Branch', value: 'downtown' },
  { id: 'airport', label: 'Airport Location', value: 'airport' },
  { id: 'suburban', label: 'Suburban Office', value: 'suburban' },
  { id: 'mall', label: 'Shopping Mall Kiosk', value: 'mall' },
];

const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    billToOptions: [
      { id: 'personal', label: 'Personal Account', value: 'personal' },
      { id: 'company', label: 'Smith Enterprises', value: 'company' },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    billToOptions: [
      { id: 'personal', label: 'Personal Account', value: 'personal' },
    ],
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@corp.com',
    billToOptions: [
      { id: 'corporate', label: 'Davis Corporation', value: 'corporate' },
      { id: 'subsidiary', label: 'Davis Holdings', value: 'subsidiary' },
    ],
  },
];

const paymentTerms: DropdownOption[] = [
  { id: 'immediate', label: 'Payment Due Immediately', value: 'immediate' },
  { id: 'net15', label: 'Net 15 Days', value: 'net15' },
  { id: 'net30', label: 'Net 30 Days', value: 'net30' },
  { id: 'net60', label: 'Net 60 Days', value: 'net60' },
];

const discountTypes: DropdownOption[] = [
  { id: 'percentage', label: 'Percentage Discount', value: 'percentage' },
  { id: 'program', label: 'Named Program', value: 'program' },
  { id: 'coupon', label: 'Coupon Code', value: 'coupon' },
];

const discountPrograms: DropdownOption[] = [
  { id: 'loyalty', label: 'Loyalty Member Discount', value: 'loyalty' },
  { id: 'corporate', label: 'Corporate Rate', value: 'corporate' },
  { id: 'seasonal', label: 'Seasonal Promotion', value: 'seasonal' },
];

const contractBillingPlans: DropdownOption[] = [
  { id: 'standard', label: 'Standard Billing', value: 'standard' },
  { id: 'prepaid', label: 'Prepaid Plan', value: 'prepaid' },
  { id: 'postpaid', label: 'Post-paid Billing', value: 'postpaid' },
  { id: 'monthly', label: 'Monthly Invoicing', value: 'monthly' },
];

const taxLevels: DropdownOption[] = [
  { id: 'federal', label: 'Federal Only', value: 'federal' },
  { id: 'state', label: 'State + Federal', value: 'state' },
  { id: 'local', label: 'Local + State + Federal', value: 'local' },
  { id: 'exempt', label: 'Tax Exempt', value: 'exempt' },
];

const taxCodesByLevel: Record<string, DropdownOption[]> = {
  federal: [
    { id: 'fed_standard', label: 'Federal Standard Rate', value: 'fed_standard' },
  ],
  state: [
    { id: 'state_ca', label: 'California State Tax', value: 'state_ca' },
    { id: 'state_ny', label: 'New York State Tax', value: 'state_ny' },
    { id: 'state_tx', label: 'Texas State Tax', value: 'state_tx' },
  ],
  local: [
    { id: 'local_la', label: 'Los Angeles Local Tax', value: 'local_la' },
    { id: 'local_nyc', label: 'New York City Tax', value: 'local_nyc' },
    { id: 'local_houston', label: 'Houston Local Tax', value: 'local_houston' },
  ],
  exempt: [
    { id: 'exempt_gov', label: 'Government Exempt', value: 'exempt_gov' },
    { id: 'exempt_nonprofit', label: 'Non-profit Exempt', value: 'exempt_nonprofit' },
  ],
};

// Mock API functions
export const mockApi = {
  getCurrencies: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return currencies;
  },

  getReservationMethods: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return reservationMethods;
  },

  getReservationTypes: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return reservationTypes;
  },

  getBusinessUnits: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 180));
    return businessUnits;
  },

  searchCustomers: async (query: string): Promise<Customer[]> => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      let supabaseQuery = supabase
        .from('customers')
        .select('id, full_name, email')
        .order('full_name');
      
      // If there's a search query, filter by name or email
      if (query && query.trim()) {
        supabaseQuery = supabaseQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
      }
      
      const { data: customerRecords, error } = await supabaseQuery;
      
      if (error) {
        console.error('Error fetching customers:', error);
        // Fallback to mock data if Supabase fails
        if (!query) return customers;
        return customers.filter(customer => 
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.email.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Convert customer records to Customer format
      return customerRecords.map(customer => ({
        id: customer.id,
        name: customer.full_name || 'Unknown Customer',
        email: customer.email || '',
        billToOptions: [
          { id: 'personal', label: 'Personal Account', value: 'personal' },
        ],
      }));
    } catch (error) {
      console.error('Error in searchCustomers:', error);
      // Fallback to mock data on error
      if (!query) return customers;
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  getCustomerBillTo: async (customerId: string): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // For now, return default bill-to options
    return [
      { id: 'personal', label: 'Personal Account', value: 'personal' },
      { id: 'company', label: 'Company Account', value: 'company' },
    ];
  },

  getPaymentTerms: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return paymentTerms;
  },

  getDiscountTypes: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return discountTypes;
  },

  getDiscounts: async (type: string): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (type === 'program') {
      return discountPrograms;
    }
    return [];
  },

  getContractBillingPlans: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 220));
    return contractBillingPlans;
  },

  getTaxLevels: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 130));
    return taxLevels;
  },

  getTaxCodes: async (levelId: string): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 180));
    return taxCodesByLevel[levelId] || [];
  },

  createReservation: async (data: Partial<ReservationFormData>, status: 'DRAFT' | 'ACTIVE'): Promise<CreateReservationResponse> => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Validate required fields
    if (!data.customerId) {
      throw new Error('Customer is required');
    }
    
    // Convert status to database enum values
    const dbStatus = status === 'DRAFT' ? 'pending' : 'confirmed';
    
    // Get current date for defaults
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    
    try {
      // Create the reservation
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          customer_id: data.customerId,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          pickup_location: 'Main Location', // Default location
          return_location: 'Main Location', // Default location
          status: dbStatus,
          total_amount: 299.99, // Default amount
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Generate reservation number based on ID
      const reservationNo = `RES-${reservation.id.slice(0, 8).toUpperCase()}`;
      
      // Update with reservation number
      await supabase
        .from('reservations')
        .update({ ro_number: reservationNo })
        .eq('id', reservation.id);
      
      return {
        id: reservation.id,
        reservationNo,
        status: dbStatus,
      };
    } catch (error: any) {
      console.error('Failed to create reservation:', error);
      throw new Error(error.message || 'Failed to create reservation');
    }
  },
};