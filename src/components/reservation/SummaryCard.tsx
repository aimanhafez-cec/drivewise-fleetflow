import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Summary } from '@/hooks/useReservationSummary';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  summary: Summary;
  currencyCode: string;
  className?: string;
}

interface SummaryRowProps {
  label: string;
  amount: number;
  currencyCode: string;
  id: string;
  isTotal?: boolean;
  showAnimation?: boolean;
}

const formatCurrency = (amount: number, currencyCode: string): string => {
  // Simple currency formatting for EGP
  const symbols: Record<string, string> = {
    'EGP': 'ج.م ',
    'USD': '$',
    'EUR': '€',
  };
  
  const symbol = symbols[currencyCode] || currencyCode + ' ';
  const formatted = Math.abs(amount).toFixed(2);
  
  // Format for Egyptian Pound
  if (currencyCode === 'EGP') {
    return `${formatted} ج.م`;
  }
  
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

const SummaryRow: React.FC<SummaryRowProps> = ({ 
  label, 
  amount, 
  currencyCode, 
  id, 
  isTotal = false,
  showAnimation = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [amount, showAnimation]);

  return (
    <div className="flex justify-between items-center py-1">
      <span className={cn("text-sm", isTotal && "font-semibold")}>
        {label}
      </span>
      <span 
        id={id}
        className={cn(
          "text-sm font-mono tabular-nums transition-all duration-300",
          isTotal && "font-bold",
          isAnimating && "animate-pulse bg-primary/10 rounded px-1"
        )}
      >
        {formatCurrency(amount, currencyCode)}
      </span>
    </div>
  );
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  summary, 
  currencyCode,
  className 
}) => {
  const [previousSummary, setPreviousSummary] = useState(summary);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Track which fields changed for animation
  useEffect(() => {
    const changed = new Set<string>();
    Object.keys(summary).forEach(key => {
      const currentValue = summary[key as keyof Summary];
      const previousValue = previousSummary[key as keyof Summary];
      if (currentValue !== previousValue) {
        changed.add(key);
      }
    });
    
    setChangedFields(changed);
    setPreviousSummary(summary);
    
    // Clear animations after a short delay
    if (changed.size > 0) {
      const timer = setTimeout(() => setChangedFields(new Set()), 400);
      return () => clearTimeout(timer);
    }
  }, [summary, previousSummary]);

  const isOverpaid = summary.advancePaid + summary.securityDepositPaid > summary.grandTotal;

  return (
    <Card id="summary-card" className={cn("shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Summary of Charge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <SummaryRow
          label="Base Rate"
          amount={summary.baseRate}
          currencyCode={currencyCode}
          id="sum-base-rate"
          showAnimation={changedFields.has('baseRate')}
        />
        
        <SummaryRow
          label="Promotion"
          amount={summary.promotion}
          currencyCode={currencyCode}
          id="sum-promotion"
          showAnimation={changedFields.has('promotion')}
        />
        
        <SummaryRow
          label="Final Base Rate"
          amount={summary.finalBaseRate}
          currencyCode={currencyCode}
          id="sum-final-base-rate"
          showAnimation={changedFields.has('finalBaseRate')}
        />
        
        <Separator className="my-2" />
        
        <SummaryRow
          label="Total Miscellaneous charges"
          amount={summary.miscTaxable}
          currencyCode={currencyCode}
          id="sum-misc-taxable"
          showAnimation={changedFields.has('miscTaxable')}
        />
        
        <SummaryRow
          label="Total Miscellaneous charges (No Tax)"
          amount={summary.miscNonTaxable}
          currencyCode={currencyCode}
          id="sum-misc-nontaxable"
          showAnimation={changedFields.has('miscNonTaxable')}
        />
        
        <Separator className="my-2" />
        
        <SummaryRow
          label="Pre-Adjustment"
          amount={summary.preAdjustment}
          currencyCode={currencyCode}
          id="sum-pre-adjustment"
          showAnimation={changedFields.has('preAdjustment')}
        />
        
        <SummaryRow
          label="Pre-Subtotal"
          amount={summary.preSubtotal}
          currencyCode={currencyCode}
          id="sum-pre-subtotal"
          showAnimation={changedFields.has('preSubtotal')}
        />
        
        <SummaryRow
          label="Discount On Subtotal"
          amount={summary.discountOnSubtotal}
          currencyCode={currencyCode}
          id="sum-discount-subtotal"
          showAnimation={changedFields.has('discountOnSubtotal')}
        />
        
        <SummaryRow
          label="Subtotal"
          amount={summary.subtotal}
          currencyCode={currencyCode}
          id="sum-subtotal"
          showAnimation={changedFields.has('subtotal')}
        />
        
        <Separator className="my-2" />
        
        <SummaryRow
          label="Total Tax Charges"
          amount={summary.taxTotal}
          currencyCode={currencyCode}
          id="sum-tax-total"
          showAnimation={changedFields.has('taxTotal')}
        />
        
        <SummaryRow
          label="Estimated Total"
          amount={summary.estimatedTotal}
          currencyCode={currencyCode}
          id="sum-estimated-total"
          showAnimation={changedFields.has('estimatedTotal')}
        />
        
        <SummaryRow
          label="Grand Total"
          amount={summary.grandTotal}
          currencyCode={currencyCode}
          id="sum-grand-total"
          isTotal
          showAnimation={changedFields.has('grandTotal')}
        />
        
        <Separator className="my-2" />
        
        <SummaryRow
          label="Advance Paid"
          amount={summary.advancePaid}
          currencyCode={currencyCode}
          id="sum-advance-paid"
          showAnimation={changedFields.has('advancePaid')}
        />
        
        <SummaryRow
          label="Balance Due"
          amount={summary.balanceDue}
          currencyCode={currencyCode}
          id="sum-balance-due"
          isTotal
          showAnimation={changedFields.has('balanceDue')}
        />
        
        <Separator className="my-2" />
        
        <SummaryRow
          label="Cancellation Fee"
          amount={summary.cancellationFee}
          currencyCode={currencyCode}
          id="sum-cancel-fee"
          showAnimation={changedFields.has('cancellationFee')}
        />
        
        <SummaryRow
          label="Security Deposit Paid"
          amount={summary.securityDepositPaid}
          currencyCode={currencyCode}
          id="sum-security-deposit"
          showAnimation={changedFields.has('securityDepositPaid')}
        />
        
        {isOverpaid && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
            <span>Overpaid</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};