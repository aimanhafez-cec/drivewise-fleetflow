import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, AlertCircle } from "lucide-react";
import { useVehicles, useVehicleCategories } from "@/hooks/useVehicles";
import { VehicleLineCard } from "./VehicleLineCard";
import { VehicleLineTable } from "./VehicleLineTable";
import { VehicleSelectionModal } from "../VehicleSelectionModal";
import { FormError } from "@/components/ui/form-error";

interface QuoteWizardStep3Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep4_Vehicles: React.FC<QuoteWizardStep3Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: categories = [], isLoading: categoriesLoading } = useVehicleCategories();
  
  const [vehicleModalOpen, setVehicleModalOpen] = React.useState(false);
  const [selectedLines, setSelectedLines] = React.useState<number[]>([]);

  const isCorporate = data.quote_type === 'Corporate lease';

  // Add multiple vehicle lines from modal selection
  const addMultipleVehicleLines = (selectedVehicles: any[]) => {
    const currentLines = data.quote_items || [];
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
      monthly_rate: 0,
      duration_months: 0,
      location_id: undefined,
      mileage_package_km: 3000,
      excess_km_rate: 1.00,
      rate_type: 'monthly' as const,
      lease_term_months: undefined,
      end_date: undefined,
      insurance_coverage_package: data.insurance_coverage_package || 'comprehensive',
      insurance_excess_aed: data.insurance_excess_aed ?? 1500,
      insurance_glass_tire_cover: data.insurance_glass_tire_cover ?? true,
      insurance_pai_enabled: data.insurance_pai_enabled ?? false,
      insurance_territorial_coverage: data.insurance_territorial_coverage || 'uae-only',
      // Store vehicle metadata for display
      _vehicleMeta: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        item_code: vehicle.item_code,
        item_description: vehicle.item_description,
        category_name: vehicle._itemCodeMeta?.category_name || vehicle.categories?.name,
        colors: vehicle._itemCodeMeta?.colors || [],
        _itemCodeMeta: vehicle._itemCodeMeta,
      },
    }));
    
    onChange({ quote_items: [...currentLines, ...newLines] });
  };

  // Remove vehicle line
  const removeVehicleLine = (index: number) => {
    const currentLines = [...(data.quote_items || [])];
    currentLines.splice(index, 1);
    // Renumber lines
    const renumbered = currentLines.map((line, idx) => ({
      ...line,
      line_no: idx + 1,
    }));
    onChange({ quote_items: renumbered });
  };

  // Update vehicle line
  const updateVehicleLine = (index: number, field: string, value: any) => {
    const currentLines = [...(data.quote_items || [])];
    currentLines[index] = { ...currentLines[index], [field]: value };
    onChange({ quote_items: currentLines });
  };

  // Calculate totals
  const calculateTotals = () => {
    const lines = data.quote_items || [];
    const totalDeposits = lines.reduce((sum: number, line: any) => sum + (line.deposit_amount || 0), 0);
    const totalAdvance = lines.reduce((sum: number, line: any) => 
      sum + ((line.advance_rent_months || 0) * (line.monthly_rate || 0)), 0);
    const initialFees = (data.initial_fees || []).reduce((sum: number, fee: any) => 
      sum + (parseFloat(fee.amount) || 0), 0);
    
    return {
      vehicles: lines.length,
      deposits: totalDeposits,
      advance: totalAdvance,
      initialFees,
      grandTotal: totalDeposits + totalAdvance + initialFees,
    };
  };

  const totals = calculateTotals();

  const handleSelectLine = (lineNo: number) => {
    setSelectedLines(prev =>
      prev.includes(lineNo) ? prev.filter(l => l !== lineNo) : [...prev, lineNo]
    );
  };

  const handleSelectAll = () => {
    if (selectedLines.length === (data.quote_items || []).length) {
      setSelectedLines([]);
    } else {
      setSelectedLines((data.quote_items || []).map((line: any) => line.line_no));
    }
  };

  // Corporate Multi-Vehicle Interface
  if (isCorporate) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Lines - Corporate Quote
                </CardTitle>
                <CardDescription className="mt-2">
                  Add multiple vehicle lines to this corporate quote. Each line can have different vehicles, 
                  dates, and customized deposits/advance rent.
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => setVehicleModalOpen(true)}
                variant="default"
              >
                <Car className="h-4 w-4 mr-2" />
                Select Vehicles
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.quote_items && <FormError message={errors.quote_items} />}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Select multiple vehicles at once, then expand each row to customize details.
                Each line inherits defaults from previous steps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection Modal */}
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

        {/* Vehicle Lines Table */}
        <VehicleLineTable
          lines={data.quote_items || []}
          onUpdate={updateVehicleLine}
          onRemove={removeVehicleLine}
          errors={errors}
          depositType={data.deposit_type || 'refundable'}
          selectedLines={selectedLines}
          onSelectLine={handleSelectLine}
          onSelectAll={handleSelectAll}
          headerDefaults={{
            deposit_amount: data.default_deposit_amount,
            advance_rent_months: data.default_advance_rent_months,
            insurance_coverage_package: data.insurance_coverage_package,
            insurance_excess_aed: data.insurance_excess_aed,
            insurance_glass_tire_cover: data.insurance_glass_tire_cover,
            insurance_pai_enabled: data.insurance_pai_enabled,
            insurance_territorial_coverage: data.insurance_territorial_coverage,
          }}
        />

        {/* Summary Panel */}
        {data.quote_items && data.quote_items.length > 0 && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Quote Totals Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Vehicles:</span>
                  <span className="font-semibold">{totals.vehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Deposits:</span>
                  <span className="font-semibold">{totals.deposits.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Advance Rent:</span>
                  <span className="font-semibold">{totals.advance.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initial Fees (One-time):</span>
                  <span className="font-semibold">{totals.initialFees.toFixed(2)} AED</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total Upfront Due:</span>
                  <span className="font-bold text-lg text-primary">{totals.grandTotal.toFixed(2)} AED</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Single Vehicle Interface (Non-Corporate)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Selection
        </CardTitle>
        <CardDescription>
          Select a vehicle category and optionally a specific vehicle for this quote
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_type">Vehicle Category</Label>
            <Select
              value={data.vehicle_type_id || ""}
              onValueChange={(value) => onChange({ vehicle_type_id: value, vehicle_id: undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="__loading__" disabled>Loading categories...</SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="__no_categories__" disabled>No categories found</SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} - {category.description || ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Specific Vehicle (Optional)</Label>
            <Select
              value={data.vehicle_id || ""}
              onValueChange={(value) => onChange({ vehicle_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specific vehicle (optional)" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesLoading ? (
                  <SelectItem value="__loading__" disabled>Loading vehicles...</SelectItem>
                ) : vehicles.length === 0 ? (
                  <SelectItem value="__no_vehicles__" disabled>No vehicles available</SelectItem>
                ) : (
                  <>
                    <SelectItem value="__none__">Any vehicle from category</SelectItem>
                    {vehicles
                      .filter((vehicle) => !data.vehicle_type_id || vehicle.category_id === data.vehicle_type_id)
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.vehicle && <FormError message={errors.vehicle} />}
          </div>
        </div>

        {/* Availability Check */}
        {data.pickup_at && data.return_at && (data.vehicle_type_id || data.vehicle_id) && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Availability Check
            </h4>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Available
                </Badge>
                <span className="text-sm text-green-700">
                  Vehicles are available for the selected dates
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Vehicle Summary */}
        {data.vehicle_id && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Selected Vehicle</h4>
            {vehicles.find(v => v.id === data.vehicle_id) && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <p className="font-medium">
                      {vehicles.find(v => v.id === data.vehicle_id)?.year}{" "}
                      {vehicles.find(v => v.id === data.vehicle_id)?.make}{" "}
                      {vehicles.find(v => v.id === data.vehicle_id)?.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      License: {vehicles.find(v => v.id === data.vehicle_id)?.license_plate}
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};