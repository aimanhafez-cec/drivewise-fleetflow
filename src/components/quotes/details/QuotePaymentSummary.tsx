import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { Calculator } from "lucide-react";
import { 
  getBillingDayLabel, 
  getLineItemGranularityLabel, 
  getBillingStartTriggerLabel 
} from "@/lib/constants/billingOptions";

interface QuotePaymentSummaryProps {
  quote: any;
}

const getProrationLabel = (rule?: string) => {
  const labels: Record<string, string> = {
    'none': 'No Proration',
    'first-only': 'First Period Only',
    'last-only': 'Last Period Only',
    'first-last': 'First & Last Period',
    'all-periods': 'All Periods',
  };
  return labels[rule || 'none'] || rule || 'Not specified';
};

const getInvoiceFormatLabel = (format?: string) => {
  const labels: Record<string, string> = {
    'consolidated': 'Consolidated Invoice',
    'per_line': 'Separate Invoice Per Line',
  };
  return labels[format || ''] || format || 'Not specified';
};

export const QuotePaymentSummary: React.FC<QuotePaymentSummaryProps> = ({ quote }) => {
  const vatPercentage = quote.vat_percentage || 5;
  // Sanitize currency code - take only first word if multiple words exist
  const currency = (quote.currency || 'AED').trim().split(' ')[0];
  
  // Helper to normalize type strings
  const normalizeType = (t?: string) => (t || '').trim().toLowerCase();
  const isCorporate = normalizeType(quote.quote_type) === 'corporate lease';
  
  // Compute totals on the fly if stored values are 0
  const computeTotals = () => {
    let subtotal = quote.subtotal || 0;
    let taxAmount = quote.tax_amount || 0;
    let totalAmount = quote.total_amount || 0;
    
    // If all stored totals are 0, calculate from items
    if (subtotal === 0 && taxAmount === 0 && totalAmount === 0) {
      if (isCorporate && quote.quote_items && quote.quote_items.length > 0) {
        // Corporate quote calculation
        const headerMonths = quote.duration_days ? Math.round(quote.duration_days / 30) : 0;
        const getAddonType = (a: any) => a.pricing_model || a.type;
        const getAddonTotal = (a: any) => (a.total ?? a.amount ?? 0);
        
        const totalDeposits = quote.quote_items.reduce((sum: number, line: any) => 
          sum + (line.deposit_amount || 0), 0);
        const totalAdvance = quote.quote_items.reduce((sum: number, line: any) => 
          sum + ((line.advance_rent_months || 0) * (line.monthly_rate || 0)), 0);
        const totalDeliveryFees = quote.quote_items.reduce((sum: number, line: any) => 
          sum + (line.delivery_fee || 0), 0);
        const totalCollectionFees = quote.quote_items.reduce((sum: number, line: any) => 
          sum + (line.collection_fee || 0), 0);
        const oneTimeAddOns = quote.quote_items.reduce((sum: number, line: any) => {
          const lineOneTimeAddOns = (line.addons || [])
            .filter((a: any) => getAddonType(a) === 'one-time')
            .reduce((s: number, a: any) => s + getAddonTotal(a), 0);
          return sum + lineOneTimeAddOns;
        }, 0);
        const initialFees = (quote.initial_fees || []).reduce((sum: number, fee: any) => 
          sum + (parseFloat(fee.amount) || 0), 0);
        
        const taxableSubtotal = totalAdvance + totalDeliveryFees + totalCollectionFees + initialFees + oneTimeAddOns;
        subtotal = totalDeposits + taxableSubtotal;
        taxAmount = taxableSubtotal * (vatPercentage / 100);
        totalAmount = subtotal + taxAmount;
        
      } else if (quote.items && quote.items.length > 0) {
        // Legacy quote calculation
        subtotal = quote.items.reduce((sum: number, item: any) => 
          sum + (item.qty * item.rate), 0);
        const taxRate = quote.tax_rate || (vatPercentage / 100);
        taxAmount = subtotal * taxRate;
        totalAmount = subtotal + taxAmount;
      }
    }
    
    return { subtotal, taxAmount, totalAmount };
  };
  
  const { subtotal, taxAmount, totalAmount } = computeTotals();

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Payment Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Financial Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">VAT ({vatPercentage}%)</span>
              <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalAmount, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Configuration */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Proration Rule</span>
              <Badge variant="outline">{getProrationLabel(quote.proration_rule)}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invoice Format</span>
              <Badge variant="outline">{getInvoiceFormatLabel(quote.invoice_format)}</Badge>
            </div>

            {quote.billing_plan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billing Plan</span>
                <Badge variant="secondary" className="capitalize">
                  {quote.billing_plan}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Billing Day Reference</span>
              <Badge variant="outline">{getBillingDayLabel(quote.billing_day)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Line-Item Granularity</span>
              <Badge variant="outline">{getLineItemGranularityLabel(quote.line_item_granularity)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Billing Start Trigger</span>
              <Badge variant="outline">{getBillingStartTriggerLabel(quote.billing_start_trigger)}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
