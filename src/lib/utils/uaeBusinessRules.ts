/**
 * UAE Rental Business Logic Rules
 * Implements pricing calculations and business rules specific to UAE car rentals
 */

import type { InspectionData, DamageMarker } from '@/types/agreement-wizard';

export const VAT_RATE = 0.05; // 5% UAE VAT

/**
 * Fuel Policy Types
 */
export type FuelPolicy = 'FULL_TO_FULL' | 'SAME_TO_SAME' | 'PREPAID';

/**
 * Fuel Calculation
 * Full-to-Full: Customer pays AED 4.50/liter for missing fuel
 * Same-to-Same: No charges if returned at same level
 * Prepaid: No refund for unused fuel
 */
export function calculateFuelCharge(
  checkoutLevel: number,
  checkinLevel: number,
  policy: FuelPolicy = 'FULL_TO_FULL',
  tankCapacity: number = 60 // Standard 60L tank
): number {
  const difference = checkoutLevel - checkinLevel;

  if (policy === 'PREPAID') {
    return 0; // No charges for prepaid fuel
  }

  if (policy === 'SAME_TO_SAME' && difference === 0) {
    return 0; // No charge if returned at same level
  }

  if (difference <= 0) {
    return 0; // No charge if more fuel returned
  }

  // Calculate fuel shortage in liters
  const fuelShortage = (difference / 100) * tankCapacity;
  
  // UAE fuel price (slightly higher than pump price)
  const pricePerLiter = 4.5;
  
  return fuelShortage * pricePerLiter;
}

/**
 * Excess Kilometers Calculation
 * Charged at AED 1.50-3.00/km depending on vehicle class
 * Rounded to nearest 10 km
 * Grace period: 50 km over included limit
 */
export function calculateExcessKmCharge(
  checkoutOdometer: number,
  checkinOdometer: number,
  includedKm: number,
  vehicleClass: 'economy' | 'standard' | 'luxury' | 'premium' = 'standard',
  gracePeriod: number = 50
): { excessKm: number; charge: number; roundedKm: number } {
  const kmDriven = checkinOdometer - checkoutOdometer;
  const excessKm = Math.max(0, kmDriven - includedKm - gracePeriod);
  
  // Round to nearest 10 km
  const roundedKm = Math.ceil(excessKm / 10) * 10;

  // Per km rates by vehicle class
  const rates: Record<string, number> = {
    economy: 1.5,
    standard: 2.0,
    luxury: 2.5,
    premium: 3.0,
  };

  const charge = roundedKm * rates[vehicleClass];

  return {
    excessKm,
    charge,
    roundedKm,
  };
}

/**
 * Cleaning Fees
 * Light cleaning: AED 100
 * Deep cleaning: AED 150-300
 * Smoking inside: AED 500 (non-refundable)
 */
export type CleaningType = 'none' | 'light' | 'deep' | 'smoking';

export function calculateCleaningFee(type: CleaningType): number {
  const fees: Record<CleaningType, number> = {
    none: 0,
    light: 100,
    deep: 200,
    smoking: 500,
  };

  return fees[type];
}

/**
 * Late Return Calculation
 * 1-hour grace period
 * AED 50-100/hour depending on vehicle class
 * After 3 hours, full day charge applies
 */
export function calculateLateReturnCharge(
  scheduledReturn: Date,
  actualReturn: Date,
  vehicleClass: 'economy' | 'standard' | 'luxury' | 'premium' = 'standard',
  dailyRate: number,
  gracePeriodHours: number = 1
): { lateHours: number; charge: number; isFullDay: boolean } {
  const diffMs = actualReturn.getTime() - scheduledReturn.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Apply grace period
  const lateHours = Math.max(0, diffHours - gracePeriodHours);

  if (lateHours === 0) {
    return { lateHours: 0, charge: 0, isFullDay: false };
  }

  // If more than 3 hours late, charge full day
  if (lateHours > 3) {
    return {
      lateHours,
      charge: dailyRate,
      isFullDay: true,
    };
  }

  // Hourly rates by vehicle class
  const hourlyRates: Record<string, number> = {
    economy: 50,
    standard: 75,
    luxury: 100,
    premium: 150,
  };

  const charge = Math.ceil(lateHours) * hourlyRates[vehicleClass];

  return {
    lateHours,
    charge,
    isFullDay: false,
  };
}

/**
 * Damage Charges
 * Minor scratches < AED 500: 100% customer liability
 * Moderate damage AED 500-1500: Insurance excess applies
 * Major damage > AED 1500: Insurance claim, customer pays excess
 * Pre-existing damages: Not chargeable, must be documented
 */
export interface DamageCharge {
  damageId: string;
  damageType: string;
  severity: 'minor' | 'moderate' | 'major';
  repairCost: number;
  customerLiability: number;
  insuranceCovers: number;
  requiresInsuranceClaim: boolean;
  isPreExisting: boolean;
  chargeable: boolean;
}

