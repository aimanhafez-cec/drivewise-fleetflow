import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Car, X, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string;
  odometer: number;
  status: string;
  daily_rate: number;
  monthly_rate: number;
  category_id: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
  };
}

interface VehicleSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleSelect: (vehicle: Vehicle) => void;
  selectedVehicleId?: string;
  quoteStartDate?: string;
  quoteEndDate?: string;
}

export const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
  open,
  onOpenChange,
  onVehicleSelect,
  selectedVehicleId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [tempSelectedVehicle, setTempSelectedVehicle] = useState<Vehicle | null>(null);

  // Fetch vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-quote-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, year, license_plate, vin, odometer,
          status, daily_rate, monthly_rate, category_id,
          categories!inner (id, name, icon)
        `)
        .eq('status', 'available')
        .order('make, model, year');

      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });

  // Dynamic filter options
  const { classes, makes, models, years } = useMemo(() => {
    const classSet = new Set<string>();
    const makeSet = new Set<string>();
    const modelSet = new Set<string>();
    const yearSet = new Set<number>();

    vehicles.forEach((v) => {
      if (v.categories?.name) classSet.add(v.categories.name);
      makeSet.add(v.make);
      
      // Filter models by selected make
      if (selectedMake === 'all' || v.make === selectedMake) {
        modelSet.add(v.model);
      }
      
      yearSet.add(v.year);
    });

    return {
      classes: Array.from(classSet).sort(),
      makes: Array.from(makeSet).sort(),
      models: Array.from(modelSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
    };
  }, [vehicles, selectedMake]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        v.make.toLowerCase().includes(searchLower) ||
        v.model.toLowerCase().includes(searchLower) ||
        v.year.toString().includes(searchLower) ||
        v.license_plate.toLowerCase().includes(searchLower);

      // Class filter
      const matchesClass =
        selectedClass === 'all' || v.categories?.name === selectedClass;

      // Make filter
      const matchesMake = selectedMake === 'all' || v.make === selectedMake;

      // Model filter
      const matchesModel = selectedModel === 'all' || v.model === selectedModel;

      // Year filter
      const matchesYear =
        selectedYear === 'all' || v.year.toString() === selectedYear;

      return (
        matchesSearch &&
        matchesClass &&
        matchesMake &&
        matchesModel &&
        matchesYear
      );
    });
  }, [vehicles, searchTerm, selectedClass, selectedMake, selectedModel, selectedYear]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedMake('all');
    setSelectedModel('all');
    setSelectedYear('all');
  };

  // Handle vehicle selection
  const handleSelect = () => {
    if (tempSelectedVehicle) {
      onVehicleSelect(tempSelectedVehicle);
      setTempSelectedVehicle(null);
      onOpenChange(false);
    }
  };

  // Reset model when make changes
  useEffect(() => {
    if (selectedMake !== 'all') {
      setSelectedModel('all');
    }
  }, [selectedMake]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Select Vehicle
          </DialogTitle>
          <DialogDescription>
            Search and filter to find the perfect vehicle for this quote line.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by make, model, year, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Vehicle Class */}
            <div className="space-y-1">
              <Label className="text-xs">Vehicle Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Make */}
            <div className="space-y-1">
              <Label className="text-xs">Make</Label>
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger>
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div className="space-y-1">
              <Label className="text-xs">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={selectedMake === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="space-y-1">
              <Label className="text-xs">&nbsp;</Label>
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading vehicles...'
            ) : (
              `Found ${filteredVehicles.length} vehicle${
                filteredVehicles.length !== 1 ? 's' : ''
              }`
            )}
          </div>
        </div>

        {/* Vehicle Grid */}
        <ScrollArea className="h-96 px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No vehicles found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {filteredVehicles.map((vehicle) => {
                const isSelected = tempSelectedVehicle?.id === vehicle.id;
                const wasOriginallySelected = selectedVehicleId === vehicle.id;

                return (
                  <Card
                    key={vehicle.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-primary bg-primary/5'
                        : wasOriginallySelected
                        ? 'ring-1 ring-primary/50'
                        : ''
                    }`}
                    onClick={() => setTempSelectedVehicle(vehicle)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <div className="font-semibold text-sm">
                              {vehicle.year} {vehicle.make}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                          {wasOriginallySelected && !isSelected && (
                            <Badge variant="outline">Current</Badge>
                          )}
                        </div>

                        {/* Model */}
                        <div className="font-medium text-base">{vehicle.model}</div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">License:</span>
                            <div className="font-medium">{vehicle.license_plate}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <div className="font-medium">
                              {vehicle.categories?.name || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Odometer:</span>
                            <div className="font-medium">
                              {vehicle.odometer?.toLocaleString() || 0} km
                            </div>
                          </div>
                        </div>

                        {/* Rate */}
                        <div className="pt-2 border-t text-center">
                          <div className="text-sm text-muted-foreground">Monthly Rate</div>
                          <div className="text-lg font-bold text-primary">
                            {vehicle.monthly_rate?.toFixed(2) || 0} AED
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {tempSelectedVehicle ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Selected: {tempSelectedVehicle.year} {tempSelectedVehicle.make}{' '}
                  {tempSelectedVehicle.model}
                </span>
              ) : (
                'Click a vehicle to select'
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTempSelectedVehicle(null);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSelect}
                disabled={!tempSelectedVehicle}
              >
                <Check className="h-4 w-4 mr-2" />
                Select Vehicle
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
