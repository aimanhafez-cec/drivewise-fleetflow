import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Car, MapPin, Fuel, Gauge } from 'lucide-react';
import VehicleForm from '@/components/vehicles/VehicleForm';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  odometer: number;
  fuel_level: number;
  location: string;
  transmission: string;
  engine_size: string;
  features: string[];
  category_id: string;
  subtype: string;
  ownership_type: string;
  categories?: {
    name: string;
    icon: string;
  };
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

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          categories (
            name,
            icon
          )
        `)
        .order('make', { ascending: true });

      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredVehicles = vehicles?.filter(vehicle => 
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedVehicle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
            </DialogHeader>
            <VehicleForm
              vehicle={selectedVehicle}
              onSuccess={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${statusColors[vehicle.status]} text-white`}
                >
                  {statusLabels[vehicle.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.location || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.fuel_level}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.odometer?.toLocaleString() || 0} mi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Color:</span>
                  <span>{vehicle.color || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Daily Rate</div>
                <div className="text-2xl font-bold text-primary">
                  ${vehicle.daily_rate || 0}/day
                </div>
              </div>

              {vehicle.features && vehicle.features.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Features</div>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{vehicle.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first vehicle.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Vehicles;