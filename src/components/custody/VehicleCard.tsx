import { Car, Fuel, Gauge, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VehicleCardProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    vin?: string;
    status?: string;
    odometer?: number;
    category_id?: string;
  };
  showActions?: boolean;
  onSelect?: (vehicleId: string) => void;
  onViewDetails?: (vehicleId: string) => void;
  selected?: boolean;
  className?: string;
}

export function VehicleCard({ 
  vehicle, 
  showActions = false, 
  onSelect, 
  onViewDetails,
  selected = false,
  className = '' 
}: VehicleCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rented':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'reserved':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const vinTail = vehicle.vin ? vehicle.vin.slice(-6) : 'N/A';

  return (
    <Card 
      className={`
        ${className} 
        ${selected ? 'ring-2 ring-primary' : ''} 
        ${onSelect ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={() => onSelect?.(vehicle.id)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-xs text-muted-foreground">
                {vehicle.year} • VIN: ...{vinTail}
              </p>
            </div>
          </div>
          {vehicle.status && (
            <Badge className={getStatusColor(vehicle.status)}>
              {vehicle.status}
            </Badge>
          )}
        </div>

        {/* License Plate */}
        <div className="mb-3 rounded-md bg-muted p-2 text-center">
          <div className="text-lg font-bold tracking-wider">
            {vehicle.license_plate}
          </div>
        </div>

        {/* Vehicle Metrics */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          {vehicle.odometer && (
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {vehicle.odometer.toLocaleString()} km
              </span>
            </div>
          )}
          {vehicle.category_id && (
            <div className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Class: {vehicle.category_id}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(vehicle.id);
                }}
              >
                View Details
              </Button>
            )}
            {onSelect && (
              <Button 
                variant={selected ? 'default' : 'outline'} 
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(vehicle.id);
                }}
              >
                {selected ? 'Selected' : 'Select'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
