import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Calculator } from "lucide-react";
import { useVehicles, useVehicleCategories } from "@/hooks/useVehicles";
import { VehicleLineTable } from "@/components/quotes/wizard/VehicleLineTable";
import { VehicleSelectionModal } from "@/components/quotes/VehicleSelectionModal";
import { FormError } from "@/components/ui/form-error";
import { CostSheetSection } from "@/components/quotes/costsheet/CostSheetSection";
import { formatCurrency } from "@/lib/utils/currency";

interface MasterAgreementStep4Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
  hasUnsavedChanges?: boolean;
  onSaveRequired?: () => void;
}

export const MasterAgreementStep4: React.FC<MasterAgreementStep4Props> = ({
  data,
  onChange,
  errors,
  hasUnsavedChanges = false,
  onSaveRequired,
}) => {
  const { data: vehicles = [] } = useVehicles();
  const [vehicleModalOpen, setVehicleModalOpen] = React.useState(false);
  const [selectedLines, setSelectedLines] = React.useState<number[]>([]);

  const calculateDefaultRate = (priceListId: string, categoryName: string, billingPlan: string): number => {
    const monthlyRatesByClass: Record<string, Record<string, number>> = {
      'standard': { 'economy': 1200, 'compact': 1500, 'midsize': 2000, 'suv': 3500, 'luxury': 5000, 'premium': 5000 },
      'premium': { 'economy': 1400, 'compact': 1800, 'midsize': 2400, 'suv': 4200, 'luxury': 6000, 'premium': 6000 },
      'government': { 'economy': 1000, 'compact': 1300, 'midsize': 1800, 'suv': 3000, 'luxury': 4500, 'premium': 4500 },
    };
    const billingMultipliers: Record<string, number> = { 'monthly': 1, 'quarterly': 3, 'semi-annual': 6, 'annual': 12 };
    const priceList = priceListId || 'standard';
    const category = categoryName?.toLowerCase() || 'midsize';
    const monthlyRate = monthlyRatesByClass[priceList]?.[category] || 2000;
    const multiplier = billingMultipliers[billingPlan || 'monthly'] || 1;
    return monthlyRate * multiplier;
  };

  const addMultipleVehicleLines = (selectedVehicles: any[]) => {
    const currentLines = data.agreement_items || [];
    const startLineNo = currentLines.length + 1;
    const agreementNo = data.agreement_no || "DRAFT";
    
    const newLines = selectedVehicles.map((vehicle, idx) => {
      const lineNo = startLineNo + idx;
      const contractNo = `${agreementNo}-${String(lineNo).padStart(2, '0')}`;
      
      return {
        line_no: lineNo,
        contract_no: contractNo,
        vehicle_class_id: vehicle.category_id,
      vehicle_id: vehicle.id,
      pickup_at: data.contract_effective_from || "",
      return_at: data.contract_effective_to || "",
      deposit_amount: data.default_deposit_amount || 2500,
      deposit_type: data.deposit_type || 'refundable',
      advance_rent_months: data.default_advance_rent_months || 1,
      monthly_rate: calculateDefaultRate(
        data.default_price_list_id || 'standard',
        vehicle._itemCodeMeta?.category_name || vehicle.categories?.name || 'midsize',
        data.billing_plan || 'monthly'
      ),
      duration_months: 0,
      pickup_type: data.pickup_type || 'company_location',
      pickup_location_id: data.pickup_location_id,
      pickup_customer_site_id: data.pickup_customer_site_id,
      return_type: data.return_type || 'company_location',
      return_location_id: data.return_location_id,
      return_customer_site_id: data.return_customer_site_id,
      delivery_fee: data.default_delivery_fee || 0,
      collection_fee: data.default_collection_fee || 0,
      mileage_package_km: data.mileage_pooling_enabled ? undefined : 3000,
      excess_km_rate: data.mileage_pooling_enabled ? undefined : 1.00,
        rate_type: 'monthly' as const,
        insurance_coverage_package: data.insurance_coverage_package || 'comprehensive',
      insurance_excess_aed: data.insurance_excess_aed ?? 1500,
      insurance_glass_tire_cover: data.insurance_glass_tire_cover ?? true,
      insurance_pai_enabled: data.insurance_pai_enabled ?? false,
        insurance_territorial_coverage: data.insurance_territorial_coverage || 'uae-only',
        addons: (data.default_addons || []).map((a: any) => ({ ...a })),
        _vehicleMeta: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        item_code: vehicle.item_code,
        item_description: vehicle.item_description,
        category_name: vehicle._itemCodeMeta?.category_name || vehicle.categories?.name,
        },
      };
    });
    
    onChange({ agreement_items: [...currentLines, ...newLines] });
  };

  const removeVehicleLine = (index: number) => {
    const currentLines = [...(data.agreement_items || [])];
    currentLines.splice(index, 1);
    const agreementNo = data.agreement_no || "DRAFT";
    
    const renumbered = currentLines.map((line, idx) => ({
      ...line,
      line_no: idx + 1,
      contract_no: `${agreementNo}-${String(idx + 1).padStart(2, '0')}`,
    }));
    onChange({ agreement_items: renumbered });
  };

  const updateVehicleLine = (index: number, field: string, value: any) => {
    const currentLines = [...(data.agreement_items || [])];
    currentLines[index] = { ...currentLines[index], [field]: value };
    onChange({ agreement_items: currentLines });
  };

  // Regenerate contract numbers when agreement number changes
  React.useEffect(() => {
    if (data.agreement_no && data.agreement_items?.length > 0) {
      const needsUpdate = data.agreement_items.some((line: any) => {
        const expectedContractNo = `${data.agreement_no}-${String(line.line_no).padStart(2, '0')}`;
        return line.contract_no !== expectedContractNo;
      });
      
      if (needsUpdate) {
        const updatedItems = data.agreement_items.map((line: any) => ({
          ...line,
          contract_no: `${data.agreement_no}-${String(line.line_no).padStart(2, '0')}`,
        }));
        onChange({ agreement_items: updatedItems });
      }
    }
  }, [data.agreement_no]);

  const calculateTotals = () => {
    const lines = data.agreement_items || [];
    const getAddonType = (a: any) => a.pricing_model || a.type;
    const getAddonTotal = (a: any) => (a.total ?? a.amount ?? 0);
    
    const totalDeposits = lines.reduce((sum: number, line: any) => sum + (line.deposit_amount || 0), 0);
    const totalAdvance = lines.reduce((sum: number, line: any) => sum + ((line.advance_rent_months || 0) * (line.monthly_rate || 0)), 0);
    const totalDeliveryFees = lines.reduce((sum: number, line: any) => sum + (line.delivery_fee || 0), 0);
    const totalCollectionFees = lines.reduce((sum: number, line: any) => sum + (line.collection_fee || 0), 0);
    const initialFees = (data.initial_fees || []).reduce((sum: number, fee: any) => sum + (parseFloat(fee.amount) || 0), 0);
    
    const monthlyAddOns = lines.reduce((sum: number, line: any) => {
      const lineMonthlyAddOns = (line.addons || []).filter((a: any) => getAddonType(a) === 'monthly').reduce((s: number, a: any) => s + getAddonTotal(a), 0);
      return sum + lineMonthlyAddOns;
    }, 0);

    const oneTimeAddOns = lines.reduce((sum: number, line: any) => {
      const lineOneTimeAddOns = (line.addons || []).filter((a: any) => getAddonType(a) === 'one-time').reduce((s: number, a: any) => s + getAddonTotal(a), 0);
      return sum + lineOneTimeAddOns;
    }, 0);
    
    const monthlyRecurringRental = lines.reduce((sum: number, line: any) => {
      const baseRate = line.monthly_rate || 0;
      const monthlyAddOnsCost = (line.addons || []).filter((a: any) => getAddonType(a) === 'monthly').reduce((s: number, a: any) => s + getAddonTotal(a), 0);
      return sum + baseRate + monthlyAddOnsCost;
    }, 0);
    
    const taxableSubtotal = totalAdvance + totalDeliveryFees + totalCollectionFees + initialFees + oneTimeAddOns;
    const vatPercentage = data.vat_percentage || 5;
    const vatAmount = taxableSubtotal * (vatPercentage / 100);
    
    return {
      vehicles: lines.length,
      deposits: totalDeposits,
      advance: totalAdvance,
      deliveryFees: totalDeliveryFees,
      collectionFees: totalCollectionFees,
      initialFees,
      monthlyAddOns,
      oneTimeAddOns,
      monthlyRecurringRental,
      taxableSubtotal,
      nonTaxableSubtotal: totalDeposits,
      subtotal: totalDeposits + taxableSubtotal,
      vatPercentage,
      vatAmount,
      totalIncludingVat: totalDeposits + taxableSubtotal + vatAmount,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Lines - Master Agreement
              </CardTitle>
              <CardDescription className="mt-2">
                Add multiple vehicle lines to this agreement. Each line can have different vehicles and customized terms.
              </CardDescription>
            </div>
            <Button type="button" onClick={() => setVehicleModalOpen(true)} variant="default">
              <Car className="h-4 w-4 mr-2" />
              Select Vehicles
            </Button>
          </div>
        </CardHeader>
        {errors.agreement_items && (
          <CardContent>
            <FormError message={errors.agreement_items} />
          </CardContent>
        )}
      </Card>

      <VehicleSelectionModal
        open={vehicleModalOpen}
        onOpenChange={setVehicleModalOpen}
        selectedVehicleId={undefined}
        onVehicleSelect={(vehicles: any) => {
          if (Array.isArray(vehicles)) {
            addMultipleVehicleLines(vehicles);
          }
          setVehicleModalOpen(false);
        }}
        quoteStartDate={data.contract_effective_from}
        quoteEndDate={data.contract_effective_to}
      />

      <VehicleLineTable
        lines={data.agreement_items || []}
        onUpdate={updateVehicleLine}
        onRemove={removeVehicleLine}
        errors={errors}
        depositType={data.deposit_type || 'refundable'}
        selectedLines={selectedLines}
        onSelectLine={(lineNo) => setSelectedLines(prev => prev.includes(lineNo) ? prev.filter(l => l !== lineNo) : [...prev, lineNo])}
        onSelectAll={() => setSelectedLines(selectedLines.length === (data.agreement_items || []).length ? [] : (data.agreement_items || []).map((line: any) => line.line_no))}
        headerDefaults={{
          customer_id: data.customer_id,
          deposit_amount: data.default_deposit_amount,
          advance_rent_months: data.default_advance_rent_months,
          default_price_list_id: data.default_price_list_id,
          billing_plan: data.billing_plan,
          
          // Delivery & Collection defaults
          pickup_type: data.pickup_type,
          pickup_location_id: data.pickup_location_id,
          pickup_customer_site_id: data.pickup_customer_site_id,
          return_type: data.return_type,
          return_location_id: data.return_location_id,
          return_customer_site_id: data.return_customer_site_id,
          default_delivery_fee: data.default_delivery_fee,
          default_collection_fee: data.default_collection_fee,
          
          // Insurance & Coverage defaults
          insurance_coverage_package: data.insurance_coverage_package,
          insurance_excess_aed: data.insurance_excess_aed,
          insurance_glass_tire_cover: data.insurance_glass_tire_cover,
          insurance_pai_enabled: data.insurance_pai_enabled,
          insurance_territorial_coverage: data.insurance_territorial_coverage,
          
          // Maintenance defaults
          maintenance_included: data.maintenance_included,
          maintenance_package_type: data.maintenance_package_type,
          monthly_maintenance_cost_per_vehicle: data.monthly_maintenance_cost_per_vehicle,
          maintenance_plan_source: data.maintenance_plan_source,
          show_maintenance_separate_line: data.show_maintenance_separate_line,
          
          // Add-ons & Mileage defaults
          default_addons: data.default_addons,
          mileage_pooling_enabled: data.mileage_pooling_enabled,
          pooled_mileage_allowance_km: data.pooled_mileage_allowance_km,
          pooled_excess_km_rate: data.pooled_excess_km_rate,
        }}
      />

      {data.agreement_items && data.agreement_items.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Agreement Totals Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Vehicles:</span>
                <span className="font-semibold">{totals.vehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Deposits:</span>
                <span className="font-semibold">{formatCurrency(totals.deposits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Advance Rent:</span>
                <span className="font-semibold">{formatCurrency(totals.advance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Delivery Fees:</span>
                <span className="font-semibold">{formatCurrency(totals.deliveryFees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Collection Fees:</span>
                <span className="font-semibold">{formatCurrency(totals.collectionFees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Fees (One-time):</span>
                <span className="font-semibold">{formatCurrency(totals.initialFees)}</span>
              </div>
              
              {/* Add-Ons Section */}
              {(totals.monthlyAddOns > 0 || totals.oneTimeAddOns > 0) && (
                <>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-muted-foreground">Monthly Add-Ons (Total):</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(totals.monthlyAddOns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">One-Time Add-Ons:</span>
                    <span className="font-semibold">{formatCurrency(totals.oneTimeAddOns)}</span>
                  </div>
                </>
              )}
              
              {/* Monthly Recurring Section */}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Monthly Recurring Rental:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(totals.monthlyRecurringRental)}</span>
              </div>
              
              {/* Subtotal and VAT */}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-muted-foreground">Subtotal (Taxable):</span>
                <span>{formatCurrency(totals.taxableSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposits (Non-taxable):</span>
                <span>{formatCurrency(totals.nonTaxableSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT ({totals.vatPercentage}%):</span>
                <span>{formatCurrency(totals.vatAmount)}</span>
              </div>
              
              {/* Grand Total */}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">Total Upfront Due (incl. VAT):</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(totals.totalIncludingVat)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Sheet Section */}
      {data.id && (
        <CostSheetSection 
          entityId={data.id}
          entityType="agreement"
          quoteId={undefined}
          entityNumber={data.agreement_no}
          durationMonths={data.duration_days ? Math.round(data.duration_days / 30) : 36}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveRequired={onSaveRequired}
          sourceQuoteNumber={data.source_quote_no}
        />
      )}
    </div>
  );
};