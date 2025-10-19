import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Users, Briefcase, Gauge, CheckCircle, Package } from 'lucide-react';
import { useState } from 'react';

interface VehicleSelectionProps {
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin';
  pickupDate: string;
  returnDate: string;
  selectedVehicleClassId?: string;
  selectedMakeModel?: string;
  selectedVehicleId?: string;
  onSelect: (updates: any) => void;
}

const VehicleSelection = ({
  reservationType,
  pickupDate,
  returnDate,
  selectedVehicleClassId,
  selectedMakeModel,
  selectedVehicleId,
  onSelect,
}: VehicleSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch vehicle classes for "vehicle_class" type
  const { data: vehicleClasses, isLoading: loadingClasses } = useQuery({
    queryKey: ['vehicle-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: reservationType === 'vehicle_class',
  });

  // Fetch vehicles for "make_model" or "specific_vin" types
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles-available', reservationType, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available');

      if (searchTerm) {
        query = query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('make, model');
      
      if (error) throw error;
      return data || [];
    },
    enabled: reservationType === 'make_model' || reservationType === 'specific_vin',
  });

  // Group vehicles by make+model for "make_model" type
  const groupedVehicles = vehicles?.reduce((acc: any, vehicle) => {
    const key = `${vehicle.make} ${vehicle.model}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(vehicle);
    return acc;
  }, {});

  if (reservationType === 'vehicle_class') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Vehicle Class</h2>
          <p className="text-muted-foreground">
            Choose a vehicle category. Any available vehicle in this class will be assigned.
          </p>
        </div>

        {loadingClasses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicleClasses?.map((category) => {
              const isSelected = selectedVehicleClassId === category.id;
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => onSelect({ 
                    vehicleClassId: category.id,
                    vehicleClassName: category.name
                  })}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-[hsl(var(--chart-1))]/10">
                          <Package className="h-6 w-6 text-[hsl(var(--chart-1))]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-foreground">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>5 seats</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>2 bags</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (reservationType === 'make_model') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Make & Model</h2>
          <p className="text-muted-foreground">
            Choose a specific make and model. Any available vehicle of this type will be assigned.
          </p>
        </div>

        <Input
          placeholder="Search make or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loadingVehicles ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groupedVehicles && Object.keys(groupedVehicles).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedVehicles).map(([makeModel, vehicleList]: [string, any]) => {
              const isSelected = selectedMakeModel === makeModel;
              const sample = vehicleList[0];
              
              return (
                <Card
                  key={makeModel}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onSelect({ makeModel })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-[hsl(var(--chart-2))]/10">
                          <Car className="h-6 w-6 text-[hsl(var(--chart-2))]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{makeModel}</h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicleList.length} vehicle{vehicleList.length !== 1 ? 's' : ''} available • {sample.year}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vehicles found</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Specific VIN
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Specific Vehicle</h2>
        <p className="text-muted-foreground">
          Search and select a specific vehicle by license plate or VIN
        </p>
      </div>

      <Input
        placeholder="Search by license plate or VIN..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loadingVehicles ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles && vehicles.length > 0 ? (
        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicleId === vehicle.id;
            
            return (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect({ specificVehicleId: vehicle.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-[hsl(var(--chart-3))]/10">
                        <Car className="h-6 w-6 text-[hsl(var(--chart-3))]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{vehicle.year}</Badge>
                          <Badge variant="outline">{vehicle.license_plate}</Badge>
                          {vehicle.color && (
                            <Badge variant="outline">{vehicle.color}</Badge>
                          )}
                        </div>
                        {vehicle.vin && (
                          <p className="text-xs text-muted-foreground mt-2">
                            VIN: {vehicle.vin}
                          </p>
                        )}
                        {vehicle.odometer && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>{vehicle.odometer.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No vehicles found matching your search' : 'Start typing to search for vehicles'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleSelection;
