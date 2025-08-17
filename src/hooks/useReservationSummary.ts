import { useMemo } from 'react';

export type Summary = {
  baseRate: number;
  promotion: number;
  finalBaseRate: number;
  miscTaxable: number;
  miscNonTaxable: number;
  preAdjustment: number;
  preSubtotal: number;
  discountOnSubtotal: number;
  subtotal: number;
  taxTotal: number;
  estimatedTotal: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
  cancellationFee: number;
  securityDepositPaid: number;
  // Payment terms integration
  paymentDueDate?: Date;
  minimumPaymentDue?: number;
  paymentSchedule?: Array<{
    dueDate: Date;
    amount: number;
    description: string;
  }>;
};

interface ReservationLine {
  lineNetPrice: number;
  taxValue: number;
  discountValue: number;
}

interface MiscCharge {
  id: string;
  amount: number;
  taxable: boolean;
}

interface FormData {
  reservationLines: ReservationLine[];
  selectedMiscCharges: string[];
  promotionCode: string;
  discountValue: string | number | null;
  preAdjustment: number;
  advancePayment: number;
  securityDepositPaid: number;
  cancellationCharges: number;
  paymentTermsId?: string; // Added payment terms integration
}

// Mock misc charges data - in real app this would come from API
const MISC_CHARGES: MiscCharge[] = [
  { id: 'insurance', amount: 750.00, taxable: true },    // ~25 USD -> 750 AED
  { id: 'gps', amount: 450.00, taxable: true },          // ~15 USD -> 450 AED
  { id: 'cleaning', amount: 900.00, taxable: false },    // ~30 USD -> 900 AED
  { id: 'fuel', amount: 1500.00, taxable: true },        // ~50 USD -> 1500 AED
  { id: 'delivery', amount: 600.00, taxable: false },    // ~20 USD -> 600 AED
];

export const useReservationSummary = (formData: FormData): Summary => {
  return useMemo(() => {
    // Ensure arrays exist and have default values
    const lines = formData.reservationLines || [];
    const selectedChargeIds = formData.selectedMiscCharges || [];
    
    // Calculate base values from lines
    const linesNet = lines.reduce((sum, line) => sum + (line.lineNetPrice || 0), 0);
    const taxOnLines = lines.reduce((sum, line) => sum + (line.taxValue || 0), 0);
    
    // Calculate miscellaneous charges
    const selectedCharges = MISC_CHARGES.filter(charge => selectedChargeIds.includes(charge.id));
    const miscTaxable = selectedCharges
      .filter(charge => charge.taxable)
      .reduce((sum, charge) => sum + charge.amount, 0);
    const miscNonTaxable = selectedCharges
      .filter(charge => !charge.taxable)
      .reduce((sum, charge) => sum + charge.amount, 0);
    
    // Calculate tax on misc taxable charges (standard 10% tax rate if no line tax rate available)
    const avgTaxRate = linesNet > 0 ? taxOnLines / linesNet : 0.1; // Default to 10% if no lines
    const taxOnMiscTaxable = miscTaxable * avgTaxRate;
    
    // Get values from form with defaults
    const discountVal = typeof formData.discountValue === 'string' ? parseFloat(formData.discountValue) || 0 : formData.discountValue || 0;
    const promo = formData.promotionCode ? -discountVal : 0; // negative for discount
    const preAdj = formData.preAdjustment || 0;
    const discSub = 0; // document-level discount not implemented yet
    const advPaid = formData.advancePayment || 0;
    const secDepPaid = formData.securityDepositPaid || 0;
    const cancelFee = formData.cancellationCharges || 0;
    
    // Apply formulas as specified
    const baseRate = linesNet;
    const promotion = promo;
    const finalBaseRate = baseRate + promotion;
    
    const preSubtotal = finalBaseRate + miscTaxable + miscNonTaxable + preAdj;
    const discountOnSubtotal = discSub;
    const subtotal = preSubtotal + discountOnSubtotal;
    const taxTotal = taxOnLines + taxOnMiscTaxable;
    const estimatedTotal = subtotal + taxTotal;
    const grandTotal = estimatedTotal + cancelFee;
    const balanceDue = Math.max(grandTotal - advPaid - secDepPaid, 0);
    
    // Calculate payment terms integration AFTER grandTotal is calculated
    const paymentTermsId = formData.paymentTermsId;
    let paymentDueDate: Date | undefined;
    let minimumPaymentDue = 0;
    
    if (paymentTermsId) {
      const today = new Date();
      switch (paymentTermsId) {
        case 'prepaid':
          paymentDueDate = today;
          minimumPaymentDue = grandTotal; // Full payment required upfront
          break;
        case 'cod':
          paymentDueDate = today;
          minimumPaymentDue = grandTotal; // Full payment on delivery
          break;
        case 'net15':
          paymentDueDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
          minimumPaymentDue = Math.max(grandTotal * 0.2, 0); // 20% minimum advance
          break;
        case 'net30':
          paymentDueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          minimumPaymentDue = Math.max(grandTotal * 0.2, 0); // 20% minimum advance
          break;
        default:
          paymentDueDate = today;
          minimumPaymentDue = grandTotal;
      }
    }
    
    return {
      baseRate: Number(baseRate.toFixed(4)),
      promotion: Number(promotion.toFixed(4)),
      finalBaseRate: Number(finalBaseRate.toFixed(4)),
      miscTaxable: Number(miscTaxable.toFixed(4)),
      miscNonTaxable: Number(miscNonTaxable.toFixed(4)),
      preAdjustment: Number(preAdj.toFixed(4)),
      preSubtotal: Number(preSubtotal.toFixed(4)),
      discountOnSubtotal: Number(discountOnSubtotal.toFixed(4)),
      subtotal: Number(subtotal.toFixed(4)),
      taxTotal: Number(taxTotal.toFixed(4)),
      estimatedTotal: Number(estimatedTotal.toFixed(4)),
      grandTotal: Number(grandTotal.toFixed(4)),
      advancePaid: Number(advPaid.toFixed(4)),
      balanceDue: Number(balanceDue.toFixed(4)),
      cancellationFee: Number(cancelFee.toFixed(4)),
      securityDepositPaid: Number(secDepPaid.toFixed(4)),
      // Payment terms data
      paymentDueDate,
      minimumPaymentDue: minimumPaymentDue ? Number(minimumPaymentDue.toFixed(4)) : undefined,
    };
  }, [
    formData.reservationLines,
    formData.selectedMiscCharges,
    formData.promotionCode,
    formData.discountValue,
    formData.preAdjustment,
    formData.advancePayment,
    formData.securityDepositPaid,
    formData.cancellationCharges,
    formData.paymentTermsId, // Added payment terms dependency
  ]);
};