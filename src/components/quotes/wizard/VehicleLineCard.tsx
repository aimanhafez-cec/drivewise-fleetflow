import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Car } from "lucide-react";
import { useVehicles, useVehicleCategories } from "@/hooks/useVehicles";
import { useLocations } from "@/hooks/useBusinessLOVs";
import { FormError } from "@/components/ui/form-error";

interface VehicleLineCardProps {
  line: {
    line_no: number;
    vehicle_class_id?: string;
    vehicle_id?: string;
    pickup_at: string;
    return_at: string;
    deposit_amount: number;
    deposit_type?: string;
    advance_rent_months: number;
    monthly_rate: number;
    duration_months: number;
    // Phase 3B fields
    vin?: string;
    color?: string;
    location_id?: string;
    odometer?: number;
    mileage_package_km: number;
    excess_km_rate: number;
    rate_type: 'monthly' | 'weekly' | 'daily';
    lease_term_months?: number;
    end_date?: string;
    // Phase 3C: Insurance overrides
    insurance_coverage_package?: string;
    insurance_excess_aed?: number;
    insurance_glass_tire_cover?: boolean;
    insurance_pai_enabled?: boolean;
    insurance_territorial_coverage?: string;
  };
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  errors: Record<string, string>;
  depositType: string;
}

