import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Car, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface MasterAgreementStep6Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const MasterAgreementStep6: React.FC<MasterAgreementStep6Props> = ({ data }) => {
  const calculateTotals = () => {
    const lines = data.agreement_items || [];
    const getAddonType = (a: any) => a.pricing_model || a.type;
    const getAddonTotal = (a: any) => (a.total ?? a.amount ?? 0);
    
    const totalDeposits = lines.reduce((sum: number, line: any) => sum + (line.deposit_amount || 0), 0);
    const monthlyRecurringRental = lines.reduce((sum: number, line: any) => {
      const baseRate = line.monthly_rate || 0;
      const monthlyAddOnsCost = (line.addons || []).filter((a: any) => getAddonType(a) === 'monthly').reduce((s: number, a: any) => s + getAddonTotal(a), 0);
      return sum + baseRate + monthlyAddOnsCost;
    }, 0);
    
    return { deposits: totalDeposits, monthlyRecurringRental, vehicles: lines.length };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Recurring</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.monthlyRecurringRental, data.currency || 'AED')}</p>
              <p className="text-xs text-muted-foreground">/month</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Vehicle Lines</p>
              <p className="text-3xl font-bold">{totals.vehicles}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Contract Term</p>
              <p className="text-3xl font-bold">
                {data.duration_days ? Math.floor(data.duration_days / 30) : 'N/A'}
                <span className="text-lg font-normal ml-1">months</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
              <p className="text-3xl font-bold">{formatCurrency(totals.deposits, data.currency || 'AED')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agreement Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Customer</span>
              <p className="font-medium">{data.account_name || "Not selected"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contract Period</span>
              <p className="font-medium">{data.contract_effective_from || 'TBD'} to {data.contract_effective_to || 'TBD'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Terms</span>
              <p className="font-medium">{data.payment_terms_id || "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Billing Plan</span>
              <p className="font-medium capitalize">{data.billing_plan || "Monthly"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};