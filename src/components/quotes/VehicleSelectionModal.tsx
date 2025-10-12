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
  status: string;
  category_id: string;
  location: string | null;
  categories?: {
    id: string;
    name: string;
    icon: string;
  };
  _itemCodeMeta?: {
    available_qty: number;
    category_name: string;
  };
}

interface ItemCode {
  key: string;
  category_id: string;
  category_name: string;
  make: string;
  model: string;
  year: number;
  available_qty: number;
  total_qty: number;
  representative_vehicle_id: string;
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
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [tempSelectedItemCode, setTempSelectedItemCode] = useState<ItemCode | null>(null);

  // Fetch vehicles with location
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-quote-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, year, status, category_id, location,
          categories!inner (id, name, icon)
        `)
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

  // Extract unique locations
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.location) locationSet.add(v.location);
    });
    return Array.from(locationSet).sort();
  }, [vehicles]);

  // Aggregate vehicles into item codes
  const itemCodes = useMemo(() => {
    const itemCodeMap = new Map<string, ItemCode>();
    
    vehicles.forEach((v) => {
      if (selectedLocation !== 'all' && v.location !== selectedLocation) {
        return;
      }

      const key = `${v.category_id}|${v.make}|${v.model}|${v.year}`;
      
      if (!itemCodeMap.has(key)) {
        itemCodeMap.set(key, {
          key,
          category_id: v.category_id,
          category_name: v.categories?.name || 'Unknown',
          make: v.make,
          model: v.model,
          year: v.year,
          available_qty: 0,
          total_qty: 0,
          representative_vehicle_id: v.id,
        });
      }
      
      const itemCode = itemCodeMap.get(key)!;
      itemCode.total_qty++;
      
      if (v.status === 'available') {
        itemCode.available_qty++;
      }
    });
    
    return Array.from(itemCodeMap.values());
  }, [vehicles, selectedLocation]);

  // Filter item codes based on search, filters, and "show available only"
  const filteredItemCodes = useMemo(() => {
    return itemCodes.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.make.toLowerCase().includes(searchLower) ||
        item.model.toLowerCase().includes(searchLower) ||
        item.year.toString().includes(searchLower) ||
        item.category_name.toLowerCase().includes(searchLower);

      const matchesClass = selectedClass === 'all' || item.category_name === selectedClass;
      const matchesMake = selectedMake === 'all' || item.make === selectedMake;
      const matchesModel = selectedModel === 'all' || item.model === selectedModel;
      const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
      const matchesAvailability = !showAvailableOnly || item.available_qty > 0;

      return matchesSearch && matchesClass && matchesMake && matchesModel && matchesYear && matchesAvailability;
    });
  }, [itemCodes, searchTerm, selectedClass, selectedMake, selectedModel, selectedYear, showAvailableOnly]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedMake('all');
    setSelectedModel('all');
    setSelectedYear('all');
    setSelectedLocation('all');
    setShowAvailableOnly(false);
  };

  // Handle item code selection
  const handleSelect = () => {
    if (tempSelectedItemCode) {
      const representativeVehicle = vehicles.find(
        v => v.id === tempSelectedItemCode.representative_vehicle_id
      );
      
      if (representativeVehicle) {
        onVehicleSelect({
          ...representativeVehicle,
          _itemCodeMeta: {
            available_qty: tempSelectedItemCode.available_qty,
            category_name: tempSelectedItemCode.category_name,
          }
        });
      }
      
      setTempSelectedItemCode(null);
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
              placeholder="Search by vehicle class, make, model, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
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

            {/* Location */}
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show Available Only Toggle */}
            <div className="space-y-1">
              <Label className="text-xs">&nbsp;</Label>
              <Button
                type="button"
                variant={showAvailableOnly ? "default" : "outline"}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className="w-full"
              >
                {showAvailableOnly ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Available Only
                  </>
                ) : (
                  <>Show Available</>
                )}
              </Button>
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
              `Found ${filteredItemCodes.length} vehicle type${
                filteredItemCodes.length !== 1 ? 's' : ''
              }`
            )}
          </div>
        </div>

        {/* Vehicle Table */}
        <ScrollArea className="h-96 px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredItemCodes.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No vehicle types found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Vehicle Class</th>
                    <th className="text-left p-3 text-sm font-semibold">Make</th>
                    <th className="text-left p-3 text-sm font-semibold">Model</th>
                    <th className="text-center p-3 text-sm font-semibold">Year</th>
                    <th className="text-center p-3 text-sm font-semibold">Available Qty</th>
                    <th className="text-center p-3 text-sm font-semibold w-32">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItemCodes.map((itemCode) => {
                    const isSelected = tempSelectedItemCode?.key === itemCode.key;
                    
                    return (
                      <tr
                        key={itemCode.key}
                        className={`border-t cursor-pointer transition-colors hover:bg-muted/50 ${
                          isSelected ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setTempSelectedItemCode(itemCode)}
                      >
                        <td className="p-3">
                          <Badge variant="outline">{itemCode.category_name}</Badge>
                        </td>
                        <td className="p-3 font-medium">{itemCode.make}</td>
                        <td className="p-3">{itemCode.model}</td>
                        <td className="p-3 text-center">{itemCode.year}</td>
                        <td className="p-3 text-center">
                          <Badge
                            variant={itemCode.available_qty > 0 ? "default" : "secondary"}
                            className={itemCode.available_qty > 0 ? "bg-green-600" : ""}
                          >
                            {itemCode.available_qty} / {itemCode.total_qty}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempSelectedItemCode(itemCode);
                            }}
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </>
                            ) : (
                              'Select'
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {tempSelectedItemCode ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Selected: {tempSelectedItemCode.make} {tempSelectedItemCode.model} {tempSelectedItemCode.year}
                  <Badge variant="outline" className="ml-2">
                    {tempSelectedItemCode.available_qty} available
                  </Badge>
                </span>
              ) : (
                'Click a row to select a vehicle type'
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTempSelectedItemCode(null);
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSelect}
                disabled={!tempSelectedItemCode}
              >
                <Check className="h-4 w-4 mr-2" />
                Select Vehicle Type
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
