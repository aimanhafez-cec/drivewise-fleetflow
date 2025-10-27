// Agreement Line Types for Multi-Line Support

export interface AgreementLine {
  id: string; // Unique line identifier
  lineNumber: number; // Display order
  
  // Vehicle Information
  vehicleClassId?: string;
  specificVehicleId?: string;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    plateNumber?: string;
    color?: string;
  };
  
  // Drivers
  primaryDriverId: string;
  additionalDriverIds: string[];
  
  // Rental Period
  checkOutDateTime: string;
  checkOutLocationId: string;
  checkInDateTime: string;
  checkInLocationId: string;
  
  // Pricing
  baseRate: number;
  insurancePackage: 'comprehensive' | 'tpl';
  excessAmount: number;
  maintenanceIncluded: boolean;
  maintenanceCost?: number;
  
  // Line-specific add-ons
  addons: Array<{
    addonId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  // Line pricing breakdown
  pricingBreakdown: {
    baseRate: number;
    insurance: number;
    maintenance: number;
    addons: number;
    subtotal: number;
    discount: number;
    taxableAmount: number;
    vat: number;
    total: number;
  };
  
  // Line-specific notes
  specialInstructions?: string;
  internalNotes?: string;
  
  // Validation status
  isValid: boolean;
  errors: string[];
}

export interface MultiLineAgreementData {
  // Header-level information (shared across all lines)
  customerId: string;
  customerVerified: boolean;
  agreementType: 'daily' | 'weekly' | 'monthly' | 'long_term';
  rentalPurpose: 'business' | 'personal' | 'tourism';
  
  // Multi-line configuration
  lines: AgreementLine[];
  
  // Consolidated pricing (sum of all lines)
  totalPricing: {
    subtotal: number;
    discount: number;
    taxableAmount: number;
    vat: number;
    total: number;
  };
  
  // Shared settings
  mileagePackage: 'unlimited' | 'limited';
  includedKm?: number;
  excessKmRate?: number;
  crossBorderAllowed: boolean;
  crossBorderCountries?: string[];
  salikAccountNo?: string;
  darbAccountNo?: string;
  
  // Payment (shared for all lines)
  billingType: 'same' | 'different' | 'corporate';
  paymentMethod: string;
  paymentSchedule: 'upfront' | 'monthly' | 'postpaid';
  
  // Global notes
  headerNotes?: string;
}

export interface LineTemplate {
  name: string;
  description: string;
  vehicleClassId: string;
  insurancePackage: 'comprehensive' | 'tpl';
  maintenanceIncluded: boolean;
  addons: string[]; // addon IDs
}

export const DEFAULT_LINE_TEMPLATES: LineTemplate[] = [
  {
    name: 'Standard Sedan',
    description: 'Economy sedan with comprehensive insurance',
    vehicleClassId: 'sedan-economy',
    insurancePackage: 'comprehensive',
    maintenanceIncluded: true,
    addons: [],
  },
  {
    name: 'Premium SUV',
    description: 'Luxury SUV with full coverage',
    vehicleClassId: 'suv-premium',
    insurancePackage: 'comprehensive',
    maintenanceIncluded: true,
    addons: ['gps', 'child-seat'],
  },
  {
    name: 'Basic Economy',
    description: 'Economy car with TPL insurance',
    vehicleClassId: 'economy',
    insurancePackage: 'tpl',
    maintenanceIncluded: false,
    addons: [],
  },
];
