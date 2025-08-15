import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { exchangeAPI } from '@/lib/api/operations';
import { toast } from 'sonner';

interface VehicleExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  line: any;
  agreementStartDate: Date;
  agreementEndDate: Date;
}

export const VehicleExchangeModal: React.FC<VehicleExchangeModalProps> = ({
  open,
  onOpenChange,
  agreementId,
  line,
  agreementStartDate,
  agreementEndDate
}) => {
  const [formData, setFormData] = useState({
    exchangeAt: new Date(),
    returnToLocation: '',
    newOutLocation: '',
    odometerInOld: '',
    fuelInOld: '',
    newVehicleClass: '',
    newVehicle: '',
    odometerOutNew: '',
    fuelOutNew: '',
    copyDrivers: true,
    notes: '',
    exchangeFee: '0'
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const queryClient = useQueryClient();

  const { data: availableVehicles } = useQuery({
    queryKey: ['available-vehicles', formData.newVehicleClass, formData.exchangeAt],
    queryFn: async () => {
      if (!formData.newVehicleClass) return [];
      
      // Mock data - in real app would check availability
      return [
        { id: 'vehicle-1', make: 'Toyota', model: 'Camry', license_plate: 'ABC123', year: 2024 },
        { id: 'vehicle-2', make: 'Honda', model: 'Accord', license_plate: 'XYZ789', year: 2024 },
        { id: 'vehicle-3', make: 'Nissan', model: 'Altima', license_plate: 'DEF456', year: 2024 },
      ];
    },
    enabled: !!formData.newVehicleClass
  });

  const exchangeMutation = useMutation({
    mutationFn: async (exchangeData: any) => {
      return await exchangeAPI.createVehicleExchange(exchangeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreement', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['agreement-lines', agreementId] });
      toast.success('Vehicle exchange completed successfully');
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to complete vehicle exchange: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      exchangeAt: new Date(),
      returnToLocation: '',
      newOutLocation: '',
      odometerInOld: '',
      fuelInOld: '',
      newVehicleClass: '',
      newVehicle: '',
      odometerOutNew: '',
      fuelOutNew: '',
      copyDrivers: true,
      notes: '',
      exchangeFee: '0'
    });
  };

  const handleSubmit = async () => {
    const exchangeData = {
      agreement_id: agreementId,
      line_id: line.id,
      exchange_at: formData.exchangeAt.toISOString(),
      old_vehicle_id: line.vehicle_id,
      new_vehicle_id: formData.newVehicle,
      return_to_location_id: formData.returnToLocation,
      new_out_location_id: formData.newOutLocation,
      odometer_in_old: parseInt(formData.odometerInOld),
      fuel_in_old: parseInt(formData.fuelInOld),
      odometer_out_new: parseInt(formData.odometerOutNew),
      fuel_out_new: parseInt(formData.fuelOutNew),
      fees_added: formData.exchangeFee ? [{ name: 'Exchange Fee', amount: parseFloat(formData.exchangeFee) }] : [],
      segment_a: {
        outAt: line.check_out_at,
        inAt: formData.exchangeAt.toISOString(),
        lineNet: 0, // Would be calculated
        tax: 0,
        total: 0
      },
      segment_b: {
        outAt: formData.exchangeAt.toISOString(),
        inAt: line.check_in_at,
        lineNet: 0, // Would be calculated
        tax: 0,
        total: 0
      },
      notes: formData.notes,
      created_by: (await supabase.auth.getUser()).data.user?.id
    };

    await exchangeMutation.mutateAsync(exchangeData);
  };

  const isFormValid = () => {
    return (
      formData.exchangeAt &&
      formData.returnToLocation &&
      formData.newOutLocation &&
      formData.odometerInOld &&
      formData.fuelInOld &&
      formData.newVehicle &&
      formData.odometerOutNew &&
      formData.fuelOutNew
    );
  };

  const isExchangeDateValid = () => {
    return formData.exchangeAt >= agreementStartDate && formData.exchangeAt <= agreementEndDate;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="modal-exchange" className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vehicle Exchange</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Fields marked * are required.</p>

          {/* Exchange Date & Time */}
          <div className="space-y-2">
            <Label>Exchange Date & Time *</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.exchangeAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.exchangeAt, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.exchangeAt}
                  onSelect={(date) => {
                    if (date) {
                      setFormData(prev => ({ ...prev, exchangeAt: date }));
                      setShowCalendar(false);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {!isExchangeDateValid() && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Exchange date must be within the agreement period
              </div>
            )}
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="returnToLocation">Return Old Vehicle To *</Label>
              <Select value={formData.returnToLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, returnToLocation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Location</SelectItem>
                  <SelectItem value="airport">Airport</SelectItem>
                  <SelectItem value="downtown">Downtown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newOutLocation">Pick Up New Vehicle From *</Label>
              <Select value={formData.newOutLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, newOutLocation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Location</SelectItem>
                  <SelectItem value="airport">Airport</SelectItem>
                  <SelectItem value="downtown">Downtown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Old Vehicle Check-In */}
          <div className="space-y-4">
            <h4 className="font-medium">Old Vehicle Check-In</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odometerInOld">Odometer Reading (In) *</Label>
                <Input
                  id="odometerInOld"
                  type="number"
                  min="0"
                  value={formData.odometerInOld}
                  onChange={(e) => setFormData(prev => ({ ...prev, odometerInOld: e.target.value }))}
                  placeholder="Current odometer reading"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelInOld">Fuel Level (In) *</Label>
                <Select value={formData.fuelInOld} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelInOld: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Empty</SelectItem>
                    <SelectItem value="25">1/4 Tank</SelectItem>
                    <SelectItem value="50">1/2 Tank</SelectItem>
                    <SelectItem value="75">3/4 Tank</SelectItem>
                    <SelectItem value="100">Full Tank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* New Vehicle Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">New Vehicle Selection</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newVehicleClass">New Vehicle Class *</Label>
                <Select value={formData.newVehicleClass} onValueChange={(value) => setFormData(prev => ({ ...prev, newVehicleClass: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="midsize">Midsize</SelectItem>
                    <SelectItem value="fullsize">Full Size</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newVehicle">Specific Vehicle *</Label>
                <Select value={formData.newVehicle} onValueChange={(value) => setFormData(prev => ({ ...prev, newVehicle: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                <SelectContent>
                  {availableVehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
                  {(!availableVehicles || availableVehicles.length === 0) && (
                    <SelectItem value="" disabled>No vehicles available</SelectItem>
                  )}
                </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* New Vehicle Check-Out */}
          <div className="space-y-4">
            <h4 className="font-medium">New Vehicle Check-Out</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="odometerOutNew">Odometer Reading (Out) *</Label>
                <Input
                  id="odometerOutNew"
                  type="number"
                  min="0"
                  value={formData.odometerOutNew}
                  onChange={(e) => setFormData(prev => ({ ...prev, odometerOutNew: e.target.value }))}
                  placeholder="Current odometer reading"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelOutNew">Fuel Level (Out) *</Label>
                <Select value={formData.fuelOutNew} onValueChange={(value) => setFormData(prev => ({ ...prev, fuelOutNew: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Empty</SelectItem>
                    <SelectItem value="25">1/4 Tank</SelectItem>
                    <SelectItem value="50">1/2 Tank</SelectItem>
                    <SelectItem value="75">3/4 Tank</SelectItem>
                    <SelectItem value="100">Full Tank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copyDrivers"
                checked={formData.copyDrivers}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, copyDrivers: !!checked }))}
              />
              <Label htmlFor="copyDrivers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Copy drivers to new vehicle
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchangeFee">Exchange Fee (optional)</Label>
              <Input
                id="exchangeFee"
                type="number"
                step="0.01"
                min="0"
                value={formData.exchangeFee}
                onChange={(e) => setFormData(prev => ({ ...prev, exchangeFee: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the exchange..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isFormValid() || !isExchangeDateValid()}
            >
              Complete Exchange
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};