import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car, MapPin, Fuel, Users, CheckCircle, Search, Filter, Calendar, Shield, Settings } from 'lucide-react';
import { useAvailableVehicles } from '@/hooks/useAvailableVehicles';
import { useVehicleCategories } from '@/hooks/useVehicles';
import nissanVersaImage from '@/assets/nissan-versa.jpg';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

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
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setIsModalOpen(true);
                      }}
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
                            
                            {(vehicle as any).color && (
                              <div className="flex items-center gap-2 text-sm">
                                <div 
                                  className="w-4 h-4 rounded-full border border-border" 
                                  style={{ backgroundColor: (vehicle as any).color.toLowerCase() }}
                                />
                                <span className="capitalize">{(vehicle as any).color}</span>
                              </div>
                            )}
                            
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

      {/* Vehicle Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {selectedVehicle?.make} {selectedVehicle?.model}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Image */}
              {selectedVehicle.make?.toLowerCase() === 'nissan' && selectedVehicle.model?.toLowerCase().includes('versa') ? (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img 
                    src={nissanVersaImage} 
                    alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                  <Car className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Vehicle Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Make:</span>
                      <span className="font-medium">{selectedVehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{selectedVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">{selectedVehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License Plate:</span>
                      <span className="font-medium">{selectedVehicle.license_plate}</span>
                    </div>
                    {(selectedVehicle as any).color && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Color:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: (selectedVehicle as any).color.toLowerCase() }}
                          />
                          <span className="font-medium capitalize">{(selectedVehicle as any).color}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{selectedVehicle.category?.name || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Rental Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <span className="font-bold text-primary">AED {selectedVehicle.daily_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedVehicle.status === 'available' ? 'default' : 'secondary'}>
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{pickupLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Vehicle Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Fuel Efficient</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">5 Passengers</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Full Insurance</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Available Now</span>
                  </div>
                </div>
              </div>

              {/* Rental Period Summary */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Rental Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Pickup Date:</span>
                    <span>{new Date(pickupDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Date:</span>
                    <span>{new Date(returnDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Days:</span>
                    <span>
                      {Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                    <span>Estimated Total:</span>
                    <span className="text-primary">
                      AED {(selectedVehicle.daily_rate * Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    onVehicleSelect(selectedVehicle.id);
                    setIsModalOpen(false);
                  }}
                >
                  {selectedVehicleId === selectedVehicle.id ? 'Selected' : 'Select This Vehicle'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuickVehicleSelector;