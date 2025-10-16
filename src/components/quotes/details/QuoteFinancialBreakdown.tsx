import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Separator } from "@/components/ui/separator";

interface QuoteFinancialBreakdownProps {
  quote: any;
}

export const QuoteFinancialBreakdown: React.FC<QuoteFinancialBreakdownProps> = ({ quote }) => {
  const currency = quote.currency || "AED";
  const vatPercentage = quote.vat_percentage || 5;
  const normalizeType = (t?: string) => (t || '').trim().toLowerCase();
  const isCorporate = normalizeType(quote.quote_type) === 'corporate lease';
  
  // Compute totals if stored values are zero
  const computeTotals = () => {
    let subtotal = quote.subtotal || 0;
    let taxAmount = quote.tax_amount || 0;
    let totalAmount = quote.total_amount || 0;
    
    if (subtotal === 0 && taxAmount === 0 && totalAmount === 0) {
      if (isCorporate && quote.quote_items && quote.quote_items.length > 0) {
        // Corporate path - compute from quote_items
        const getAddonType = (a: any) => a.pricing_model || a.type;
        const getAddonTotal = (a: any) => (a.total ?? a.amount ?? 0);
        
        const lines = quote.quote_items;
        const totalDeposits = lines.reduce((sum: number, line: any) => 
          sum + ((line.deposit_amount || 0) * (line.quantity || 1)), 0);
        const totalAdvance = lines.reduce((sum: number, line: any) => 
          sum + (((line.advance_rent_months || 0) * (line.monthly_rate || 0)) * (line.quantity || 1)), 0);
        const totalDeliveryFees = lines.reduce((sum: number, line: any) => 
          sum + (line.delivery_fee || 0), 0);
        const totalCollectionFees = lines.reduce((sum: number, line: any) => 
          sum + (line.collection_fee || 0), 0);
        
        const oneTimeAddOns = lines.reduce((sum: number, line: any) => {
          const addons = line.addons || [];
          return sum + addons
            .filter((a: any) => getAddonType(a) === 'one-time')
            .reduce((aSum: number, a: any) => aSum + getAddonTotal(a), 0);
        }, 0);
        
        const initialFees = (quote.initial_fees || []).reduce((sum: number, fee: any) => 
          sum + (parseFloat(fee.amount) || 0), 0);
        
        const taxableSubtotal = totalAdvance + totalDeliveryFees + totalCollectionFees + initialFees + oneTimeAddOns;
        subtotal = totalDeposits + taxableSubtotal;
        taxAmount = taxableSubtotal * (vatPercentage / 100);
        totalAmount = subtotal + taxAmount;
      } else if (quote.items && quote.items.length > 0) {
        // Legacy path - compute from items
        subtotal = quote.items.reduce((sum: number, item: any) => 
          sum + ((item.qty || 0) * (item.rate || 0)), 0);
        const taxRate = quote.tax_rate || (vatPercentage / 100);
        taxAmount = subtotal * taxRate;
        totalAmount = subtotal + taxAmount;
      }
    }
    
    return { subtotal, taxAmount, totalAmount };
  };
  
  const { subtotal, taxAmount, totalAmount } = computeTotals();
  
  // Calculate upfront due breakdown - aggregate from lines if corporate
  const lines = quote.quote_items || [];
  let totalDeposits = 0;
  let totalAdvance = 0;
  let depositLabel = "Security Deposit";
  let advanceLabel = "";
  
  if (lines.length > 0) {
    // Multi-vehicle corporate: aggregate per-line values
    totalDeposits = lines.reduce((sum: number, line: any) => 
      sum + ((line.deposit_amount || 0) * (line.quantity || 1)), 0);
    totalAdvance = lines.reduce((sum: number, line: any) => {
      const months = line.advance_rent_months || 0;
      const rate = line.monthly_rate || 0;
      const qty = line.quantity || 1;
      return sum + (months * rate * qty);
    }, 0);
    
    // Determine advance label (use first line's months if consistent, else generic)
    const firstMonths = lines[0]?.advance_rent_months || 0;
    const allSameMonths = lines.every((l: any) => (l.advance_rent_months || 0) === firstMonths);
    advanceLabel = allSameMonths && firstMonths > 0 
      ? `Advance Rent (${firstMonths} month${firstMonths > 1 ? "s" : ""})`
      : "Advance Rent";
    
    depositLabel = lines[0]?.deposit_type 
      ? `Security Deposit (${lines[0].deposit_type})`
      : "Security Deposit";
  } else {
    // Fallback: single header defaults
    totalDeposits = quote.default_deposit_amount || 0;
    const advanceRentMonths = quote.default_advance_rent_months || 0;
    const monthlyRental = lines.reduce((sum: number, item: any) => sum + (item.monthly_rate || 0), 0);
    totalAdvance = monthlyRental * advanceRentMonths;
    advanceLabel = `Advance Rent (${advanceRentMonths} month${advanceRentMonths > 1 ? "s" : ""})`;
    depositLabel = quote.deposit_type 
      ? `Security Deposit (${quote.deposit_type})`
      : "Security Deposit";
  }
  
  const initialFees = quote.initial_fees || [];
  const initialFeesTotal = initialFees.reduce((sum: number, fee: any) => 
    sum + (parseFloat(fee.amount) || 0), 0);
  const upfrontDue = totalDeposits + totalAdvance + initialFeesTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              VAT ({vatPercentage}%)
            </span>
            <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-lg">{formatCurrency(totalAmount, currency)}</span>
          </div>
        </div>

        <Separator />

        {/* Upfront Due Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Upfront Due Breakdown</h4>
          
          <div className="space-y-3">
            {totalDeposits > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {depositLabel}
                </span>
                <span className="font-medium">{formatCurrency(totalDeposits, currency)}</span>
              </div>
            )}
            
            {totalAdvance > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {advanceLabel}
                </span>
                <span className="font-medium">{formatCurrency(totalAdvance, currency)}</span>
              </div>
            )}
            
            {initialFees.length > 0 && (
              <>
                {initialFees.map((fee: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{fee.description}</span>
                    <span className="font-medium">{formatCurrency(fee.amount || 0, currency)}</span>
                  </div>
                ))}
              </>
            )}

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total Upfront Due</span>
              <span className="font-bold text-primary">{formatCurrency(upfrontDue, currency)}</span>
            </div>
          </div>
        </div>

        {quote.annual_escalation_percentage && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <strong>Note:</strong> Annual escalation of {quote.annual_escalation_percentage}%
              will apply to rental rates on anniversary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
