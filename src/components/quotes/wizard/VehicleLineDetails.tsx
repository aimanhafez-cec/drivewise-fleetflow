import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { useLocations } from "@/hooks/useBusinessLOVs";

interface VehicleLineDetailsProps {
  line: any;
  onUpdate: (field: string, value: any) => void;
  errors: Record<string, string>;
  depositType: string;
}

export const VehicleLineDetails: React.FC<VehicleLineDetailsProps> = ({
  line,
  onUpdate,
  errors,
  depositType,
}) => {
  const { items: locations = [], isLoading: locationsLoading } = useLocations();
  const linePrefix = `line_${line.line_no - 1}`;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Vehicle Info Summary */}
      <Card className="bg-background">
        <CardContent className="pt-4">
          <h4 className="font-semibold mb-2">Vehicle Line {line.line_no}</h4>
          <p className="text-sm text-muted-foreground">
            {line._vehicleMeta 
              ? `${line._vehicleMeta.year} ${line._vehicleMeta.make} ${line._vehicleMeta.model} (${line._vehicleMeta.category_name})`
              : 'Vehicle not selected'}
          </p>
          {line._vehicleMeta?._itemCodeMeta && (
            <p className="text-xs text-muted-foreground mt-1">
              {line._vehicleMeta._itemCodeMeta.available_qty} vehicles available
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SECTION 1: Location & Branch */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Location & Branch
          </h4>
          
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

        {/* SECTION 5: Insurance Overrides */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground border-b pb-2">
            Insurance Overrides
          </h4>
          
          <div className="space-y-2">
            <Label htmlFor={`ins_coverage_${line.line_no}`}>Coverage Package</Label>
            <Select
              value={line.insurance_coverage_package || 'comprehensive'}
              onValueChange={(value) => onUpdate('insurance_coverage_package', value)}
            >
              <SelectTrigger id={`ins_coverage_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
                <SelectItem value="third-party">Third Party</SelectItem>
                <SelectItem value="cdw">CDW Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_excess_${line.line_no}`}>Excess (AED)</Label>
            <Input
              id={`ins_excess_${line.line_no}`}
              type="number"
              min="0"
              step="100"
              value={line.insurance_excess_aed ?? 1500}
              onChange={(e) => onUpdate('insurance_excess_aed', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`ins_territory_${line.line_no}`}>Territorial Coverage</Label>
            <Select
              value={line.insurance_territorial_coverage || 'uae-only'}
              onValueChange={(value) => onUpdate('insurance_territorial_coverage', value)}
            >
              <SelectTrigger id={`ins_territory_${line.line_no}`}>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uae-only">UAE Only</SelectItem>
                <SelectItem value="gcc">GCC Countries</SelectItem>
                <SelectItem value="gcc-plus">GCC + Oman</SelectItem>
              </SelectContent>
            </Select>
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
