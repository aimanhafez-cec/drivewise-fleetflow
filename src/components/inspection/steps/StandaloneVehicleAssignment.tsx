import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVehicles } from '@/hooks/useVehicles';
import { formatVehicleDisplay } from '@/hooks/useVehicles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, CheckCircle } from 'lucide-react';

interface StandaloneVehicleAssignmentProps {
  selectedVehicleId?: string;
  onVehicleSelect: (vehicleId: string) => void;
}

export const StandaloneVehicleAssignment: React.FC<StandaloneVehicleAssignmentProps> = ({
  selectedVehicleId,
  onVehicleSelect
}) => {
  const { data: vehicles } = useVehicles();
  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);

  return (
    <div id="step-vehicle" className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Vehicle Selection</h3>
        <p className="text-card-foreground">
          Choose the vehicle you want to inspect.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedVehicleId || ''}
            onValueChange={onVehicleSelect}
          >
            <SelectTrigger id="select-vehicle" className="text-muted-foreground">
              <SelectValue placeholder="Choose a vehicle..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles?.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {formatVehicleDisplay(vehicle)} - {vehicle.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedVehicle && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Selected Vehicle Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Make/Model:</span>
                  <p>{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <p>{selectedVehicle.year}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">License:</span>
                  <p>{selectedVehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                    {selectedVehicle.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">VIN:</span>
                  <p>{(selectedVehicle as any).vin || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p>{selectedVehicle.category_id || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};