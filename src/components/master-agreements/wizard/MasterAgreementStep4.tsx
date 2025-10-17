import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
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
    
    const newLines = selectedVehicles.map((vehicle, idx) => ({
      line_no: startLineNo + idx,
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
    }));
    
    onChange({ agreement_items: [...currentLines, ...newLines] });
  };

  const removeVehicleLine = (index: number) => {
    const currentLines = [...(data.agreement_items || [])];
    currentLines.splice(index, 1);
    const renumbered = currentLines.map((line, idx) => ({ ...line, line_no: idx + 1 }));
    onChange({ agreement_items: renumbered });
  };

  const updateVehicleLine = (index: number, field: string, value: any) => {
    const currentLines = [...(data.agreement_items || [])];
    currentLines[index] = { ...currentLines[index], [field]: value };
    onChange({ agreement_items: currentLines });
  };

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
          deposit_amount: data.default_deposit_amount,
          advance_rent_months: data.default_advance_rent_months,
          insurance_coverage_package: data.insurance_coverage_package,
          insurance_excess_aed: data.insurance_excess_aed,
          default_addons: data.default_addons,
          mileage_pooling_enabled: data.mileage_pooling_enabled,
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
                <span className="text-muted-foreground">Monthly Recurring Rental:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(totals.monthlyRecurringRental)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total Upfront Due (incl. VAT):</span>
                <span className="font-semibold text-lg text-primary">{formatCurrency(totals.totalIncludingVat)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};