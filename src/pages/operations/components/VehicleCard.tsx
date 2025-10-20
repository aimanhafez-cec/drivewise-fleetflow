import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { VehicleWithStatus } from '@/lib/api/vehicle-status';
import { format, parseISO, isBefore, addDays } from 'date-fns';

interface VehicleCardProps {
  vehicle: VehicleWithStatus;
  onViewHistory: (vehicle: VehicleWithStatus) => void;
  onChangeStatus: (vehicle: VehicleWithStatus) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewHistory, onChangeStatus }) => {
  const hasExpiringSoon = () => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    
    return (
      (vehicle.insurance_expiry && isBefore(parseISO(vehicle.insurance_expiry), thirtyDaysFromNow)) ||
      (vehicle.license_expiry && isBefore(parseISO(vehicle.license_expiry), thirtyDaysFromNow))
    );
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {hasExpiringSoon() && (
        <div className="absolute top-2 right-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </div>
      )}
      <CardContent className="p-3 space-y-2">
        <div>
          <div className="font-semibold text-sm">{vehicle.license_plate}</div>
          <div className="text-xs text-muted-foreground">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </div>
          {vehicle.color && (
            <Badge variant="outline" className="text-xs mt-1">
              {vehicle.color}
            </Badge>
          )}
        </div>

        {vehicle.location && (
          <div className="text-xs text-muted-foreground">
            📍 {vehicle.location}
          </div>
        )}

        {vehicle.odometer && (
          <div className="text-xs text-muted-foreground">
            🛞 {vehicle.odometer.toLocaleString()} km
          </div>
        )}

        <div className="flex gap-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onViewHistory(vehicle)}
          >
            <Eye className="h-3 w-3 mr-1" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChangeStatus(vehicle)}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
