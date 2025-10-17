import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface MasterAgreementFinancialsProps {
  agreement: any;
  lines?: any[];
}

export const MasterAgreementFinancials: React.FC<MasterAgreementFinancialsProps> = ({
  agreement,
  lines = [],
}) => {
  const currency = agreement.currency || "AED";
  
  // Calculate totals from lines
  const totalMonthlyRevenue = lines.reduce((sum, line) => 
    sum + ((line.monthly_rate_aed || 0) * (line.qty || 1)), 0);
  
  const totalDeposit = lines.reduce((sum, line) => 
    sum + (line.setup_fee_aed || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Monthly Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue, currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Setup Fees</p>
            <p className="text-2xl font-bold">{formatCurrency(totalDeposit, currency)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Active Lines</p>
            <p className="font-medium">{lines.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Security Instrument</p>
            <p className="font-medium">{agreement.security_instrument || "None"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Credit Limit</p>
            <p className="font-medium">
              {agreement.credit_limit ? formatCurrency(agreement.credit_limit, currency) : "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
