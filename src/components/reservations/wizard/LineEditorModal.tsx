import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LOVSelect } from '@/components/ui/lov-select';
import { useVehicleClasses, useVehicleOptions, useLocations } from '@/hooks/useBusinessLOVs';
import { useAddonItems } from '@/hooks/useAddonItems';
import { EnhancedDriverPicker } from '@/components/reservation/EnhancedDriverPicker';
import { Car, MapPin, Calendar, Users, Plus, AlertCircle } from 'lucide-react';
import type { ReservationLine } from './ReservationWizardContext';

interface LineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (line: ReservationLine) => void;
  line?: ReservationLine;
  reservationType: 'vehicle_class' | 'make_model' | 'specific_vin' | null;
  defaultDates: {
    checkOutDate: string;
    checkOutTime: string;
    checkInDate: string;
    checkInTime: string;
  };
  defaultLocations: {
    checkOutLocationId: string;
    checkInLocationId: string;
  };
}

export const LineEditorModal: React.FC<LineEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  line,
  reservationType,
  defaultDates,
  defaultLocations,
}) => {
  const [currentTab, setCurrentTab] = useState('vehicle');
  
  // Initialize with line data or defaults
  const [vehicleClassId, setVehicleClassId] = useState(line?.vehicleClassId || '');
  const [vehicleId, setVehicleId] = useState(line?.vehicleId || '');
  const [checkOutDate, setCheckOutDate] = useState(line?.checkOutDate || defaultDates.checkOutDate);
  const [checkOutTime, setCheckOutTime] = useState(line?.checkOutTime || defaultDates.checkOutTime);
  const [checkInDate, setCheckInDate] = useState(line?.checkInDate || defaultDates.checkInDate);
  const [checkInTime, setCheckInTime] = useState(line?.checkInTime || defaultDates.checkInTime);
  const [checkOutLocationId, setCheckOutLocationId] = useState(line?.checkOutLocationId || defaultLocations.checkOutLocationId);
  const [checkInLocationId, setCheckInLocationId] = useState(line?.checkInLocationId || defaultLocations.checkInLocationId);
  const [selectedDrivers, setSelectedDrivers] = useState<any[]>(
    line?.drivers?.map(d => ({ id: d.driverId })) || []
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(line?.selectedAddOns || []);
  const [addOnPrices, setAddOnPrices] = useState<Record<string, number>>(line?.addOnPrices || {});

  const { items: vehicleClasses } = useVehicleClasses();
  const { items: vehicles } = useVehicleOptions({ status: 'available' });
  const { items: locations } = useLocations();
  const { data: addOns } = useAddonItems();

  const handleSave = () => {
    const newLine: ReservationLine = {
      id: line?.id || crypto.randomUUID(),
      lineNo: line?.lineNo || 1,
      vehicleClassId: reservationType === 'vehicle_class' ? vehicleClassId : undefined,
      vehicleId: reservationType === 'specific_vin' ? vehicleId : undefined,
      vehicleData: reservationType === 'vehicle_class' 
        ? vehicleClasses.find(c => c.id === vehicleClassId)
        : reservationType === 'specific_vin'
        ? vehicles.find(v => v.id === vehicleId)
        : undefined,
      drivers: selectedDrivers.map((driver, index) => ({
        driverId: driver.id,
        role: index === 0 ? 'PRIMARY' as const : 'ADDITIONAL' as const,
        fee: index > 0 ? 50 : undefined,
      })),
      checkOutDate,
      checkOutTime,
      checkOutLocationId,
      checkInDate,
      checkInTime,
      checkInLocationId,
      selectedAddOns,
      addOnPrices,
      baseRate: 0, // Will be calculated in pricing step
      lineNet: 0,
      taxValue: 0,
      lineTotal: 0,
    };

    onSave(newLine);
  };

  const handleAddOnToggle = (addOnId: string, price: number) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId));
      const newPrices = { ...addOnPrices };
      delete newPrices[addOnId];
      setAddOnPrices(newPrices);
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
      setAddOnPrices({ ...addOnPrices, [addOnId]: price });
    }
  };

  const isValid = () => {
    if (reservationType === 'vehicle_class') return !!vehicleClassId;
    if (reservationType === 'specific_vin') return !!vehicleId;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {line ? 'Edit' : 'Add'} Reservation Line
          </DialogTitle>
          <DialogDescription>
            Configure vehicle, dates, drivers, and add-ons for this line
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vehicle">
              <Car className="h-4 w-4 mr-2" />
              Vehicle
            </TabsTrigger>
            <TabsTrigger value="dates">
              <Calendar className="h-4 w-4 mr-2" />
              Dates & Locations
            </TabsTrigger>
            <TabsTrigger value="drivers">
              <Users className="h-4 w-4 mr-2" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="addons">
              <Plus className="h-4 w-4 mr-2" />
              Add-ons
            </TabsTrigger>
          </TabsList>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-4">
            {reservationType === 'vehicle_class' && (
              <div className="space-y-2">
                <Label>Vehicle Class <span className="text-destructive">*</span></Label>
                <LOVSelect
                  items={vehicleClasses.map(c => ({ ...c, label: c.name }))}
                  value={vehicleClassId}
                  onChange={(val) => setVehicleClassId(val as string)}
                  placeholder="Select vehicle class"
                />
              </div>
            )}

            {reservationType === 'specific_vin' && (
              <div className="space-y-2">
                <Label>Vehicle <span className="text-destructive">*</span></Label>
                <LOVSelect
                  items={vehicles.map(v => ({ 
                    ...v, 
                    label: `${v.make} ${v.model} (${v.license_plate})` 
                  }))}
                  value={vehicleId}
                  onChange={(val) => setVehicleId(val as string)}
                  placeholder="Select specific vehicle"
                />
              </div>
            )}

            {reservationType === 'make_model' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make/Model selection will be assigned during vehicle handover
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Dates & Locations Tab */}
          <TabsContent value="dates" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Check-Out
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label>Location</Label>
                    <LOVSelect
                      items={locations.map(l => ({ ...l, label: l.name }))}
                      value={checkOutLocationId}
                      onChange={(val) => setCheckOutLocationId(val as string)}
                      placeholder="Select check-out location"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Check-In
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label>Location</Label>
                    <LOVSelect
                      items={locations.map(l => ({ ...l, label: l.name }))}
                      value={checkInLocationId}
                      onChange={(val) => setCheckInLocationId(val as string)}
                      placeholder="Select check-in location"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-4">
            <EnhancedDriverPicker
              selectedDrivers={selectedDrivers}
              onDriversChange={setSelectedDrivers}
            />
            {selectedDrivers.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  At least one driver is recommended for this line
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {addOns?.map((addOn: any) => {
                const isSelected = selectedAddOns.includes(addOn.id);
                return (
                  <Card
                    key={addOn.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleAddOnToggle(addOn.id, addOn.default_unit_price)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{addOn.item_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            AED {addOn.default_unit_price}
                          </p>
                        </div>
                        {isSelected && <Badge>Selected</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid()}>
            {line ? 'Update' : 'Add'} Line
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
