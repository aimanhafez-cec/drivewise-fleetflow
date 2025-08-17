import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface VehicleOwnershipProps {
  vehicle: any;
}

export function VehicleOwnership({ vehicle }: VehicleOwnershipProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ownership Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Ownership Type</p>
            <p className="font-medium">{vehicle.ownership_type || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{vehicle.categories?.name || 'Uncategorized'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Added to Fleet</p>
            <p className="font-medium">
              {vehicle.created_at ? format(new Date(vehicle.created_at), 'PPP') : 'Unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* License & Registration */}
      <Card>
        <CardHeader>
          <CardTitle>License & Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">License Plate</p>
            <p className="font-medium">{vehicle.license_plate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">License Expiry</p>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {vehicle.license_expiry ? format(new Date(vehicle.license_expiry), 'PPP') : 'Not set'}
              </p>
              {vehicle.license_expiry && (
                <Badge 
                  variant={new Date(vehicle.license_expiry) < new Date() ? "destructive" : "default"}
                >
                  {new Date(vehicle.license_expiry) < new Date() ? "Expired" : "Valid"}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">VIN</p>
            <p className="font-medium text-xs">{vehicle.vin}</p>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Insurance Expiry</p>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {vehicle.insurance_expiry ? format(new Date(vehicle.insurance_expiry), 'PPP') : 'Not set'}
              </p>
              {vehicle.insurance_expiry && (
                <Badge 
                  variant={new Date(vehicle.insurance_expiry) < new Date() ? "destructive" : "default"}
                >
                  {new Date(vehicle.insurance_expiry) < new Date() ? "Expired" : "Valid"}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Daily Rate</p>
              <p className="font-medium">AED {vehicle.daily_rate || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Rate</p>
              <p className="font-medium">AED {vehicle.weekly_rate || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rate</p>
              <p className="font-medium">AED {vehicle.monthly_rate || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}