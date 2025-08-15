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

// Price Lists with rates - exported for type checking
export interface PriceList {
  id: string;
  label: string;
  value: string;
  rates: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    kilometerCharge: number;
    dailyKilometerAllowed: number;
  };
}

const priceLists: PriceList[] = [
  {
    id: 'standard',
    label: 'Standard Rates',
    value: 'standard',
    rates: {
      hourly: 150,
      daily: 2500,
      weekly: 15000,
      monthly: 55000,
      kilometerCharge: 5,
      dailyKilometerAllowed: 200
    }
  },
  {
    id: 'premium',
    label: 'Premium Rates',
    value: 'premium',
    rates: {
      hourly: 250,
      daily: 3500,
      weekly: 22000,
      monthly: 80000,
      kilometerCharge: 7,
      dailyKilometerAllowed: 300
    }
  },
  {
    id: 'corporate',
    label: 'Corporate Rates',
    value: 'corporate',
    rates: {
      hourly: 120,
      daily: 2000,
      weekly: 12000,
      monthly: 45000,
      kilometerCharge: 4,
      dailyKilometerAllowed: 250
    }
  }
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
  // National
  { id: 'egypt_vat_standard', label: 'Egypt VAT 14% (Standard)', value: 'egypt_vat_standard' },
  { id: 'egypt_vat_reduced', label: 'Egypt VAT 10% (Reduced – long term lease)', value: 'egypt_vat_reduced' },
  { id: 'egypt_vat_exempt', label: 'Egypt VAT Exempt (Govt/Diplomatic)', value: 'egypt_vat_exempt' },
  
  // Governorate
  { id: 'cairo_vat', label: 'Cairo – VAT 14% + City Transport Fee 3%', value: 'cairo_vat' },
  { id: 'giza_vat', label: 'Giza – VAT 14% + Tourism Levy 2%', value: 'giza_vat' },
  { id: 'alexandria_vat', label: 'Alexandria – VAT 14%', value: 'alexandria_vat' },
  { id: 'red_sea_vat', label: 'Red Sea – VAT 14% + Tourism Fee 5%', value: 'red_sea_vat' },
  { id: 'south_sinai_vat', label: 'South Sinai – VAT 14% + Tourism Fee 5%', value: 'south_sinai_vat' },
  { id: 'luxor_vat', label: 'Luxor – VAT 14% + Tourism Development Fee 3%', value: 'luxor_vat' },
  { id: 'aswan_vat', label: 'Aswan – VAT 14% + Tourism Development Fee 3%', value: 'aswan_vat' },
  
  // Special Zones
  { id: 'suez_canal_vat', label: 'Suez Canal Economic Zone – VAT 14%', value: 'suez_canal_vat' },
  { id: 'free_zone_exempt', label: 'Free Zone – VAT Exempt', value: 'free_zone_exempt' },
  
  // Service-Specific
  { id: 'insurance_only_vat', label: 'Insurance Only – VAT 14%', value: 'insurance_only_vat' },
  { id: 'addons_vat', label: 'Add-ons – VAT 14%', value: 'addons_vat' },
  { id: 'fuel_service_vat', label: 'Fuel Service – VAT 14%', value: 'fuel_service_vat' },
  { id: 'driver_service_vat', label: 'Driver Service – VAT 14%', value: 'driver_service_vat' },
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

  getPriceLists: async (): Promise<DropdownOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 120));
    return priceLists.map(pl => ({ id: pl.id, label: pl.label, value: pl.value }));
  },

  getPriceListRates: async (priceListId: string): Promise<PriceList['rates'] | null> => {
    await new Promise(resolve => setTimeout(resolve, 80));
    const priceList = priceLists.find(pl => pl.id === priceListId);
    return priceList?.rates || null;
  },

  createReservation: async (data: Partial<ReservationFormData>, status: 'DRAFT' | 'ACTIVE'): Promise<CreateReservationResponse> => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Validate required fields
    if (!data.customerId) {
      throw new Error('Customer is required');
    }
    
    // Convert status to database enum values
    const dbStatus = status === 'DRAFT' ? 'pending' : 'confirmed';
    
    // Get current date for defaults or use form data dates
    const now = new Date();
    const startDate = (data as any).checkOutDate || new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = (data as any).checkInDate || new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    
    // Calculate total amount from reservation lines
    const calculateTotalAmount = () => {
      const reservationLines = (data as any).reservationLines;
      if (!reservationLines || reservationLines.length === 0) {
        return 299.99; // Default fallback
      }
      
      return reservationLines.reduce((total: number, line: any) => {
        return total + (line.lineTotal || line.lineNetPrice || 0);
      }, 0);
    };
    
    const totalAmount = calculateTotalAmount();
    
    try {
      // Generate reservation number first
      const { data: reservationNoData, error: reservationNoError } = await supabase
        .rpc('generate_reservation_no');
      
      if (reservationNoError) {
        console.error('Error generating reservation number:', reservationNoError);
        throw reservationNoError;
      }
      
      const reservationNo = reservationNoData;
      
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
          total_amount: totalAmount,
          ro_number: reservationNo, // Set the reservation number immediately
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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