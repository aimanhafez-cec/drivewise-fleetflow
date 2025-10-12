import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, DollarSign, Car, Calendar } from "lucide-react";

interface QuoteWizardStep4Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep4: React.FC<QuoteWizardStep4Props> = ({
  data,
  onChange,
  errors,
}) => {
  const isCorporate = data.quote_type === 'Corporate lease';
  
  // Calculate totals
  const calculateTotals = () => {
    if (isCorporate && data.quote_items) {
      const totalDeposits = data.quote_items.reduce((sum: number, line: any) => 
        sum + (line.deposit_amount || 0), 0);
      const totalAdvance = data.quote_items.reduce((sum: number, line: any) => 
        sum + ((line.advance_rent_months || 0) * (line.monthly_rate || 0)), 0);
      const initialFees = (data.initial_fees || []).reduce((sum: number, fee: any) => 
        sum + (parseFloat(fee.amount) || 0), 0);
      const vat = (totalAdvance + initialFees) * ((data.vat_percentage || 0) / 100);
      
      return {
        deposits: totalDeposits,
        advance: totalAdvance,
        initialFees,
        subtotal: totalDeposits + totalAdvance + initialFees,
        vat,
        grandTotal: totalDeposits + totalAdvance + initialFees + vat,
      };
    }
    
    // Legacy single vehicle
    return {
      deposits: data.default_deposit_amount || 0,
      advance: 0,
      initialFees: 0,
      subtotal: 0,
      vat: 0,
      grandTotal: 0,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Quote Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Summary & Review
          </CardTitle>
          <CardDescription>
            Review all quote details before submission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Quote Type:</span>
              <p className="font-medium">{data.quote_type || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Customer:</span>
              <p className="font-medium">{data.account_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quote Date:</span>
              <p className="font-medium">{data.quote_date || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Valid Until:</span>
              <p className="font-medium">{data.validity_date_to || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Lines Summary (Corporate) */}
      {isCorporate && data.quote_items && data.quote_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Lines ({data.quote_items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.quote_items.map((line: any) => (
                <div key={line.line_no} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">Line {line.line_no}</h4>
                      <p className="text-sm text-muted-foreground">
                        {line.vehicle_class_id ? 'Vehicle Category Selected' : 'Specific Vehicle Selected'}
                      </p>
                      {line.vin && (
                        <p className="text-xs text-muted-foreground mt-1">
                          VIN: {line.vin}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {line.duration_months} months
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* Contract Terms */}
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{line.pickup_at || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">{line.end_date || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{line.duration_months} months</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate Type:</span>
                      <p className="font-medium capitalize">{line.rate_type || 'monthly'}</p>
                    </div>
                    
                    {/* Mileage Terms */}
                    <div>
                      <span className="text-muted-foreground">Mileage Package:</span>
                      <p className="font-medium">{line.mileage_package_km?.toLocaleString() || 'N/A'} km/month</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Excess Rate:</span>
                      <p className="font-medium">{line.excess_km_rate?.toFixed(2) || 'N/A'} AED/km</p>
                    </div>
                    
                    {/* Location */}
                    {line.location_id && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{line.location_id}</p>
                      </div>
                    )}
                    
                    {/* Odometer */}
                    {line.odometer && (
                      <div>
                        <span className="text-muted-foreground">Current Odometer:</span>
                        <p className="font-medium">{line.odometer.toLocaleString()} km</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {/* Financial breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">
                        {line.rate_type === 'daily' ? 'Daily' : line.rate_type === 'weekly' ? 'Weekly' : 'Monthly'} Rate:
                      </span>
                      <p className="font-semibold">{line.monthly_rate.toFixed(2)} AED</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deposit:</span>
                      <p className="font-semibold">{line.deposit_amount.toFixed(2)} AED</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Advance Rent:</span>
                      <p className="font-semibold">
                        {line.advance_rent_months} × {line.monthly_rate.toFixed(2)} = {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold mt-3">
                    <span>Line Upfront Total:</span>
                    <span className="text-primary">
                      {(line.deposit_amount + ((line.advance_rent_months || 0) * (line.monthly_rate || 0))).toFixed(2)} AED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Terms Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Financial Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Billing Plan:</span>
              <p className="font-medium capitalize">{data.billing_plan || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Billing Start:</span>
              <p className="font-medium">{data.billing_start_date || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">VAT Rate:</span>
              <p className="font-medium">{data.vat_percentage || 0}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payment Method:</span>
              <p className="font-medium capitalize">{data.payment_method?.replace('-', ' ') || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit Type:</span>
              <p className="font-medium capitalize">{data.deposit_type?.replace('-', ' ') || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Escalation:</span>
              <p className="font-medium">{data.annual_escalation_percentage || 0}% annually</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initial Fees */}
      {data.initial_fees && data.initial_fees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Initial Fees (One-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.initial_fees.map((fee: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {fee.fee_type} {fee.description && `- ${fee.description}`}
                  </span>
                  <span className="font-medium">{parseFloat(fee.amount).toFixed(2)} AED</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Initial Fees:</span>
                <span>{totals.initialFees.toFixed(2)} AED</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grand Total Summary */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Upfront Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Deposits:</span>
              <span className="font-semibold">{totals.deposits.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Advance Rent:</span>
              <span className="font-semibold">{totals.advance.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Fees:</span>
              <span className="font-semibold">{totals.initialFees.toFixed(2)} AED</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{totals.subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT ({data.vat_percentage || 0}%):</span>
              <span className="font-semibold">{totals.vat.toFixed(2)} AED</span>
            </div>
            <Separator className="border-primary" />
            <div className="flex justify-between font-bold text-xl">
              <span className="text-primary">Grand Total Due:</span>
              <span className="text-primary">{totals.grandTotal.toFixed(2)} AED</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.notes || 'No additional notes provided'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};