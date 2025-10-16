import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { Calculator } from "lucide-react";

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
  const subtotal = quote.subtotal || 0;
  const taxAmount = quote.tax_amount || 0;
  const totalAmount = quote.total_amount || 0;
  const vatPercentage = quote.vat_percentage || 5;
  const currency = quote.currency || 'AED';

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
