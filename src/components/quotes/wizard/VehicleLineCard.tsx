import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Car } from "lucide-react";
import { useVehicles, useVehicleCategories } from "@/hooks/useVehicles";
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Category */}
          <div className="space-y-2">
            <Label htmlFor={`vehicle_class_${line.line_no}`}>Vehicle Category *</Label>
            <Select
              value={line.vehicle_class_id || ""}
              onValueChange={(value) => {
                onUpdate('vehicle_class_id', value);
                onUpdate('vehicle_id', undefined); // Clear specific vehicle
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

          {/* Specific Vehicle (Optional) */}
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

          {/* Pickup Date */}
          <div className="space-y-2">
            <Label htmlFor={`pickup_${line.line_no}`}>Pickup Date *</Label>
            <Input
              id={`pickup_${line.line_no}`}
              type="date"
              value={line.pickup_at || ""}
              onChange={(e) => onUpdate('pickup_at', e.target.value)}
            />
            {errors[`${linePrefix}_pickup`] && <FormError message={errors[`${linePrefix}_pickup`]} />}
            {errors[`${linePrefix}_dates`] && <FormError message={errors[`${linePrefix}_dates`]} />}
          </div>

          {/* Return Date */}
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

          {/* Monthly Rate */}
          <div className="space-y-2">
            <Label htmlFor={`rate_${line.line_no}`}>Monthly Rate (AED) *</Label>
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

          {/* Duration (calculated) */}
          <div className="space-y-2">
            <Label htmlFor={`duration_${line.line_no}`}>Duration (Months)</Label>
            <Input
              id={`duration_${line.line_no}`}
              type="number"
              value={line.duration_months || 0}
              disabled
              className="bg-muted"
            />
          </div>

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

        {/* Line Totals */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
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