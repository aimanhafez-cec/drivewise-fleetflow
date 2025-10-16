import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface QuoteTollsPolicyProps {
  quote: any;
}

export const QuoteTollsPolicy: React.FC<QuoteTollsPolicyProps> = ({ quote }) => {
  const getSalikHandlingLabel = (handling: string) => {
    const labels: Record<string, string> = {
      "rebill-actual": "Rebill Actual Costs",
      "included-capped": "Included (Capped)",
      "customer-responsible": "Customer Responsible",
      "lump-sum": "Lump Sum Monthly",
    };
    return labels[handling] || handling;
  };

  const getFinesHandlingLabel = (handling: string) => {
    const labels: Record<string, string> = {
      "auto-rebill-admin": "Auto Rebill + Admin Fee",
      "customer-direct": "Customer Pays Directly",
      "monthly-invoice": "Monthly Invoice",
    };
    return labels[handling] || handling;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Tolls & Traffic Fines Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Salik/Darb Handling</p>
              <p className="font-medium">
                {getSalikHandlingLabel(quote.salik_darb_handling || "rebill-actual")}
              </p>
            </div>
            {quote.salik_darb_allowance_cap && (
              <div>
                <p className="text-sm text-muted-foreground">Monthly Allowance Cap</p>
                <p className="font-medium">
                  {formatCurrency(quote.salik_darb_allowance_cap, quote.currency || "AED")}
                </p>
              </div>
            )}
            {quote.tolls_admin_fee_model && (
              <div>
                <p className="text-sm text-muted-foreground">Admin Fee Model</p>
                <p className="font-medium">{quote.tolls_admin_fee_model}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Traffic Fines Handling</p>
              <p className="font-medium">
                {getFinesHandlingLabel(quote.traffic_fines_handling || "auto-rebill-admin")}
              </p>
            </div>
            {quote.admin_fee_per_fine_aed && (
              <div>
                <p className="text-sm text-muted-foreground">Admin Fee per Fine</p>
                <p className="font-medium">
                  {formatCurrency(quote.admin_fee_per_fine_aed, quote.currency || "AED")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> All toll and traffic fine charges will be processed according to
            the terms above and included in monthly invoices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
