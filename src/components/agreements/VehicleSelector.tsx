import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Car, MapPin, Fuel, Gauge } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from "@/lib/utils";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  category_id: string;
  categories?: {
    name: string;
    icon: string;
  };
}

interface VehicleSelectorProps {
  selectedVehicle: Vehicle | null;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  agreementStartDate: Date;
  agreementEndDate: Date;
  excludeVehicleId?: string;
  categoryFilter?: string;
}

const statusColors = {
  available: 'bg-green-500',
  rented: 'bg-blue-500',
  maintenance: 'bg-yellow-500',
  out_of_service: 'bg-red-500',
};

const statusLabels = {
  available: 'Available',
  rented: 'Rented',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service',
};

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  selectedVehicle,
  onVehicleSelect,
  agreementStartDate,
  agreementEndDate,
  excludeVehicleId,
  categoryFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');

  // Fetch vehicles with availability check
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['available-vehicles', agreementStartDate, agreementEndDate, excludeVehicleId],
    queryFn: async () => {
      // First get all vehicles
      const { data: allVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .eq('status', 'available') // Only show available vehicles
        .order('make', { ascending: true });

      if (vehiclesError) throw vehiclesError;

      // Filter out excluded vehicle if specified
      let filteredVehicles = allVehicles || [];
      if (excludeVehicleId) {
        filteredVehicles = filteredVehicles.filter(v => v.id !== excludeVehicleId);
      }

      // TODO: Add more sophisticated availability checking
      // For now, we just check vehicle status, but in a real system we'd check:
      // - Overlapping reservations/agreements
      // - Maintenance schedules
      // - Location constraints

      return filteredVehicles as Vehicle[];
    },
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      vehicle.category_id === selectedCategory ||
      (!vehicle.category_id && selectedCategory === 'uncategorized');
    
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredVehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Vehicle Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    <div className="font-semibold text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[vehicle.status]} text-white text-xs`}
                  >
                    {statusLabels[vehicle.status]}
                  </Badge>
                </div>

                {/* License Plate and Category */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{vehicle.license_plate}</span>
                  {vehicle.categories && (
                    <Badge variant="outline" className="text-xs">
                      {vehicle.categories.name}
                    </Badge>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{vehicle.location || 'No location'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3 text-muted-foreground" />
                    <span>{vehicle.fuel_level}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-muted-foreground" />
                    <span>{vehicle.odometer?.toLocaleString() || 0} mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Color:</span>
                    <span>{vehicle.color || 'N/A'}</span>
                  </div>
                </div>

                {/* Daily Rate */}
                <div className="text-center pt-2 border-t">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(vehicle.daily_rate || 0)}/day
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Car className="h-8 w-8 mx-auto mb-2" />
          <p>No available vehicles found</p>
          {searchTerm && (
            <p className="text-sm">Try adjusting your search terms</p>
          )}
        </div>
      )}

      {selectedVehicle && (
        <div className="text-sm text-muted-foreground text-center">
          Selected: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.license_plate})
        </div>
      )}
    </div>
  );
};