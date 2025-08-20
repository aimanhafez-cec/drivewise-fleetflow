import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Car, MapPin, Fuel, Users, CheckCircle, Search, Filter } from 'lucide-react';
import { useAvailableVehicles } from '@/hooks/useAvailableVehicles';
import { useVehicleCategories } from '@/hooks/useVehicles';

interface QuickVehicleSelectorProps {
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  selectedVehicleId?: string;
  onVehicleSelect: (vehicleId: string) => void;
}

const QuickVehicleSelector: React.FC<QuickVehicleSelectorProps> = ({
  pickupDate,
  returnDate,
  pickupLocation,
  selectedVehicleId,
  onVehicleSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const startDate = pickupDate ? new Date(pickupDate) : undefined;
  const endDate = returnDate ? new Date(returnDate) : undefined;

  const { 
    data: availableVehicles = [], 
    isLoading, 
    error 
  } = useAvailableVehicles({
    startDate,
    endDate,
    categoryId: selectedCategory || undefined,
    enabled: !!startDate && !!endDate
  });

  const { data: categories = [] } = useVehicleCategories();

  // Filter vehicles based on search term
  const filteredVehicles = useMemo(() => {
    return availableVehicles.filter(vehicle => {
      const searchMatch = !searchTerm || 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchMatch;
    });
  }, [availableVehicles, searchTerm]);

  // Group vehicles by category
  const vehiclesByCategory = useMemo(() => {
    const grouped = filteredVehicles.reduce((acc, vehicle) => {
      const categoryName = vehicle.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(vehicle);
      return acc;
    }, {} as Record<string, typeof filteredVehicles>);

    return grouped;
  }, [filteredVehicles]);

  if (!startDate || !endDate) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please select pickup and return dates first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Select Your Vehicle
        </CardTitle>
        
        {/* Filters */}
        <div className="items-center">
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-4 px-3 py-2 border rounded-md bg-background w-full"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} {category.description ? `(${category.description})` : ''} 
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">Error loading vehicles: {error.message}</p>
          </div>
        ) : Object.keys(vehiclesByCategory).length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles available for your selected dates</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(vehiclesByCategory).map(([categoryName, vehicles]) => (
              <div key={categoryName}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {categoryName}
                  <Badge variant="outline">{vehicles.length} available</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <Card
                      key={vehicle.id}
                      className={`cursor-pointer transition-all hover:shadow-fleet ${
                        selectedVehicleId === vehicle.id 
                          ? 'ring-2 ring-primary shadow-elegant' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => onVehicleSelect(vehicle.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Vehicle Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-base">
                                {vehicle.make} {vehicle.model}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.year} • {vehicle.license_plate}
                              </p>
                            </div>
                            {selectedVehicleId === vehicle.id && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>

                          {/* Vehicle Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{vehicle.category?.name || 'Standard'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Available at {pickupLocation}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <Badge 
                                variant={vehicle.status === 'available' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {vehicle.status}
                              </Badge>
                              
                              {vehicle.daily_rate && (
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    AED {vehicle.daily_rate}
                                  </p>
                                  <p className="text-xs text-muted-foreground">per day</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection Button */}
                          <Button
                            variant={selectedVehicleId === vehicle.id ? "default" : "outline"}
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVehicleSelect(vehicle.id);
                            }}
                          >
                            {selectedVehicleId === vehicle.id ? 'Selected' : 'Select Vehicle'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {filteredVehicles.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{filteredVehicles.length}</p>
                <p className="text-sm text-muted-foreground">Available Vehicles</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{Object.keys(vehiclesByCategory).length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Math.min(...filteredVehicles.map(v => v.daily_rate || 0).filter(r => r > 0)) || 0}
                </p>
                <p className="text-sm text-muted-foreground">From AED/day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-available">100%</p>
                <p className="text-sm text-muted-foreground">Instant Approval</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickVehicleSelector;