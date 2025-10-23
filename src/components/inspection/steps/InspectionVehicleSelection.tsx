import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Check } from 'lucide-react';
import { useSmartVinSearch } from '@/hooks/useInspectionMaster';
import type { InspectionType, VehicleOption } from '@/types/inspection';

interface InspectionVehicleSelectionProps {
  inspectionType: InspectionType | '';
  selectedVehicle: VehicleOption | null;
  onSelect: (vehicle: VehicleOption) => void;
}

export function InspectionVehicleSelection({
  inspectionType,
  selectedVehicle,
  onSelect
}: InspectionVehicleSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading } = useSmartVinSearch(
    searchQuery,
    inspectionType as InspectionType
  );

  if (!inspectionType) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please select an inspection type first
      </div>
    );
  }

  const isRentalType = inspectionType === 'RENTAL_CHECKOUT' || inspectionType === 'RENTAL_CHECKIN';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="vehicle_search">
          {isRentalType ? 'Search Vehicle (VIN, Contract Line, Agreement No., Customer/Driver)' : 'Search by VIN'}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="vehicle_search"
            placeholder={isRentalType ? "Enter VIN, item code, agreement no, or driver name..." : "Enter VIN..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {isRentalType && (
          <p className="text-sm text-muted-foreground">
            Only vehicles with status='assigned' and customer_accepted agreements will appear
          </p>
        )}
      </div>

      {selectedVehicle && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <p className="font-medium">Selected Vehicle</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">VIN:</span> {selectedVehicle.vin}</p>
                  <p><span className="font-medium">Item Code:</span> {selectedVehicle.itemCode}</p>
                  <p><span className="font-medium">Description:</span> {selectedVehicle.description}</p>
                  {selectedVehicle.agreementNo && (
                    <p><span className="font-medium">Agreement:</span> {selectedVehicle.agreementNo}</p>
                  )}
                  {selectedVehicle.driverName && (
                    <p><span className="font-medium">Driver:</span> {selectedVehicle.driverName}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {searchQuery.length >= 2 && !selectedVehicle && (
        <div className="space-y-2">
          <Label>Search Results</Label>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Searching...</div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((vehicle) => (
                <Card
                  key={vehicle.vehicleId}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(vehicle)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{vehicle.itemCode}</p>
                        {vehicle.agreementNo && (
                          <Badge variant="outline">{vehicle.agreementNo}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{vehicle.description}</p>
                      <p className="text-xs text-muted-foreground">VIN: {vehicle.vin}</p>
                      {vehicle.driverName && (
                        <p className="text-xs text-muted-foreground">Driver: {vehicle.driverName}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vehicles found matching your search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
