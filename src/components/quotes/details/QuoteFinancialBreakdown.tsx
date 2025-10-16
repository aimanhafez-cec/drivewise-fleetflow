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
  
  // Calculate upfront due
  const depositAmount = quote.default_deposit_amount || 0;
  const advanceRentMonths = quote.default_advance_rent_months || 0;
  const initialFees = quote.initial_fees || [];
  const initialFeesTotal = initialFees.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0);
  
  // Calculate monthly rental (from quote_items)
  const quoteItems = quote.quote_items || [];
  const monthlyRental = quoteItems.reduce((sum: number, item: any) => sum + (item.monthly_rate || 0), 0);
  const advanceRentAmount = monthlyRental * advanceRentMonths;
  
  const upfrontDue = depositAmount + advanceRentAmount + initialFeesTotal;

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
            <span className="font-medium">{formatCurrency(quote.subtotal || 0, currency)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              VAT ({quote.vat_percentage || 5}%)
            </span>
            <span className="font-medium">{formatCurrency(quote.tax_amount || 0, currency)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-lg">{formatCurrency(quote.total_amount || 0, currency)}</span>
          </div>
        </div>

        <Separator />

        {/* Upfront Due Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Upfront Due Breakdown</h4>
          
          <div className="space-y-3">
            {depositAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Security Deposit ({quote.deposit_type || "Refundable"})
                </span>
                <span className="font-medium">{formatCurrency(depositAmount, currency)}</span>
              </div>
            )}
            
            {advanceRentAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Advance Rent ({advanceRentMonths} month{advanceRentMonths > 1 ? "s" : ""})
                </span>
                <span className="font-medium">{formatCurrency(advanceRentAmount, currency)}</span>
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
