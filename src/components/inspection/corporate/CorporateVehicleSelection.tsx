import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Car, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VehicleOption } from '@/types/inspection';

interface CorporateVehicleSelectionProps {
  vehicleId: string | null;
  vin: string | null;
  onUpdate: (vehicleId: string, vin: string, itemCode: string) => void;
  isEditing?: boolean;
}

export function CorporateVehicleSelection({
  vehicleId,
  vin,
  onUpdate,
  isEditing = false
}: CorporateVehicleSelectionProps) {
  const [searchTerm, setSearchTerm] = useState(vin || '');
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchVehicles(searchTerm);
    } else {
      setVehicleOptions([]);
    }
  }, [searchTerm]);

  const searchVehicles = async (term: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_master' as any)
        .select('vehicle_id, vin, item_code, description')
        .or(`vin.ilike.%${term}%,item_code.ilike.%${term}%`)
        .limit(10);

      if (!error && data) {
        setVehicleOptions(data.map((v: any) => ({
          vehicleId: v.vehicle_id,
          vin: v.vin || '',
          itemCode: v.item_code || '',
          description: v.description || ''
        })));
      }
    } catch (err) {
      console.error('Error searching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle: VehicleOption) => {
    setSelectedVehicle(vehicle);
    setSearchTerm(vehicle.vin);
    setVehicleOptions([]);
    onUpdate(vehicle.vehicleId, vehicle.vin, vehicle.itemCode);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="vehicle-search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Vehicle by VIN or Item Code *
        </Label>
        <Input
          id="vehicle-search"
          placeholder="Enter VIN or Item Code (min 3 characters)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isEditing}
        />
        {isLoading && (
          <p className="text-sm text-muted-foreground">Searching...</p>
        )}
      </div>

      {vehicleOptions.length > 0 && !isEditing && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {vehicleOptions.map((vehicle) => (
            <Card
              key={vehicle.vehicleId}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelectVehicle(vehicle)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{vehicle.vin}</span>
                    <Badge variant="outline">{vehicle.itemCode}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedVehicle && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Vehicle:</p>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="font-semibold">{selectedVehicle.vin}</span>
              <Badge>{selectedVehicle.itemCode}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selectedVehicle.description}</p>
          </div>
        </Card>
      )}

      {isEditing && (
        <div className="rounded-lg border border-muted bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Vehicle cannot be changed when editing an existing inspection.
          </p>
        </div>
      )}
    </div>
  );
}
