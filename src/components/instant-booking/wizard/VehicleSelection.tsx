import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Users, Briefcase, Gauge, CheckCircle, Package, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface VehicleSelectionProps {
  reservationType: 'vehicle_class' | 'specific_vehicle';
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

  // Fetch vehicle classes for "vehicle_class" type with availability count
  const { data: vehicleClasses, isLoading: loadingClasses } = useQuery({
    queryKey: ['vehicle-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*, vehicles(id, status)')
        .order('name');
      
      if (error) throw error;
      
      // Add availability count to each class
      return (data || []).map(category => ({
        ...category,
        availableCount: category.vehicles?.filter((v: any) => v.status === 'available').length || 0,
      }));
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
    enabled: reservationType === 'specific_vehicle',
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
    // Quick select for first vehicle class (and auto-assign first vehicle for instant booking)
    const handleQuickSelect = () => {
      if (vehicleClasses && vehicleClasses.length > 0) {
        const firstClass = vehicleClasses[0];
        const firstAvailableVehicle = firstClass.vehicles?.find((v: any) => v.status === 'available');
        
        onSelect({ 
          vehicleClassId: firstClass.id,
          vehicleClassName: firstClass.name,
          // Auto-assign first available vehicle for instant booking
          specificVehicleId: firstAvailableVehicle?.id,
        });
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Select Vehicle Class</h2>
            <p className="text-muted-foreground">
              Choose a vehicle category. The first available vehicle from this class will be automatically assigned.
            </p>
          </div>
          {!selectedVehicleClassId && vehicleClasses && vehicleClasses.length > 0 && (
            <Button 
              onClick={handleQuickSelect}
              variant="outline"
              className="gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800"
            >
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Quick Select First
            </Button>
          )}
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
              const availableCount = category.availableCount || 0;
              const isLowAvailability = availableCount > 0 && availableCount <= 3;
              
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  } ${availableCount === 0 ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (availableCount > 0) {
                      const firstAvailableVehicle = category.vehicles?.find((v: any) => v.status === 'available');
                      onSelect({ 
                        vehicleClassId: category.id,
                        vehicleClassName: category.name,
                        // Auto-assign first available vehicle for instant booking
                        specificVehicleId: firstAvailableVehicle?.id,
                      });
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-3 rounded-lg bg-[hsl(var(--chart-1))]/10">
                          <Package className="h-6 w-6 text-[hsl(var(--chart-1))]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-foreground">
                              {category.name}
                            </h3>
                            {isLowAvailability && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={availableCount > 3 ? 'outline' : availableCount > 0 ? 'secondary' : 'destructive'} className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {availableCount} available
                            </Badge>
                          </div>
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

  // Unified Vehicle Search - Search by make, model, VIN, or license plate
  // Quick select for first vehicle
  const handleQuickSelectVehicle = () => {
    if (vehicles && vehicles.length > 0) {
      const firstVehicle = vehicles[0];
      const firstMakeModel = `${firstVehicle.make} ${firstVehicle.model}`;
      onSelect({ 
        specificVehicleId: firstVehicle.id,
        makeModel: firstMakeModel
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Search & Select Vehicle</h2>
          <p className="text-muted-foreground">
            Search by make, model, VIN, or license plate. Select any available vehicle for this booking.
          </p>
        </div>
        {(!selectedVehicleId && !selectedMakeModel) && vehicles && vehicles.length > 0 && (
          <Button 
            onClick={handleQuickSelectVehicle}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800"
          >
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Quick Select First
          </Button>
        )}
      </div>

      <Input
        placeholder="Search by make, model, VIN, or license plate..."
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
            const makeModel = `${vehicle.make} ${vehicle.model}`;
            const isSelected = selectedVehicleId === vehicle.id || selectedMakeModel === makeModel;
            
            return (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect({ 
                  specificVehicleId: vehicle.id,
                  makeModel: makeModel
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-[hsl(var(--chart-2))]/10">
                        <Car className="h-6 w-6 text-[hsl(var(--chart-2))]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <Badge variant="outline" className="text-xs">{vehicle.year}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="font-mono">
                            {vehicle.license_plate}
                          </Badge>
                          {vehicle.color && (
                            <Badge variant="outline">{vehicle.color}</Badge>
                          )}
                        </div>
                        {vehicle.vin && (
                          <p className="text-xs text-muted-foreground mt-2 font-mono">
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
