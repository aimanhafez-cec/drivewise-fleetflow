import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VehicleGeneralInfoProps {
  vehicle: any;
}

export function VehicleGeneralInfo({ vehicle }: VehicleGeneralInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Make</p>
              <p className="font-medium">{vehicle.make}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <p className="font-medium">{vehicle.color || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">VIN</p>
              <p className="font-medium text-xs">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Plate</p>
              <p className="font-medium">{vehicle.license_plate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Transmission</p>
              <p className="font-medium">{vehicle.transmission || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engine Size</p>
              <p className="font-medium">{vehicle.engine_size || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subtype</p>
              <p className="font-medium">{vehicle.subtype || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ownership Type</p>
              <p className="font-medium">{vehicle.ownership_type || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicle.features && vehicle.features.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No features specified</p>
          )}
        </CardContent>
      </Card>

      {/* Location & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Location</p>
            <p className="font-medium">{vehicle.location || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Odometer Reading</p>
            <p className="font-medium">{vehicle.odometer?.toLocaleString() || 0} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fuel Level</p>
            <p className="font-medium">{vehicle.fuel_level || 100}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}