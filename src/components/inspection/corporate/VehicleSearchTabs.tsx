import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { AgreementSelect } from '@/components/shared/selects/AgreementSelect';
import { ContractLineSelect } from '@/components/shared/selects/ContractLineSelect';
import { useAvailableVins } from '@/hooks/useCorporateVinAssignment';

interface VehicleSearchTabsProps {
  inspectionType: string;
  vehicleId: string | null;
  vin: string | null;
  itemCode: string | null;
  agreementId: string | null;
  lineNo: number | null;
  onUpdate: (data: {
    vehicleId: string;
    vin: string;
    itemCode: string;
    agreementId?: string;
    lineNo?: number;
  }) => void;
  isEditing?: boolean;
}

interface Vehicle {
  id: string;
  vin: string;
  item_code: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
}

export function VehicleSearchTabs({
  inspectionType,
  vehicleId,
  vin,
  itemCode,
  agreementId,
  lineNo,
  onUpdate,
  isEditing = false,
}: VehicleSearchTabsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(agreementId);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [selectedVinFromList, setSelectedVinFromList] = useState<string | null>(null);

  // Tab 1: Search by VIN/Item Code
  const statusFilter = inspectionType === 'RENTAL_CHECKOUT' ? 'available' : 'rented';

  const { data: vehicleResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['vehicle-search', searchTerm, statusFilter],
    queryFn: async () => {
      if (searchTerm.length < 3) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vin, item_code, make, model, year, license_plate, status')
        .eq('status', statusFilter)
        .or(`vin.ilike.%${searchTerm}%,item_code.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%`)
        .range(0, 9)
        .order('vin');

      if (error) throw error;
      return (data || []) as Vehicle[];
    },
    enabled: searchTerm.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  // Tab 2: Available VINs for selected line
  const { data: availableVins = [] } = useAvailableVins(
    selectedLine?.itemCode || '',
    !!selectedLine?.itemCode
  );

  const handleSelectFromSearch = (vehicle: Vehicle) => {
    onUpdate({
      vehicleId: vehicle.id,
      vin: vehicle.vin,
      itemCode: vehicle.item_code,
    });
    setSearchTerm('');
  };

  const handleAgreementChange = (id: string) => {
    setSelectedAgreementId(id);
    setSelectedLine(null);
    setSelectedVinFromList(null);
  };

  const handleLineChange = (line: any) => {
    setSelectedLine(line);
    setSelectedVinFromList(null);
  };

  const handleVinSelect = (vinId: string) => {
    const selectedVehicle = availableVins.find((v) => v.id === vinId);
    if (selectedVehicle && selectedLine) {
      setSelectedVinFromList(vinId);
      onUpdate({
        vehicleId: selectedVehicle.id,
        vin: selectedVehicle.vin,
        itemCode: selectedLine.itemCode,
        agreementId: selectedLine.agreementId,
        lineNo: selectedLine.lineNo,
      });
    }
  };

  if (isEditing) {
    return (
      <Card className="p-4 bg-muted/30">
        <div className="space-y-2">
          <p className="font-medium">Selected Vehicle:</p>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="font-semibold">{vin || 'N/A'}</span>
            {itemCode && <Badge>{itemCode}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Vehicle cannot be changed when editing an existing inspection.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search by VIN/Item Code</TabsTrigger>
        <TabsTrigger value="agreement">By Agreement + Line</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Vehicle *
          </Label>
          <Input
            id="vehicle-search"
            placeholder="Enter VIN, Item Code, or License Plate (min 3 characters)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && <p className="text-sm text-muted-foreground">Searching...</p>}
        </div>

        {vehicleResults.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {vehicleResults.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="p-4 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSelectFromSearch(vehicle)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{vehicle.vin}</span>
                      <Badge variant="outline">{vehicle.item_code}</Badge>
                      <Badge variant="secondary">{vehicle.license_plate}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {vehicleId && vin && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Vehicle:</p>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <span className="font-semibold">{vin}</span>
                {itemCode && <Badge>{itemCode}</Badge>}
              </div>
            </div>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="agreement" className="space-y-4">
        <AgreementSelect
          value={selectedAgreementId}
          onChange={handleAgreementChange}
          required
        />

        {selectedAgreementId && (
          <ContractLineSelect
            agreementId={selectedAgreementId}
            value={selectedLine?.lineNo || null}
            inspectionType={inspectionType}
            onChange={handleLineChange}
            required
          />
        )}

        {selectedLine && availableVins.length > 0 && (
          <div className="space-y-2">
            <Label>Available VINs for {selectedLine.itemCode} *</Label>
            <RadioGroup value={selectedVinFromList || ''} onValueChange={handleVinSelect}>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableVins.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={vehicle.id} id={vehicle.id} />
                      <Label htmlFor={vehicle.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{vehicle.vin}</span>
                          <Badge variant="outline">{vehicle.license_plate}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </span>
                          <Badge variant="secondary">{vehicle.odometer} km</Badge>
                        </div>
                      </Label>
                    </div>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {selectedLine && availableVins.length === 0 && (
          <Card className="p-4 bg-muted">
            <p className="text-sm text-muted-foreground">
              No available vehicles found for item code: {selectedLine.itemCode}
            </p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
