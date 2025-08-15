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
      // Allow rates including 0 values - only exclude null/undefined
      hourly: inputs.hourlyRate !== null && inputs.hourlyRate !== undefined ? inputs.hourlyRate : null,
      daily: inputs.dailyRate !== null && inputs.dailyRate !== undefined ? inputs.dailyRate : null,
      weekly: inputs.weeklyRate !== null && inputs.weeklyRate !== undefined ? inputs.weeklyRate : null,
      monthly: inputs.monthlyRate !== null && inputs.monthlyRate !== undefined ? inputs.monthlyRate : null,
      kilometerCharge: inputs.kilometerCharge !== null && inputs.kilometerCharge !== undefined ? inputs.kilometerCharge : null,
      dailyKmAllowed: inputs.dailyKilometerAllowed !== null && inputs.dailyKilometerAllowed !== undefined ? inputs.dailyKilometerAllowed : null,
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
  
  console.log('🔍 Pricing calculation debug:', {
    totalHours,
    totalDays,
    pricingContext,
    fallbackRates,
    checkOutDate: checkOutDate.toISOString(),
    checkInDate: checkInDate.toISOString()
  });
  
  // Determine best rate bucket (Monthly > Weekly > Daily > Hourly)
  // ALWAYS prioritize panel rates over fallback rates
  let rate = 0;
  let source: 'panel' | 'pricelist' = 'panel';
  
  if (totalDays >= 30) {
    if (pricingContext.monthly !== null && pricingContext.monthly !== undefined) {
      const months = Math.ceil(totalDays / 30);
      rate = pricingContext.monthly * months;
      source = 'panel';
      console.log('📊 Using panel monthly rate:', { rate: pricingContext.monthly, months, total: rate });
    } else if (fallbackRates?.monthly) {
      const months = Math.ceil(totalDays / 30);
      rate = fallbackRates.monthly * months;
      source = 'pricelist';
      console.log('📊 Using fallback monthly rate:', { rate: fallbackRates.monthly, months, total: rate });
    }
  } else if (totalDays >= 7) {
    if (pricingContext.weekly !== null && pricingContext.weekly !== undefined) {
      const weeks = Math.ceil(totalDays / 7);
      rate = pricingContext.weekly * weeks;
      source = 'panel';
      console.log('📊 Using panel weekly rate:', { rate: pricingContext.weekly, weeks, total: rate });
    } else if (fallbackRates?.weekly) {
      const weeks = Math.ceil(totalDays / 7);
      rate = fallbackRates.weekly * weeks;
      source = 'pricelist';
      console.log('📊 Using fallback weekly rate:', { rate: fallbackRates.weekly, weeks, total: rate });
    }
  } else if (totalDays >= 1) {
    if (pricingContext.daily !== null && pricingContext.daily !== undefined) {
      rate = pricingContext.daily * totalDays;
      source = 'panel';
      console.log('📊 Using panel daily rate:', { rate: pricingContext.daily, days: totalDays, total: rate });
    } else if (fallbackRates?.daily) {
      rate = fallbackRates.daily * totalDays;
      source = 'pricelist';
      console.log('📊 Using fallback daily rate:', { rate: fallbackRates.daily, days: totalDays, total: rate });
    }
  } else {
    if (pricingContext.hourly !== null && pricingContext.hourly !== undefined) {
      rate = pricingContext.hourly * totalHours;
      source = 'panel';
      console.log('📊 Using panel hourly rate:', { rate: pricingContext.hourly, hours: totalHours, total: rate });
    } else if (fallbackRates?.hourly) {
      rate = fallbackRates.hourly * totalHours;
      source = 'pricelist';
      console.log('📊 Using fallback hourly rate:', { rate: fallbackRates.hourly, hours: totalHours, total: rate });
    }
  }
  
  console.log('💰 Final calculation result:', { lineNetPrice: rate, source });
  return { lineNetPrice: rate, source };
};