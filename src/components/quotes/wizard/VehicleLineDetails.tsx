import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormError } from "@/components/ui/form-error";
import { useLocations } from "@/hooks/useBusinessLOVs";
import { formatDurationInMonthsAndDays } from "@/lib/utils/dateUtils";

interface VehicleLineDetailsProps {
  line: any;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
  depositType: string;
  headerDefaults?: {
    deposit_amount?: number;
    advance_rent_months?: number;
    insurance_coverage_package?: string;
    insurance_excess_aed?: number;
    insurance_glass_tire_cover?: boolean;
    insurance_pai_enabled?: boolean;
    insurance_territorial_coverage?: string;
    default_pickup_location_id?: string;
    default_return_location_id?: string;
  };
}

export const VehicleLineDetails: React.FC<VehicleLineDetailsProps> = ({
  line,
  onUpdate,
  errors,
  depositType,
  headerDefaults = {},
}) => {
  const { items: locations = [], isLoading: locationsLoading } = useLocations();
  const linePrefix = `line_${line.line_no - 1}`;

  // Auto-calculate lease term from dates
  useEffect(() => {
    if (line.pickup_at && line.return_at) {
      const from = new Date(line.pickup_at);
      const to = new Date(line.return_at);
      
      // Calculate months (rounded to nearest month)
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.round(diffDays / 30.44); // Average days per month
      
      // Update both duration_months and lease_term_months
      if (line.duration_months !== months) {
        onUpdate('duration_months', months);
      }
      if (line.lease_term_months !== months) {
        onUpdate('lease_term_months', months);
      }
    }
  }, [line.pickup_at, line.return_at, line.duration_months, line.lease_term_months, onUpdate]);

  // Helper to check if a field is customized
  const isCustomized = (field: string, lineValue: any, defaultValue: any) => {
    if (defaultValue === undefined) return false;
    return lineValue !== undefined && lineValue !== defaultValue;
  };

  // Reset field to default
  const resetToDefault = (field: string, defaultValue: any) => {
    onUpdate(field, defaultValue);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SECTION 1: Delivery & Collection */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Delivery & Collection
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor={`pickup_location_${line.line_no}`} className="flex items-center gap-2">
              Pickup Location *
              {isCustomized("pickup_location_id", line.pickup_location_id, headerDefaults.default_pickup_location_id) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.pickup_location_id ?? headerDefaults.default_pickup_location_id ?? ""}
              onValueChange={(value) => onUpdate('pickup_location_id', value)}
            >
              <SelectTrigger id={`pickup_location_${line.line_no}`}>
                <SelectValue placeholder={headerDefaults.default_pickup_location_id ? "Select location" : "Select pickup location"} />
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
            {isCustomized("pickup_location_id", line.pickup_location_id, headerDefaults.default_pickup_location_id) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("pickup_location_id", headerDefaults.default_pickup_location_id)}
              >
                Reset to default
              </Button>
            )}
            {errors[`${linePrefix}_pickup_location`] && <FormError message={errors[`${linePrefix}_pickup_location`]} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`return_location_${line.line_no}`} className="flex items-center gap-2">
              Return Location
              {isCustomized("return_location_id", line.return_location_id, headerDefaults.default_return_location_id) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.return_location_id ?? headerDefaults.default_return_location_id ?? line.pickup_location_id ?? headerDefaults.default_pickup_location_id ?? ""}
              onValueChange={(value) => onUpdate('return_location_id', value)}
            >
              <SelectTrigger id={`return_location_${line.line_no}`}>
                <SelectValue placeholder="Same as pickup" />
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
            {isCustomized("return_location_id", line.return_location_id, headerDefaults.default_return_location_id) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("return_location_id", headerDefaults.default_return_location_id)}
              >
                Reset to default
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Leave blank to use pickup location</p>
          </div>
        </div>

        {/* SECTION 2: Contract Terms */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Contract Terms
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor={`pickup_${line.line_no}`}>Start Date *</Label>
            <Input
              id={`pickup_${line.line_no}`}
              type="date"
              value={line.pickup_at || ""}
              onChange={(e) => onUpdate('pickup_at', e.target.value)}
            />
            {errors[`${linePrefix}_pickup`] && <FormError message={errors[`${linePrefix}_pickup`]} />}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor={`term_${line.line_no}`}>Lease Term</Label>
            <Input
              id={`term_${line.line_no}`}
              type="text"
              value={
                line.pickup_at && line.return_at
                  ? formatDurationInMonthsAndDays(
                      new Date(line.pickup_at),
                      new Date(line.return_at)
                    )
                  : ""
              }
              disabled
              placeholder="Auto-calculated from dates"
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Duration: {line.duration_months || 0} months
            </p>
          </div>

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
        </div>

        {/* SECTION 3: Mileage Package */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Mileage Package
          </h4>
          
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
            <p className="text-xs text-muted-foreground">Standard: 3,000 km/month</p>
            {errors[`${linePrefix}_mileage`] && <FormError message={errors[`${linePrefix}_mileage`]} />}
          </div>

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

        {/* SECTION 4: Deposit & Advance */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Deposit & Advance Rent
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor={`deposit_${line.line_no}`} className="flex items-center gap-2">
              Deposit Amount (AED) - {depositType}
              {isCustomized("deposit_amount", line.deposit_amount, headerDefaults.deposit_amount) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`deposit_${line.line_no}`}
              type="number"
              min="0"
              step="100"
              value={line.deposit_amount ?? headerDefaults.deposit_amount ?? 0}
              onChange={(e) => onUpdate('deposit_amount', parseFloat(e.target.value) || 0)}
              placeholder={headerDefaults.deposit_amount ? `Default: ${headerDefaults.deposit_amount}` : undefined}
            />
            {isCustomized("deposit_amount", line.deposit_amount, headerDefaults.deposit_amount) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("deposit_amount", headerDefaults.deposit_amount)}
              >
                Reset to default
              </Button>
            )}
            {errors[`${linePrefix}_deposit`] && <FormError message={errors[`${linePrefix}_deposit`]} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`advance_${line.line_no}`} className="flex items-center gap-2">
              Advance Rent (Months)
              {isCustomized("advance_rent_months", line.advance_rent_months, headerDefaults.advance_rent_months) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`advance_${line.line_no}`}
              type="number"
              min="0"
              max="3"
              value={line.advance_rent_months ?? headerDefaults.advance_rent_months ?? 0}
              onChange={(e) => onUpdate('advance_rent_months', parseInt(e.target.value) || 0)}
              placeholder={headerDefaults.advance_rent_months !== undefined ? `Default: ${headerDefaults.advance_rent_months}` : undefined}
            />
            {isCustomized("advance_rent_months", line.advance_rent_months, headerDefaults.advance_rent_months) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("advance_rent_months", headerDefaults.advance_rent_months)}
              >
                Reset to default
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Advance: {line.advance_rent_months || 0} × {line.monthly_rate || 0} = {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
            </p>
            {errors[`${linePrefix}_advance`] && <FormError message={errors[`${linePrefix}_advance`]} />}
          </div>
        </div>

        {/* SECTION 5: Insurance Overrides */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Insurance Overrides
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor={`ins_coverage_${line.line_no}`} className="flex items-center gap-2">
              Coverage Package
              {isCustomized("insurance_coverage_package", line.insurance_coverage_package, headerDefaults.insurance_coverage_package) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.insurance_coverage_package ?? headerDefaults.insurance_coverage_package ?? 'comprehensive'}
              onValueChange={(value) => onUpdate('insurance_coverage_package', value)}
            >
              <SelectTrigger id={`ins_coverage_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cdw">CDW</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="full-zero-excess">Full / Zero Excess</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_coverage_package", line.insurance_coverage_package, headerDefaults.insurance_coverage_package) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_coverage_package", headerDefaults.insurance_coverage_package)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_excess_${line.line_no}`} className="flex items-center gap-2">
              Excess (AED)
              {isCustomized("insurance_excess_aed", line.insurance_excess_aed, headerDefaults.insurance_excess_aed) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Input
              id={`ins_excess_${line.line_no}`}
              type="number"
              min="0"
              step="100"
              value={line.insurance_excess_aed ?? headerDefaults.insurance_excess_aed ?? 1500}
              onChange={(e) => onUpdate('insurance_excess_aed', parseFloat(e.target.value))}
              placeholder={headerDefaults.insurance_excess_aed !== undefined ? `Default: ${headerDefaults.insurance_excess_aed}` : undefined}
            />
            {isCustomized("insurance_excess_aed", line.insurance_excess_aed, headerDefaults.insurance_excess_aed) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_excess_aed", headerDefaults.insurance_excess_aed)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_territory_${line.line_no}`} className="flex items-center gap-2">
              Territorial Coverage
              {isCustomized("insurance_territorial_coverage", line.insurance_territorial_coverage, headerDefaults.insurance_territorial_coverage) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={line.insurance_territorial_coverage ?? headerDefaults.insurance_territorial_coverage ?? 'uae-only'}
              onValueChange={(value) => onUpdate('insurance_territorial_coverage', value)}
            >
              <SelectTrigger id={`ins_territory_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uae-only">UAE Only</SelectItem>
                <SelectItem value="gcc">GCC Countries</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_territorial_coverage", line.insurance_territorial_coverage, headerDefaults.insurance_territorial_coverage) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_territorial_coverage", headerDefaults.insurance_territorial_coverage)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_glass_tire_${line.line_no}`} className="flex items-center gap-2">
              Glass & Tire Cover
              {isCustomized("insurance_glass_tire_cover", line.insurance_glass_tire_cover, headerDefaults.insurance_glass_tire_cover) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={(line.insurance_glass_tire_cover ?? headerDefaults.insurance_glass_tire_cover) ? "yes" : "no"}
              onValueChange={(value) => onUpdate('insurance_glass_tire_cover', value === "yes")}
            >
              <SelectTrigger id={`ins_glass_tire_${line.line_no}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Included</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_glass_tire_cover", line.insurance_glass_tire_cover, headerDefaults.insurance_glass_tire_cover) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_glass_tire_cover", headerDefaults.insurance_glass_tire_cover)}
              >
                Reset to default
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_pai_${line.line_no}`} className="flex items-center gap-2">
              Personal Accident Insurance (PAI)
              {isCustomized("insurance_pai_enabled", line.insurance_pai_enabled, headerDefaults.insurance_pai_enabled) && (
                <Badge variant="secondary" className="text-xs">Customized</Badge>
              )}
            </Label>
            <Select
              value={(line.insurance_pai_enabled ?? headerDefaults.insurance_pai_enabled) ? "yes" : "no"}
              onValueChange={(value) => onUpdate('insurance_pai_enabled', value === "yes")}
            >
              <SelectTrigger id={`ins_pai_${line.line_no}`}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Enabled</SelectItem>
                <SelectItem value="no">No - Not Included</SelectItem>
              </SelectContent>
            </Select>
            {isCustomized("insurance_pai_enabled", line.insurance_pai_enabled, headerDefaults.insurance_pai_enabled) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => resetToDefault("insurance_pai_enabled", headerDefaults.insurance_pai_enabled)}
              >
                Reset to default
              </Button>
            )}
          </div>
        </div>

        {/* SECTION 6: Line Summary */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Line Summary
          </h4>
          
          <Card className="bg-muted">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit:</span>
                <span className="font-medium">{line.deposit_amount || 0} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advance Rent:</span>
                <span className="font-medium">
                  {((line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-semibold">Upfront Total:</span>
                <span className="font-bold text-primary">
                  {((line.deposit_amount || 0) + (line.advance_rent_months || 0) * (line.monthly_rate || 0)).toFixed(2)} AED
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{line.duration_months || 0} months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Mileage:</span>
                <span className="font-medium">
                  {((line.mileage_package_km || 0) * (line.duration_months || 0)).toLocaleString()} km
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
