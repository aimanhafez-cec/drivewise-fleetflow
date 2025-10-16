import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";

interface QuotePaymentPolicyProps {
  quote: any;
  paymentTerms?: any;
  priceList?: any;
}

export const QuotePaymentPolicy: React.FC<QuotePaymentPolicyProps> = ({
  quote,
  paymentTerms,
  priceList,
}) => {
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      "bank-transfer": "Bank Transfer",
      "credit-card": "Credit Card",
      cheque: "Cheque",
      "direct-debit": "Direct Debit",
    };
    return labels[method] || method;
  };

  const getBillingPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      "semi-annual": "Semi-Annual",
      annual: "Annual",
    };
    return labels[plan] || plan;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Terms & Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment Terms</p>
              <p className="font-medium">{paymentTerms?.name || quote.payment_terms_id || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">
                {getPaymentMethodLabel(quote.payment_method || "bank-transfer")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Billing Plan</p>
              <p className="font-medium">{getBillingPlanLabel(quote.billing_plan || "monthly")}</p>
            </div>
            {quote.billing_start_date && (
              <div>
                <p className="text-sm text-muted-foreground">Billing Start Date</p>
                <p className="font-medium">
                  {format(new Date(quote.billing_start_date), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {quote.grace_period_days && (
              <div>
                <p className="text-sm text-muted-foreground">Grace Period</p>
                <p className="font-medium">{quote.grace_period_days} days</p>
              </div>
            )}
            {quote.late_fee_percentage && (
              <div>
                <p className="text-sm text-muted-foreground">Late Fee</p>
                <p className="font-medium">{quote.late_fee_percentage}% per month</p>
              </div>
            )}
            {quote.withholding_tax_percentage && (
              <div>
                <p className="text-sm text-muted-foreground">Withholding Tax</p>
                <p className="font-medium">{quote.withholding_tax_percentage}%</p>
              </div>
            )}
            {priceList && (
              <div>
                <p className="text-sm text-muted-foreground">Price List</p>
                <p className="font-medium">{priceList.name}</p>
              </div>
            )}
          </div>
        </div>

        {quote.customer_po_number && (
          <div>
            <p className="text-sm text-muted-foreground">Customer PO Number</p>
            <p className="font-medium">{quote.customer_po_number}</p>
          </div>
        )}

        {quote.payment_instructions && (
          <div>
            <p className="text-sm text-muted-foreground">Payment Instructions</p>
            <p className="text-sm whitespace-pre-wrap">{quote.payment_instructions}</p>
          </div>
        )}

        {(quote.grace_period_days || quote.late_fee_percentage) && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100">Late Payment Policy</p>
              <p className="text-amber-700 dark:text-amber-300">
                Invoices are due within {quote.grace_period_days || 0} days. Late payments will
                incur a {quote.late_fee_percentage || 0}% monthly fee.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
