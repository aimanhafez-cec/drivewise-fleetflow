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
  color: string | null;
  item_code: string;
  item_description: string;
  categories?: {
    id: string;
    name: string;
    icon: string;
  };
  _itemCodeMeta?: {
    available_qty: number;
    category_name: string;
    colors: string[];
    item_code: string;
    item_description: string;
  };
}

interface ItemCode {
  key: string;
  item_code: string;
  item_description: string;
  category_id: string;
  category_name: string;
  make: string;
  model: string;
  year: number;
  colors: string[];
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
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedItemCodes, setSelectedItemCodes] = useState<ItemCode[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch vehicles with location
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-quote-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, year, status, category_id, location, color,
          item_code, item_description,
          categories!inner (id, name, icon)
        `)
        .order('item_code');

      if (error) throw error;
      return (data || []) as Vehicle[];
    },
  });

  // Dynamic filter options
  const { classes, makes, models, years, colors } = useMemo(() => {
    const classSet = new Set<string>();
    const makeSet = new Set<string>();
    const modelSet = new Set<string>();
    const yearSet = new Set<number>();
    const colorSet = new Set<string>();

    vehicles.forEach((v) => {
      if (v.categories?.name) classSet.add(v.categories.name);
      makeSet.add(v.make);
      
      if (selectedMake === 'all' || v.make === selectedMake) {
        modelSet.add(v.model);
      }
      
      yearSet.add(v.year);
      if (v.color) colorSet.add(v.color);
    });

    return {
      classes: Array.from(classSet).sort(),
      makes: Array.from(makeSet).sort(),
      models: Array.from(modelSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
      colors: Array.from(colorSet).sort(),
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

      // Use item_code as the key (identical specs = same item_code)
      const key = v.item_code;
      
      if (!itemCodeMap.has(key)) {
        itemCodeMap.set(key, {
          key,
          item_code: v.item_code,
          item_description: v.item_description,
          category_id: v.category_id,
          category_name: v.categories?.name || 'Unknown',
          make: v.make,
          model: v.model,
          year: v.year,
          colors: [],
          available_qty: 0,
          total_qty: 0,
          representative_vehicle_id: v.id,
        });
      }
      
      const itemCode = itemCodeMap.get(key)!;
      itemCode.total_qty++;
      
      // Track unique colors
      if (v.color && !itemCode.colors.includes(v.color)) {
        itemCode.colors.push(v.color);
      }
      
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
        item.make.toLowerCase().includes(searchLower) ||
        item.model.toLowerCase().includes(searchLower) ||
        item.year.toString().includes(searchLower) ||
        item.category_name.toLowerCase().includes(searchLower) ||
        item.item_code.toLowerCase().includes(searchLower) ||
        item.item_description.toLowerCase().includes(searchLower);

      const matchesClass = selectedClass === 'all' || item.category_name === selectedClass;
      const matchesMake = selectedMake === 'all' || item.make === selectedMake;
      const matchesModel = selectedModel === 'all' || item.model === selectedModel;
      const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
      const matchesColor = selectedColor === 'all' || item.colors.includes(selectedColor);
      const matchesAvailability = !showAvailableOnly || item.available_qty > 0;

      return matchesSearch && matchesClass && matchesMake && matchesModel && 
             matchesYear && matchesColor && matchesAvailability;
    });
  }, [itemCodes, searchTerm, selectedClass, selectedMake, selectedModel, selectedYear, selectedColor, showAvailableOnly]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedMake('all');
    setSelectedModel('all');
    setSelectedYear('all');
    setSelectedLocation('all');
    setSelectedColor('all');
    setShowAvailableOnly(false);
  };

  const handleToggleItemCode = (itemCode: ItemCode) => {
    setSelectedItemCodes(prev => {
      const exists = prev.find(ic => ic.key === itemCode.key);
      if (exists) {
        return prev.filter(ic => ic.key !== itemCode.key);
      } else {
        return [...prev, itemCode];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItemCodes([]);
      setSelectAll(false);
    } else {
      setSelectedItemCodes([...filteredItemCodes]);
      setSelectAll(true);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedItemCodes.length > 0) {
      const selectedVehicles = selectedItemCodes.map(itemCode => {
        const representativeVehicle = vehicles.find(
          v => v.id === itemCode.representative_vehicle_id
        );
        
        if (representativeVehicle) {
          return {
            ...representativeVehicle,
            item_code: itemCode.item_code,
            item_description: itemCode.item_description,
            color: itemCode.colors[0] || null,
            _itemCodeMeta: {
              available_qty: itemCode.available_qty,
              category_name: itemCode.category_name,
              colors: itemCode.colors,
              item_code: itemCode.item_code,
              item_description: itemCode.item_description,
            }
          };
        }
        return null;
      }).filter(Boolean);
      
      (onVehicleSelect as any)(selectedVehicles);
      setSelectedItemCodes([]);
      setSelectAll(false);
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Select Vehicle
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Search and filter to find the perfect vehicle for this quote line.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 space-y-1 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5" />
            <Input
              placeholder="Search by vehicle class, make, model, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-0">
            {/* Vehicle Class */}
            <div>
              <Label className="text-[10px]">Vehicle Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-9">
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
            <div>
              <Label className="text-[10px]">Make</Label>
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="h-9">
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
            <div>
              <Label className="text-[10px]">Model</Label>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
                disabled={selectedMake === 'all'}
              >
                <SelectTrigger className="h-9">
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
            <div>
              <Label className="text-[10px]">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9">
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

            {/* Color */}
            <div>
              <Label className="text-[10px]">Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label className="text-[10px]">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-9">
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
            <div>
              <Label className="text-[10px] opacity-0">Filter</Label>
              <Button
                type="button"
                variant={showAvailableOnly ? "default" : "outline"}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className="w-full h-9"
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
            <div>
              <Label className="text-[10px] opacity-0">Actions</Label>
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="w-full h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-[11px] text-muted-foreground bg-muted/30 px-3 py-1 rounded-md inline-block -mt-1">
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
        <div className="flex-1 px-4 pt-1 overflow-auto border-t min-h-0">
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
      <table className="w-full border border-border rounded-lg">
        <thead className="bg-background sticky top-0 z-10 shadow-sm border-b">
          <tr>
            <th className="text-center p-2 text-xs font-semibold w-12">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
            </th>
            <th className="text-left p-2 text-xs font-semibold">Item Code</th>
            <th className="text-left p-2 text-xs font-semibold">Item Description</th>
            <th className="text-left p-2 text-xs font-semibold">Make</th>
            <th className="text-left p-2 text-xs font-semibold">Model</th>
            <th className="text-center p-2 text-xs font-semibold">Year</th>
            <th className="text-center p-2 text-xs font-semibold">Color(s)</th>
            <th className="text-center p-2 text-xs font-semibold">Category</th>
            <th className="text-center p-2 text-xs font-semibold">Available</th>
          </tr>
        </thead>
        <tbody>
          {filteredItemCodes.map((itemCode) => {
            const isSelected = selectedItemCodes.some(ic => ic.key === itemCode.key);
            
            return (
              <tr
                key={itemCode.key}
                className={`border-t cursor-pointer transition-colors hover:bg-muted/50 ${
                  isSelected ? 'bg-primary/10' : ''
                }`}
                onClick={() => handleToggleItemCode(itemCode)}
              >
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleItemCode(itemCode)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="p-2 text-xs font-mono font-semibold text-primary">
                  {itemCode.item_code}
                </td>
                <td className="p-2 text-xs font-medium">
                  {itemCode.item_description}
                </td>
                <td className="p-2 text-xs">{itemCode.make}</td>
                <td className="p-2 text-xs">{itemCode.model}</td>
                <td className="p-2 text-xs text-center">{itemCode.year}</td>
                <td className="p-2 text-xs text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {itemCode.colors.length > 0 ? (
                      itemCode.colors.map(color => (
                        <Badge key={color} variant="outline" className="text-[10px]">
                          {color}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Any</span>
                    )}
                  </div>
                </td>
                <td className="p-2 text-xs text-center">
                  <Badge variant="secondary" className="text-[10px]">
                    {itemCode.category_name}
                  </Badge>
                </td>
                <td className="p-2 text-xs text-center">
                  <Badge
                    variant={itemCode.available_qty > 0 ? "default" : "secondary"}
                    className={itemCode.available_qty > 0 ? "bg-green-600 text-xs" : "text-xs"}
                  >
                    {itemCode.available_qty} / {itemCode.total_qty}
                  </Badge>
                </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </div>

<DialogFooter className="p-4 pt-3 border-t flex-shrink-0">
  <div className="flex items-center justify-between w-full">
    <div className="text-sm text-muted-foreground">
      {selectedItemCodes.length > 0 ? (
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <strong>{selectedItemCodes.length}</strong> vehicle type{selectedItemCodes.length !== 1 ? 's' : ''} selected
        </span>
      ) : (
        'Check rows to select vehicle types'
      )}
    </div>
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setSelectedItemCodes([]);
          setSelectAll(false);
          onOpenChange(false);
        }}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleConfirmSelection}
        disabled={selectedItemCodes.length === 0}
      >
        <Check className="h-4 w-4 mr-2" />
        Add Selected Vehicles ({selectedItemCodes.length})
      </Button>
    </div>
  </div>
</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
