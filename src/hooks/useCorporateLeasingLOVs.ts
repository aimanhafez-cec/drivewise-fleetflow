import { useLOV, useLOVById } from './useLOV';

// Legal Entity LOV
export interface LegalEntity {
  id: string;
  label: string;
  name: string;
  code: string;
  tax_registration_no?: string;
  country_code: string;
  currency: string;
  vat_rate: number;
}

export const useLegalEntities = () => {
  const result = useLOV<LegalEntity>('legal_entities', 'id, name, code, tax_registration_no, country_code, currency, vat_rate', {
    searchFields: ['name', 'code'],
    orderBy: 'name'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.name} (${item.code})`
    }))
  };
};

export const useLegalEntityById = (id?: string) => {
  return useLOVById<LegalEntity>('legal_entities', 'id, name, code, tax_registration_no, country_code, currency, vat_rate', id);
};

// Customer Sites LOV
export interface CustomerSite {
  id: string;
  label: string;
  customer_id: string;
  site_name: string;
  site_code?: string;
  site_type: 'Bill-to' | 'Ship-to' | 'Both';
  contact_person?: string;
  contact_email?: string;
}

export const useCustomerSites = (customerId?: string) => {
  const result = useLOV<CustomerSite>('customer_sites', 'id, customer_id, site_name, site_code, site_type, contact_person, contact_email', {
    dependencies: customerId ? { customer_id: customerId } : {},
    searchFields: ['site_name', 'site_code'],
    orderBy: 'site_name'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.site_name}${item.site_code ? ' (' + item.site_code + ')' : ''} - ${item.site_type}`
    }))
  };
};

// Cost Centers LOV
export interface CostCenter {
  id: string;
  label: string;
  customer_id: string;
  code: string;
  name: string;
  description?: string;
  manager_name?: string;
  budget_limit?: number;
}

export const useCostCenters = (customerId?: string) => {
  const result = useLOV<CostCenter>('cost_centers', 'id, customer_id, code, name, description, manager_name, budget_limit', {
    dependencies: customerId ? { customer_id: customerId } : {},
    searchFields: ['code', 'name'],
    orderBy: 'code'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: `${item.code} - ${item.name}`
    }))
  };
};

// Corporate Leasing Agreements LOV
export interface CorporateLeasingAgreement {
  id: string;
  label: string;
  agreement_no?: string;
  customer_id: string;
  status: 'draft' | 'pending_approval' | 'active' | 'suspended' | 'terminated' | 'expired';
  master_term: string;
  contract_start_date?: string;
  contract_end_date?: string;
}

export const useCorporateLeasingAgreements = (status?: string) => {
  const result = useLOV<CorporateLeasingAgreement>('corporate_leasing_agreements', 'id, agreement_no, customer_id, status, master_term, contract_start_date, contract_end_date', {
    dependencies: status ? { status } : {},
    searchFields: ['agreement_no'],
    orderBy: 'created_at desc'
  });
  
  return {
    ...result,
    items: result.items.map(item => ({
      ...item,
      label: item.agreement_no || `Draft Agreement ${item.id.substring(0, 8)}`
    }))
  };
};

export const useCorporateLeasingAgreementById = (id?: string) => {
  return useLOVById<CorporateLeasingAgreement>('corporate_leasing_agreements', 'id, agreement_no, customer_id, status, master_term, contract_start_date, contract_end_date', id);
};

// Static LOV options for enum values
export const CUSTOMER_SEGMENTS = [
  { id: 'SME', label: 'SME' },
  { id: 'Enterprise', label: 'Enterprise' },
  { id: 'Government', label: 'Government' }
];

export const CREDIT_TERMS = [
  { id: 'Immediate', label: 'Immediate Payment' },
  { id: 'Net 15', label: 'Net 15 Days' },
  { id: 'Net 30', label: 'Net 30 Days' },
  { id: 'Net 45', label: 'Net 45 Days' },
  { id: 'Custom', label: 'Custom Terms' }
];

export const FRAMEWORK_MODELS = [
  { id: 'Rate Card by Class', label: 'Rate Card by Class' },
  { id: 'Fixed Rate per VIN', label: 'Fixed Rate per VIN' }
];

