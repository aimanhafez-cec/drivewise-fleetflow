import React from 'react';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LOVSelect } from '@/components/ui/lov-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAvailableVehicles, formatVehicleDisplay, AvailableVehicle } from '@/hooks/useAvailableVehicles';

interface ConditionalVehicleSelectorProps {
  value?: string;
  onChange: (vehicleId: string) => void;
  checkOutDate?: Date;
  checkInDate?: Date;
  checkOutLocationId?: string;
  checkInLocationId?: string;
  vehicleClassId?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ConditionalVehicleSelector: React.FC<ConditionalVehicleSelectorProps> = ({
  value,
  onChange,
  checkOutDate,
  checkInDate,
  checkOutLocationId,
  checkInLocationId,
  vehicleClassId,
  className,
  placeholder = "Select vehicle...",
  disabled = false
}) => {
  const prerequisitesMet = !!(
    checkOutDate &&
    checkInDate &&
    checkOutLocationId &&
    checkInLocationId &&
    vehicleClassId &&
    checkOutDate < checkInDate
  );

  const { 
    data: availableVehicles = [], 
    isLoading, 
    error 
  } = useAvailableVehicles({
    startDate: checkOutDate,
    endDate: checkInDate,
    categoryId: vehicleClassId,
    outLocationId: checkOutLocationId,
    inLocationId: checkInLocationId,
    enabled: prerequisitesMet
  });

  const vehicleOptions = availableVehicles.map(vehicle => ({
    id: vehicle.id,
    label: formatVehicleDisplay(vehicle),
    ...vehicle
  }));

  const selectedVehicle = availableVehicles.find(v => v.id === value);

  const handleVehicleSelect = (vehicleIds: string[]) => {
    const vehicleId = vehicleIds[0];
    if (vehicleId) {
      onChange(vehicleId);
    }
  };

  const renderPrerequisiteStatus = () => {
    const missing = [];
    if (!checkOutDate) missing.push('Check Out Date');
    if (!checkInDate) missing.push('Check In Date');
    if (!checkOutLocationId) missing.push('Check Out Location');
    if (!checkInLocationId) missing.push('Check In Location');
    if (!vehicleClassId) missing.push('Vehicle Class');

    if (missing.length > 0) {
      return (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select the following first: <strong>{missing.join(', ')}</strong>
          </AlertDescription>
        </Alert>
      );
    }

    if (checkOutDate && checkInDate && checkOutDate >= checkInDate) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Check out date must be before check in date.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const renderVehicleCount = () => {
    if (!prerequisitesMet) return null;
    
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Skeleton className="h-4 w-4 rounded" />
          <span>Checking availability...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Error loading vehicles</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Car className="h-4 w-4" />
        <span>{availableVehicles.length} vehicle{availableVehicles.length !== 1 ? 's' : ''} available</span>
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Vehicle <span className="text-destructive">*</span>
        </Label>
        {renderVehicleCount()}
      </div>

      {renderPrerequisiteStatus()}

      <LOVSelect
        items={vehicleOptions}
        value={value ? [value] : []}
        onChange={handleVehicleSelect}
        isLoading={isLoading}
        placeholder={prerequisitesMet ? placeholder : "Complete prerequisites first"}
        disabled={disabled || !prerequisitesMet}
        allowClear={true}
        className="w-full"
      />

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="p-3 border rounded-lg bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatVehicleDisplay(selectedVehicle)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{selectedVehicle.category?.name}</Badge>
                <span>•</span>
                <span>Status: {selectedVehicle.status}</span>
                {selectedVehicle.daily_rate && (
                  <>
                    <span>•</span>
                    <span>${selectedVehicle.daily_rate}/day</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Vehicles Available */}
      {prerequisitesMet && !isLoading && !error && availableVehicles.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No vehicles available for the selected dates, locations, and class. 
            Try adjusting your selection criteria.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};