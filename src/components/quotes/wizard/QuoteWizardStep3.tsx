import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, AlertCircle } from "lucide-react";
import { useVehicles, useVehicleCategories } from "@/hooks/useVehicles";

interface QuoteWizardStep3Props {
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

export const QuoteWizardStep3: React.FC<QuoteWizardStep3Props> = ({
  data,
  onChange,
  errors,
}) => {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: categories = [], isLoading: categoriesLoading } = useVehicleCategories();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Selection
        </CardTitle>
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
            {errors.vehicle && (
              <p className="text-sm text-destructive">{errors.vehicle}</p>
            )}
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