export const VehicleLineCard: React.FC<VehicleLineCardProps> = ({
  line,
  onUpdate,
  onRemove,
  errors,
  depositType,
}) => {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: categories = [], isLoading: categoriesLoading } = useVehicleCategories();
  const { items: locations = [], isLoading: locationsLoading } = useLocations();

  // Auto-populate VIN and odometer when vehicle is selected
  React.useEffect(() => {
    if (line.vehicle_id && vehicles.length > 0) {
      const selectedVehicle = vehicles.find(v => v.id === line.vehicle_id);
      if (selectedVehicle) {
        onUpdate('vin', (selectedVehicle as any).vin || '');
        onUpdate('odometer', selectedVehicle.odometer || 0);
      }
    }
  }, [line.vehicle_id, vehicles]);

  // Calculate duration in months
  React.useEffect(() => {
    if (line.pickup_at && line.return_at) {
      const pickup = new Date(line.pickup_at);
      const returnDate = new Date(line.return_at);
      const diffTime = Math.abs(returnDate.getTime() - pickup.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.ceil(diffDays / 30);
      onUpdate('duration_months', months);
    }
  }, [line.pickup_at, line.return_at]);

  // Calculate end date when pickup or duration changes
  React.useEffect(() => {
    if (line.pickup_at && line.duration_months) {
      const pickup = new Date(line.pickup_at);
      const endDate = new Date(pickup);
      endDate.setMonth(endDate.getMonth() + line.duration_months);
      onUpdate('end_date', endDate.toISOString().split('T')[0]);
    }
  }, [line.pickup_at, line.duration_months]);

  const linePrefix = `line_${line.line_no - 1}`;
  
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Vehicle Line {line.line_no}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* SECTION 1: Vehicle Identification */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Vehicle Identification</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* VIN Input */}
            <div className="space-y-2">
              <Label htmlFor={`vin_${line.line_no}`}>VIN Number</Label>
              <Input
                id={`vin_${line.line_no}`}
                type="text"
                value={line.vin || ""}
                onChange={(e) => onUpdate('vin', e.target.value)}
                placeholder="1HGBH41JXMN109186"
                maxLength={17}
              />
              <p className="text-xs text-muted-foreground">17 characters - auto-fills when vehicle selected</p>
              {errors[`${linePrefix}_vin`] && <FormError message={errors[`${linePrefix}_vin`]} />}
            </div>

            {/* Vehicle Category */}
            <div className="space-y-2">
              <Label htmlFor={`vehicle_class_${line.line_no}`}>Vehicle Category *</Label>
              <Select
                value={line.vehicle_class_id || ""}
                onValueChange={(value) => {
                  onUpdate('vehicle_class_id', value);
                  onUpdate('vehicle_id', undefined);
                  onUpdate('vin', '');
                  onUpdate('odometer', 0);
                }}
              >
                <SelectTrigger id={`vehicle_class_${line.line_no}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="__none__" disabled>No categories</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors[`${linePrefix}_vehicle`] && <FormError message={errors[`${linePrefix}_vehicle`]} />}
            </div>

            {/* Specific Vehicle */}
            <div className="space-y-2">
              <Label htmlFor={`vehicle_${line.line_no}`}>Specific Vehicle (Optional)</Label>
              <Select
                value={line.vehicle_id || ""}
                onValueChange={(value) => onUpdate('vehicle_id', value === "__none__" ? undefined : value)}
                disabled={!line.vehicle_class_id}
              >
                <SelectTrigger id={`vehicle_${line.line_no}`}>
                  <SelectValue placeholder="Any from category" />
                </SelectTrigger>
                <SelectContent>
                  {vehiclesLoading ? (
                    <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="__none__">Any from category</SelectItem>
                      {vehicles
                        .filter(v => !line.vehicle_class_id || v.category_id === line.vehicle_class_id)
                        .map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.year} {v.make} {v.model} - {v.license_plate}
                          </SelectItem>
                        ))
                      }
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Odometer (read-only) */}
            <div className="space-y-2">
              <Label htmlFor={`odometer_${line.line_no}`}>Current Odometer (km)</Label>
              <Input
                id={`odometer_${line.line_no}`}
                type="number"
                value={line.odometer || 0}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Auto-filled from vehicle record</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Location & Branch */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Location & Branch</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`location_${line.line_no}`}>Branch / Location *</Label>
              <Select
                value={line.location_id || ""}
                onValueChange={(value) => onUpdate('location_id', value)}
              >
                <SelectTrigger id={`location_${line.line_no}`}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationsLoading ? (
                    <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                  ) : locations.length === 0 ? (
                    <SelectItem value="__none__" disabled>No locations</SelectItem>
                  ) : (
                    locations.map((loc: any) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors[`${linePrefix}_location`] && <FormError message={errors[`${linePrefix}_location`]} />}
            </div>
          </div>
        </div>

        {/* SECTION 3: Contract Terms */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contract Terms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pickup Date */}
            <div className="space-y-2">
              <Label htmlFor={`pickup_${line.line_no}`}>Start Date *</Label>
              <Input
                id={`pickup_${line.line_no}`}
                type="date"
                value={line.pickup_at || ""}
                onChange={(e) => onUpdate('pickup_at', e.target.value)}
              />
              {errors[`${linePrefix}_pickup`] && <FormError message={errors[`${linePrefix}_pickup`]} />}
              {errors[`${linePrefix}_dates`] && <FormError message={errors[`${linePrefix}_dates`]} />}
            </div>

            {/* End Date (calculated, read-only) */}
            <div className="space-y-2">
              <Label htmlFor={`end_date_${line.line_no}`}>End Date</Label>
              <Input
                id={`end_date_${line.line_no}`}
                type="date"
                value={line.end_date || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Calculated: Start + Duration</p>
            </div>

            {/* Lease Term */}
            <div className="space-y-2">
              <Label htmlFor={`term_${line.line_no}`}>Lease Term (Months)</Label>
              <Input
                id={`term_${line.line_no}`}
                type="number"
                min="1"
                max="60"
                value={line.lease_term_months || line.duration_months || ""}
                onChange={(e) => {
                  const term = parseInt(e.target.value) || 0;
                  onUpdate('lease_term_months', term);
                  onUpdate('duration_months', term);
                }}
              />
            </div>

            {/* Rate Type */}
            <div className="space-y-2">
              <Label htmlFor={`rate_type_${line.line_no}`}>Rate Type *</Label>
              <Select
                value={line.rate_type || 'monthly'}
                onValueChange={(value) => onUpdate('rate_type', value)}
              >
                <SelectTrigger id={`rate_type_${line.line_no}`}>
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monthly Rate */}
            <div className="space-y-2">
              <Label htmlFor={`rate_${line.line_no}`}>
                {line.rate_type === 'daily' ? 'Daily' : line.rate_type === 'weekly' ? 'Weekly' : 'Monthly'} Rate (AED) *
              </Label>
              <Input
                id={`rate_${line.line_no}`}
                type="number"
                min="0"
                step="100"
                value={line.monthly_rate || ""}
                onChange={(e) => onUpdate('monthly_rate', parseFloat(e.target.value) || 0)}
                placeholder="3000"
              />
              {errors[`${linePrefix}_rate`] && <FormError message={errors[`${linePrefix}_rate`]} />}
            </div>

            {/* Return Date (for duration calculation) */}
            <div className="space-y-2">
              <Label htmlFor={`return_${line.line_no}`}>Return Date *</Label>
              <Input
                id={`return_${line.line_no}`}
                type="date"
                value={line.return_at || ""}
                onChange={(e) => onUpdate('return_at', e.target.value)}
              />
              {errors[`${linePrefix}_return`] && <FormError message={errors[`${linePrefix}_return`]} />}
            </div>
          </div>
        </div>

        {/* SECTION 4: Mileage & Usage */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Mileage Package</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Mileage Package */}
            <div className="space-y-2">
              <Label htmlFor={`mileage_${line.line_no}`}>Included KM / Month *</Label>
              <Input
                id={`mileage_${line.line_no}`}
                type="number"
                min="0"
                step="500"
                value={line.mileage_package_km || 3000}
                onChange={(e) => onUpdate('mileage_package_km', parseInt(e.target.value) || 0)}
                placeholder="3000"
              />
              <p className="text-xs text-muted-foreground">Standard package: 3,000 km/month</p>
              {errors[`${linePrefix}_mileage`] && <FormError message={errors[`${linePrefix}_mileage`]} />}
            </div>

            {/* Excess KM Rate */}
            <div className="space-y-2">
              <Label htmlFor={`excess_${line.line_no}`}>Excess KM Rate (AED/km) *</Label>
              <Input
                id={`excess_${line.line_no}`}
                type="number"
                min="0"
                step="0.10"
                value={line.excess_km_rate || 1.00}
                onChange={(e) => onUpdate('excess_km_rate', parseFloat(e.target.value) || 0)}
                placeholder="1.00"
              />
              <p className="text-xs text-muted-foreground">Charge per km over allowance</p>
              {errors[`${linePrefix}_excess_km`] && <FormError message={errors[`${linePrefix}_excess_km`]} />}
            </div>
          </div>
        </div>

        {/* SECTION 5: Financials (Deposit & Advance) */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Deposit & Advance Rent</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Deposit Amount */}
            <div className="space-y-2">
              <Label htmlFor={`deposit_${line.line_no}`}>
                Deposit Amount (AED) - {depositType}
              </Label>
              <Input
                id={`deposit_${line.line_no}`}
                type="number"
                min="0"
                step="100"
                value={line.deposit_amount || 0}
                onChange={(e) => onUpdate('deposit_amount', parseFloat(e.target.value) || 0)}
              />
              {errors[`${linePrefix}_deposit`] && <FormError message={errors[`${linePrefix}_deposit`]} />}
            </div>

            {/* Advance Rent Months */}
            <div className="space-y-2">
              <Label htmlFor={`advance_${line.line_no}`}>Advance Rent (Months)</Label>
              <Input
                id={`advance_${line.line_no}`}
                type="number"
                min="0"
                max="3"
                value={line.advance_rent_months || 0}
                onChange={(e) => onUpdate('advance_rent_months', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Advance: {line.advance_rent_months || 0} × {line.monthly_rate || 0} = {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
              </p>
              {errors[`${linePrefix}_advance`] && <FormError message={errors[`${linePrefix}_advance`]} />}
            </div>
          </div>
        </div>

        {/* SECTION 6: Insurance (Optional Override) */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Insurance Coverage (Optional Override)
          </h4>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-xs text-blue-800">
              <strong>Inherited from header:</strong> {line.insurance_coverage_package || 'comprehensive'} • 
              {line.insurance_excess_aed ?? 1500} AED excess • 
              {line.insurance_territorial_coverage || 'uae-only'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Coverage Package Override */}
            <div className="space-y-2">
              <Label htmlFor={`ins_pkg_${line.line_no}`}>Coverage Package</Label>
              <Select
                value={line.insurance_coverage_package || "inherit"}
                onValueChange={(value) => onUpdate('insurance_coverage_package', value === 'inherit' ? undefined : value)}
              >
                <SelectTrigger id={`ins_pkg_${line.line_no}`}>
                  <SelectValue placeholder="Use header default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Use header default</SelectItem>
                  <SelectItem value="cdw">CDW</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="full-zero-excess">Full / Zero Excess</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Excess Override */}
            <div className="space-y-2">
              <Label htmlFor={`ins_excess_${line.line_no}`}>Excess (AED)</Label>
              <Input
                id={`ins_excess_${line.line_no}`}
                type="number"
                min="0"
                step="100"
                value={line.insurance_excess_aed ?? ""}
                onChange={(e) => onUpdate('insurance_excess_aed', parseFloat(e.target.value) || 0)}
                placeholder="Use header default"
              />
            </div>

            {/* Territorial Override */}
            <div className="space-y-2">
              <Label htmlFor={`ins_terr_${line.line_no}`}>Territorial Coverage</Label>
              <Select
                value={line.insurance_territorial_coverage || "inherit"}
                onValueChange={(value) => onUpdate('insurance_territorial_coverage', value === 'inherit' ? undefined : value)}
              >
                <SelectTrigger id={`ins_terr_${line.line_no}`}>
                  <SelectValue placeholder="Use header default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Use header default</SelectItem>
                  <SelectItem value="uae-only">UAE Only</SelectItem>
                  <SelectItem value="gcc">GCC Coverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Line Totals */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-semibold">{line.duration_months || 0} months</span>
            </div>
            <div>
              <span className="text-muted-foreground">Deposit:</span>
              <span className="ml-2 font-semibold">{line.deposit_amount.toFixed(2)} AED</span>
            </div>
            <div>
              <span className="text-muted-foreground">Advance Rent:</span>
              <span className="ml-2 font-semibold">
                {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
              </span>
            </div>
            <div className="col-span-2 border-t pt-2 mt-2">
              <span className="text-muted-foreground">Line Upfront Total:</span>
              <span className="ml-2 font-bold text-primary">
                {(line.deposit_amount + ((line.advance_rent_months || 0) * (line.monthly_rate || 0))).toFixed(2)} AED
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
