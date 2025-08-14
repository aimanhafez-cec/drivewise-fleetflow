import { useMemo } from 'react';

export type PricingContext = {
  priceListId: string;
  promoCode?: string | null;
  // User-entered rate buckets from Rate & Taxes panel:
  hourly?: number | null;
  daily?: number | null;
  weekly?: number | null;
  monthly?: number | null;
  kilometerCharge?: number | null;
  dailyKmAllowed?: number | null;
  // Policy flags:
  lockRatesOnPromo: boolean;     // if true, line rates are read-only once promo validated
  preferPanelRates: boolean;     // if true, use Rate & Taxes inputs over default price list
};

interface PricingInputs {
  priceListId: string;
  promotionCode: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  kilometerCharge: number;
  dailyKilometerAllowed: number;
}

export const usePricingContext = (inputs: PricingInputs): PricingContext => {
  return useMemo(() => {
    const hasValidPromo = inputs.promotionCode && inputs.promotionCode.trim() !== '';
    
    return {
      priceListId: inputs.priceListId,
      promoCode: inputs.promotionCode || null,
      hourly: inputs.hourlyRate > 0 ? inputs.hourlyRate : null,
      daily: inputs.dailyRate > 0 ? inputs.dailyRate : null,
      weekly: inputs.weeklyRate > 0 ? inputs.weeklyRate : null,
      monthly: inputs.monthlyRate > 0 ? inputs.monthlyRate : null,
      kilometerCharge: inputs.kilometerCharge > 0 ? inputs.kilometerCharge : null,
      dailyKmAllowed: inputs.dailyKilometerAllowed > 0 ? inputs.dailyKilometerAllowed : null,
      lockRatesOnPromo: hasValidPromo,
      preferPanelRates: true,
    };
  }, [
    inputs.priceListId,
    inputs.promotionCode,
    inputs.hourlyRate,
    inputs.dailyRate,
    inputs.weeklyRate,
    inputs.monthlyRate,
    inputs.kilometerCharge,
    inputs.dailyKilometerAllowed,
  ]);
};

export const calculateLinePrice = (
  pricingContext: PricingContext,
  checkOutDate: Date,
  checkInDate: Date,
  fallbackRates?: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  }
): { lineNetPrice: number; source: 'panel' | 'pricelist' } => {
  const totalHours = Math.ceil((checkInDate.getTime() - checkOutDate.getTime()) / (1000 * 60 * 60));
  const totalDays = Math.ceil(totalHours / 24);
  
  // Determine best rate bucket (Monthly > Weekly > Daily > Hourly)
  let rate = 0;
  let source: 'panel' | 'pricelist' = 'panel';
  
  if (totalDays >= 30 && (pricingContext.monthly || fallbackRates?.monthly)) {
    const months = Math.ceil(totalDays / 30);
    rate = (pricingContext.monthly || fallbackRates?.monthly || 0) * months;
    source = pricingContext.monthly ? 'panel' : 'pricelist';
  } else if (totalDays >= 7 && (pricingContext.weekly || fallbackRates?.weekly)) {
    const weeks = Math.ceil(totalDays / 7);
    rate = (pricingContext.weekly || fallbackRates?.weekly || 0) * weeks;
    source = pricingContext.weekly ? 'panel' : 'pricelist';
  } else if (totalDays >= 1 && (pricingContext.daily || fallbackRates?.daily)) {
    rate = (pricingContext.daily || fallbackRates?.daily || 0) * totalDays;
    source = pricingContext.daily ? 'panel' : 'pricelist';
  } else if (pricingContext.hourly || fallbackRates?.hourly) {
    rate = (pricingContext.hourly || fallbackRates?.hourly || 0) * totalHours;
    source = pricingContext.hourly ? 'panel' : 'pricelist';
  }
  
  return { lineNetPrice: rate, source };
};