export const CONTRACT_TERMS = [
  { id: '12 months', label: '12 months' },
  { id: '24 months', label: '24 months' },
  { id: '36 months', label: '36 months' },
  { id: '48 months', label: '48 months' },
  { id: 'Open-ended', label: 'Open-ended' }
];

export const BILLING_DAYS = [
  { id: '1st', label: '1st of Month' },
  { id: '15th', label: '15th of Month' },
  { id: 'Month-End', label: 'Month-End' },
  { id: 'Anniversary', label: 'Anniversary Date' }
];

export const INVOICE_FORMATS = [
  { id: 'Consolidated', label: 'Consolidated (all vehicles)' },
  { id: 'Per Vehicle', label: 'Per Vehicle' },
  { id: 'Per Cost Center', label: 'Per Cost Center' }
];

export const LINE_ITEM_GRANULARITIES = [
  { id: 'Base Rent', label: 'Base Rent Only' },
  { id: 'Base Rent + Add-ons', label: 'Base Rent + Add-ons' },
  { id: 'Base Rent + Add-ons + Variable', label: 'Base Rent + Add-ons + Variable (KM/Tolls/Fines)' }
];

export const COST_ALLOCATION_MODES = [
  { id: 'Per Vehicle', label: 'Per Vehicle' },
  { id: 'Per Cost Center', label: 'Per Cost Center' },
  { id: 'Project', label: 'Project Based' }
];

export const INSURANCE_RESPONSIBILITIES = [
  { id: 'Included (Lessor)', label: 'Included (Lessor)' },
  { id: 'Customer Own Policy', label: 'Customer Own Policy' }
];

export const MAINTENANCE_POLICIES = [
  { id: 'Basic PM', label: 'Basic Preventive Maintenance' },
  { id: 'Full (PM+wear)', label: 'Full Maintenance (PM + Wear Items)' },
  { id: 'Customer', label: 'Customer Responsibility' }
];

export const SECURITY_INSTRUMENTS = [
  { id: 'None', label: 'No Security Required' },
  { id: 'Deposit per Vehicle', label: 'Deposit per Vehicle' },
  { id: 'Bank Guarantee', label: 'Bank Guarantee' }
];

export const RENEWAL_OPTIONS = [
  { id: 'Month-to-Month', label: 'Month-to-Month Extension' },
  { id: 'New Term', label: 'New Fixed Term' },
  { id: 'None', label: 'No Renewal Option' }
];

export const SALIK_DARB_HANDLING = [
  { id: 'Rebill Actual (monthly)', label: 'Rebill Actual (monthly)' },
  { id: 'Included Allowance', label: 'Included Allowance (cap/month)' }
];

export const TOLLS_ADMIN_FEE_MODELS = [
  { id: 'None', label: 'No Admin Fee' },
  { id: 'Per-event', label: 'Per Event Fee' },
  { id: 'Per-invoice', label: 'Per Invoice Fee' }
];

export const TRAFFIC_FINES_HANDLING = [
  { id: 'Auto Rebill + Admin Fee', label: 'Auto Rebill + Admin Fee' }
];

export const FUEL_HANDLING = [
  { id: 'Customer Fuel', label: 'Customer Responsibility' },
  { id: 'Fuel Card (rebill)', label: 'Fuel Card (rebill to customer)' },
  { id: 'Included Allowance', label: 'Included Fuel Allowance' }
];

export const WORKSHOP_PREFERENCES = [
  { id: 'OEM', label: 'OEM Authorized Workshops' },
  { id: 'In-house', label: 'In-house Workshop' },
  { id: 'Partner', label: 'Partner Network' }
];

export const TYRES_POLICIES = [
  { id: 'Included after 20000 km', label: 'Included after 20,000 km' },
  { id: 'Included after 30000 km', label: 'Included after 30,000 km' },
  { id: 'Customer Pays', label: 'Customer Responsibility' }
];

export const REGISTRATION_RESPONSIBILITIES = [
  { id: 'Lessor', label: 'Lessor Handles Registration' },
  { id: 'Customer', label: 'Customer Handles Registration' }
];