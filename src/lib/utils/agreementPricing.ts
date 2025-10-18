/**
 * Utility functions for agreement pricing calculations with backwards compatibility
 */

export interface AgreementLinePricing {
  hasBreakdown: boolean;
  baseRate: number;
  insuranceCost: number;
  insurancePackage: string;
  maintenanceCost: number;
  roadsideCost: number;
  replacementCost: number;
  calculatedTotal: number;
  isLegacy?: boolean;
}

/**
 * Calculate pricing components for an agreement line, handling legacy data
 */
export const calculateAgreementLinePricing = (line: any): AgreementLinePricing => {
  // If line has component breakdown, use it
  if (line.base_vehicle_rate_per_month !== null && line.base_vehicle_rate_per_month !== undefined) {
    return {
      hasBreakdown: true,
      baseRate: line.base_vehicle_rate_per_month || 0,
      insuranceCost: line.monthly_insurance_cost_per_vehicle || 0,
      insurancePackage: line.insurance_package_type || 'comprehensive',
      maintenanceCost: line.monthly_maintenance_cost_per_vehicle || 0,
      roadsideCost: line.roadside_assistance_cost_monthly || 0,
      replacementCost: line.replacement_vehicle_cost_monthly || 0,
      calculatedTotal: (
        (line.base_vehicle_rate_per_month || 0) +
        (line.monthly_insurance_cost_per_vehicle || 0) +
        (line.monthly_maintenance_cost_per_vehicle || 0) +
        (line.roadside_assistance_cost_monthly || 0) +
        (line.replacement_vehicle_cost_monthly || 0)
      ),
    };
  }
  
  // Legacy format: use line_net as total
  const lineNet = line.line_net || 0;
  return {
    hasBreakdown: false,
    baseRate: lineNet, // Show entire amount as base for legacy
    insuranceCost: 0,
    insurancePackage: 'unknown',
    maintenanceCost: 0,
    roadsideCost: 0,
    replacementCost: 0,
    calculatedTotal: lineNet,
    isLegacy: true,
  };
};

/**
 * Calculate pricing components for an agreement, handling legacy data
 */
export const calculateAgreementPricing = (agreement: any): AgreementLinePricing => {
  // If agreement has component breakdown, use it
  if (agreement.base_vehicle_rate_per_month !== null && agreement.base_vehicle_rate_per_month !== undefined) {
    return {
      hasBreakdown: true,
      baseRate: agreement.base_vehicle_rate_per_month || 0,
      insuranceCost: agreement.monthly_insurance_cost_per_vehicle || 0,
      insurancePackage: agreement.insurance_package_type || 'comprehensive',
      maintenanceCost: agreement.monthly_maintenance_cost_per_vehicle || 0,
      roadsideCost: agreement.roadside_assistance_cost_monthly || 0,
      replacementCost: agreement.replacement_vehicle_cost_monthly || 0,
      calculatedTotal: (
        (agreement.base_vehicle_rate_per_month || 0) +
        (agreement.monthly_insurance_cost_per_vehicle || 0) +
        (agreement.monthly_maintenance_cost_per_vehicle || 0) +
        (agreement.roadside_assistance_cost_monthly || 0) +
        (agreement.replacement_vehicle_cost_monthly || 0)
      ),
    };
  }
  
  // Legacy format
  return {
    hasBreakdown: false,
    baseRate: agreement.total_amount || 0,
    insuranceCost: 0,
    insurancePackage: 'unknown',
    maintenanceCost: 0,
    roadsideCost: 0,
    replacementCost: 0,
    calculatedTotal: agreement.total_amount || 0,
    isLegacy: true,
  };
};
