import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Car, Package, Hash, Search, Check } from 'lucide-react';
import { useReservationWizard } from './ReservationWizardContext';

export const Step4SmartVehicleSelection: React.FC = () => {
  const { wizardData, updateWizardData } = useReservationWizard();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch vehicle classes
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
    enabled: wizardData.reservationType === 'vehicle_class',
  });

  // Fetch vehicles grouped by make/model
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available');

      if (searchTerm) {
        query = query.or(
          `make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order('make, model');
      if (error) throw error;
      return data || [];
    },
    enabled:
      wizardData.reservationType === 'make_model' ||
      wizardData.reservationType === 'specific_vin',
  });

  // Group vehicles by make and model for make_model type
  const makeModelOptions =
    vehicles?.reduce((acc: Record<string, any[]>, vehicle) => {
      const key = `${vehicle.make} ${vehicle.model}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(vehicle);
      return acc;
    }, {}) || {};

  const handleVehicleClassSelect = (classId: string) => {
    const selectedClass = vehicleClasses?.find((c) => c.id === classId);
    updateWizardData({
      vehicleClassId: classId,
      vehicleData: selectedClass,
    });
  };

  const handleMakeModelSelect = (makeModel: string) => {
    updateWizardData({
      makeModel,
      vehicleData: makeModelOptions[makeModel],
    });
  };

  const handleSpecificVehicleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles?.find((v) => v.id === vehicleId);
    updateWizardData({
      vehicleId,
      vehicleData: selectedVehicle,
    });
  };

  if (loadingClasses || loadingVehicles) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {wizardData.reservationType === 'vehicle_class' && 'Select Vehicle Class'}
          {wizardData.reservationType === 'make_model' && 'Select Make & Model'}
          {wizardData.reservationType === 'specific_vin' && 'Select Specific Vehicle'}
        </h2>
        <p className="text-muted-foreground">
          {wizardData.reservationType === 'vehicle_class' &&
            'Choose the vehicle category for this reservation'}
          {wizardData.reservationType === 'make_model' &&
            'Select the make and model combination'}
          {wizardData.reservationType === 'specific_vin' &&
            'Choose a specific vehicle by VIN or license plate'}
        </p>
      </div>

      {/* Vehicle Class Selection */}
      {wizardData.reservationType === 'vehicle_class' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicleClasses?.map((vehicleClass) => (
            <Card
              key={vehicleClass.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                wizardData.vehicleClassId === vehicleClass.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : ''
              }`}
              onClick={() => handleVehicleClassSelect(vehicleClass.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  {wizardData.vehicleClassId === vehicleClass.id && (
                    <Check className="h-6 w-6 text-primary" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{vehicleClass.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {vehicleClass.description || 'No description'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Make + Model Selection */}
      {wizardData.reservationType === 'make_model' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search make or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(makeModelOptions).map(([makeModel, vehicleList]) => (
              <Card
                key={makeModel}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  wizardData.makeModel === makeModel
                    ? 'ring-2 ring-primary shadow-lg'
                    : ''
                }`}
                onClick={() => handleMakeModelSelect(makeModel)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{makeModel}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {vehicleList.length} available
                        </Badge>
                      </div>
                    </div>
                    {wizardData.makeModel === makeModel && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Specific VIN Selection */}
      {wizardData.reservationType === 'specific_vin' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by VIN, license plate, make, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {vehicles?.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  wizardData.vehicleId === vehicle.id
                    ? 'ring-2 ring-primary shadow-lg'
                    : ''
                }`}
                onClick={() => handleSpecificVehicleSelect(vehicle.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Hash className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            Plate: {vehicle.license_plate}
                          </Badge>
                          <Badge variant="outline">VIN: {vehicle.vin}</Badge>
                          <Badge
                            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            {vehicle.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {wizardData.vehicleId === vehicle.id && (
                      <Check className="h-5 w-5 text-primary shrink-0 ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* No Results */}
      {((wizardData.reservationType === 'make_model' &&
        Object.keys(makeModelOptions).length === 0) ||
        (wizardData.reservationType === 'specific_vin' &&
          vehicles?.length === 0)) && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No vehicles found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
