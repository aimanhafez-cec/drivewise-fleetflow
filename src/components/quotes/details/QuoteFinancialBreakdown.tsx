import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

  // Determine display mode
  const pricingDisplayMode = quote.pricing_display_mode || 'bundled';
  const isItemized = pricingDisplayMode === 'itemized';

  // Helper to calculate line total with services
  const calculateLineTotalWithServices = (line: any) => {
    const baseRate = line.monthly_rate || 0;
    const maintenanceCost = (line.maintenance_included ?? quote.maintenance_included) 
      ? (line.monthly_maintenance_cost_per_vehicle ?? quote.monthly_maintenance_cost_per_vehicle ?? 0)
      : 0;
    const roadsideCost = (line.roadside_assistance_included ?? quote.roadside_assistance_included)
      ? (line.roadside_assistance_cost_monthly ?? quote.roadside_assistance_cost_monthly ?? 0)
      : 0;
    const replacementCost = (line.replacement_vehicle_included ?? quote.replacement_vehicle_included)
      ? (line.replacement_vehicle_cost_monthly ?? quote.replacement_vehicle_cost_monthly ?? 0)
      : 0;
    
    return baseRate + maintenanceCost + roadsideCost + replacementCost;
  };

  // Helper to get included services list
  const getIncludedServices = (line: any) => {
    const services = [];
    if (line.insurance_coverage_package || quote.insurance_coverage_package) services.push("Insurance");
    if (line.maintenance_included ?? quote.maintenance_included) services.push("Maintenance");
    if (line.roadside_assistance_included ?? quote.roadside_assistance_included) services.push("Roadside Assistance");
    if (line.replacement_vehicle_included ?? quote.replacement_vehicle_included) services.push("Replacement Vehicle");
    return services;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Breakdown
          </div>
          <Badge variant={isItemized ? "default" : "secondary"}>
            {isItemized ? "Itemized View" : "Bundled View"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Itemized Monthly Rate Breakdown - Only show if itemized mode */}
        {isItemized && lines.length > 0 && (
          <>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Monthly Rate Breakdown by Vehicle
              </h4>
              
              {lines.map((line: any, index: number) => {
                const baseRate = line.monthly_rate || 0;
                const vehicleName = line.vehicle_class_name || line._vehicleMeta?.label || `Vehicle ${index + 1}`;
                const quantity = line.quantity || 1;
                const maintenanceCost = (line.maintenance_included ?? quote.maintenance_included) 
                  ? (line.monthly_maintenance_cost_per_vehicle ?? quote.monthly_maintenance_cost_per_vehicle ?? 0)
                  : 0;
                const roadsideCost = (line.roadside_assistance_included ?? quote.roadside_assistance_included)
                  ? (line.roadside_assistance_cost_monthly ?? quote.roadside_assistance_cost_monthly ?? 0)
                  : 0;
                const replacementCost = (line.replacement_vehicle_included ?? quote.replacement_vehicle_included)
                  ? (line.replacement_vehicle_cost_monthly ?? quote.replacement_vehicle_cost_monthly ?? 0)
                  : 0;
                const insuranceCost = 300; // Placeholder - should come from line data
                const lineTotal = calculateLineTotalWithServices(line);
                
                return (
                  <Card key={line.id || index} className="bg-muted/30">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between font-semibold border-b pb-2">
                        <span>{vehicleName}</span>
                        {quantity > 1 && <span className="text-muted-foreground">× {quantity}</span>}
                      </div>
                      
                      <div className="flex justify-between text-sm pl-4">
                        <span className="text-muted-foreground">Base Vehicle Rate:</span>
                        <span>{formatCurrency(baseRate, currency)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm pl-4">
                        <span className="text-muted-foreground">+ Insurance:</span>
                        <span>{formatCurrency(insuranceCost, currency)}</span>
                      </div>
                      
                      {maintenanceCost > 0 && (
                        <div className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground">+ Maintenance:</span>
                          <span>{formatCurrency(maintenanceCost, currency)}</span>
                        </div>
                      )}
                      
                      {roadsideCost > 0 && (
                        <div className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground">+ Roadside Assistance (24/7):</span>
                          <span>{formatCurrency(roadsideCost, currency)}</span>
                        </div>
                      )}
                      
                      {replacementCost > 0 && (
                        <div className="flex justify-between text-sm pl-4">
                          <span className="text-muted-foreground">
                            + Replacement Vehicle ({line.replacement_sla_hours || quote.replacement_sla_hours || 24}h SLA):
                          </span>
                          <span>{formatCurrency(replacementCost, currency)}</span>
                        </div>
                      )}
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between font-semibold">
                        <span>Monthly Rate per Vehicle:</span>
                        <span className="text-primary">{formatCurrency(lineTotal, currency)}</span>
                      </div>
                      
                      {quantity > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total for {quantity} vehicles:</span>
                          <span className="font-medium">{formatCurrency(lineTotal * quantity, currency)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Separator />
          </>
        )}

        {/* Bundled View - Show summary with included services */}
        {!isItemized && lines.length > 0 && (
          <>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Monthly Lease Summary</h4>
              
              {lines.map((line: any, index: number) => {
                const vehicleName = line.vehicle_class_name || line._vehicleMeta?.label || `Vehicle ${index + 1}`;
                const quantity = line.quantity || 1;
                const lineTotal = calculateLineTotalWithServices(line);
                const includedServices = getIncludedServices(line);
                
                return (
                  <Card key={line.id || index} className="bg-muted/30">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">{vehicleName}</div>
                          {quantity > 1 && (
                            <div className="text-sm text-muted-foreground">Quantity: {quantity}</div>
                          )}
                          {includedServices.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ✓ Includes: {includedServices.join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-primary">
                            {formatCurrency(lineTotal * quantity, currency)}<span className="text-sm">/mo</span>
                          </div>
                          {quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(lineTotal, currency)} × {quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <Separator />
          </>
        )}

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
            
            {initialFeesTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Initial Fees</span>
                <span className="font-medium">{formatCurrency(initialFeesTotal, currency)}</span>
              </div>
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