export function calculateDamageCharge(
  marker: DamageMarker,
  isPreExisting: boolean,
  insuranceExcess: number = 1500
): DamageCharge {
  // Damage cost matrix by type and severity
  const costMatrix: Record<string, Record<string, number>> = {
    SCRATCH: { minor: 250, moderate: 600, major: 1200 },
    DENT: { minor: 450, moderate: 850, major: 2500 },
    CRACK: { minor: 600, moderate: 1000, major: 2000 },
    PAINT: { minor: 350, moderate: 700, major: 1500 },
    GLASS: { minor: 500, moderate: 1200, major: 2500 },
    TIRE: { minor: 400, moderate: 800, major: 1600 },
    BROKEN: { minor: 400, moderate: 800, major: 1800 },
    MISSING: { minor: 500, moderate: 1000, major: 2000 },
    BENT: { minor: 450, moderate: 900, major: 2200 },
    CAVED: { minor: 600, moderate: 1200, major: 3000 },
    LOOSE: { minor: 200, moderate: 500, major: 1000 },
    CRACKED: { minor: 500, moderate: 1000, major: 2000 },
    FADED: { minor: 300, moderate: 600, major: 1200 },
    SCRAPPED: { minor: 400, moderate: 800, major: 1500 },
    PILLED: { minor: 250, moderate: 500, major: 1000 },
    CRUSHED: { minor: 800, moderate: 1500, major: 3500 },
    OTHER: { minor: 300, moderate: 600, major: 1200 },
  };

  const repairCost = costMatrix[marker.type]?.[marker.severity] || 500;

  // Pre-existing damages are not chargeable
  if (isPreExisting) {
    return {
      damageId: marker.id,
      damageType: marker.type,
      severity: marker.severity,
      repairCost,
      customerLiability: 0,
      insuranceCovers: 0,
      requiresInsuranceClaim: false,
      isPreExisting: true,
      chargeable: false,
    };
  }

  // Minor damage (< AED 500): 100% customer liability
  if (repairCost < 500) {
    return {
      damageId: marker.id,
      damageType: marker.type,
      severity: marker.severity,
      repairCost,
      customerLiability: repairCost,
      insuranceCovers: 0,
      requiresInsuranceClaim: false,
      isPreExisting: false,
      chargeable: true,
    };
  }

  // Moderate damage (AED 500-1500): Insurance excess applies
  if (repairCost >= 500 && repairCost <= 1500) {
    return {
      damageId: marker.id,
      damageType: marker.type,
      severity: marker.severity,
      repairCost,
      customerLiability: Math.min(repairCost, insuranceExcess),
      insuranceCovers: Math.max(0, repairCost - insuranceExcess),
      requiresInsuranceClaim: true,
      isPreExisting: false,
      chargeable: true,
    };
  }

  // Major damage (> AED 1500): Insurance claim, customer pays excess
  return {
    damageId: marker.id,
    damageType: marker.type,
    severity: marker.severity,
    repairCost,
    customerLiability: insuranceExcess,
    insuranceCovers: repairCost - insuranceExcess,
    requiresInsuranceClaim: true,
    isPreExisting: false,
    chargeable: true,
  };
}

/**
 * Calculate all damages for comparison
 */
export function calculateAllDamages(
  checkoutMarkers: DamageMarker[],
  checkinMarkers: DamageMarker[],
  insuranceExcess: number = 1500
): DamageCharge[] {
  const checkoutIds = new Set(checkoutMarkers.map(m => m.id));
  
  return checkinMarkers.map(marker => {
    const isPreExisting = checkoutIds.has(marker.id);
    return calculateDamageCharge(marker, isPreExisting, insuranceExcess);
  });
}

/**
 * Calculate VAT
 */
export function calculateVAT(amount: number): number {
  return amount * VAT_RATE;
}

/**
 * Calculate total charges with VAT
 */
export interface TotalCharges {
  damageCharges: number;
  fuelCharge: number;
  excessKmCharge: number;
  cleaningFee: number;
  lateReturnCharge: number;
  salikCharge: number;
  subtotal: number;
  vat: number;
  total: number;
}

export function calculateTotalCharges(charges: {
  damageCharges: number;
  fuelCharge: number;
  excessKmCharge: number;
  cleaningFee: number;
  lateReturnCharge: number;
  salikCharge: number;
}): TotalCharges {
  const subtotal =
    charges.damageCharges +
    charges.fuelCharge +
    charges.excessKmCharge +
    charges.cleaningFee +
    charges.lateReturnCharge +
    charges.salikCharge;

  const vat = calculateVAT(subtotal);
  const total = subtotal + vat;

  return {
    ...charges,
    subtotal,
    vat,
    total,
  };
}

/**
 * Calculate security deposit refund
 */
export function calculateDepositRefund(
  securityDeposit: number,
  totalCharges: number
): { refund: number; additionalPayment: number } {
  const balance = securityDeposit - totalCharges;

  if (balance >= 0) {
    return {
      refund: balance,
      additionalPayment: 0,
    };
  } else {
    return {
      refund: 0,
      additionalPayment: Math.abs(balance),
    };
  }
}
