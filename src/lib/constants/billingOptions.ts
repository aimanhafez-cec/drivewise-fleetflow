export const BILLING_DAY_OPTIONS = [
  { id: '1st', label: '1st of Month', value: '1st' },
  { id: '15th', label: '15th of Month', value: '15th' },
  { id: 'EOM', label: 'End of Month (EOM)', value: 'EOM' },
  { id: 'Anniversary', label: 'Anniversary Date', value: 'Anniversary' }
];

export const LINE_ITEM_GRANULARITY_OPTIONS = [
  { 
    id: 'base_rent_addons', 
    label: 'Base Rent + Add-ons', 
    value: 'base_rent_addons',
    description: 'Show base rental rate and add-ons separately'
  },
  { 
    id: 'one_total', 
    label: 'One Total', 
    value: 'one_total',
    description: 'Show single combined amount'
  },
  { 
    id: 'detailed_category', 
    label: 'Detailed by Category', 
    value: 'detailed_category',
    description: 'Break down all costs by category (vehicle, insurance, maintenance, etc.)'
  }
];

export const BILLING_START_TRIGGER_OPTIONS = [
  { 
    id: 'vehicle_delivery', 
    label: 'Vehicle Delivery Date', 
    value: 'vehicle_delivery',
    description: 'Billing starts when vehicle is delivered'
  },
  { 
    id: 'contract_effective', 
    label: 'Contract Effective Date', 
    value: 'contract_effective',
    description: 'Billing starts on contract effective date'
  },
  { 
    id: 'custom_date', 
    label: 'Custom Date', 
    value: 'custom_date',
    description: 'Billing starts on manually specified date'
  }
];

// Helper functions to get labels from values
export const getBillingDayLabel = (value?: string): string => {
  if (!value) return 'Anniversary Date';
  const option = BILLING_DAY_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
};

export const getLineItemGranularityLabel = (value?: string): string => {
  if (!value) return 'Base Rent + Add-ons';
  const option = LINE_ITEM_GRANULARITY_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
};

export const getBillingStartTriggerLabel = (value?: string): string => {
  if (!value) return 'Vehicle Delivery Date';
  const option = BILLING_START_TRIGGER_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
};
