import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VehicleSelector } from './VehicleSelector';
import { toast } from 'sonner';

interface VehicleAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  line: any;
  agreementStartDate: Date;
  agreementEndDate: Date;
}

export const VehicleAssignmentModal: React.FC<VehicleAssignmentModalProps> = ({
  open,
  onOpenChange,
  agreementId,
  line,
  agreementStartDate,
  agreementEndDate
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [checkoutLocation, setCheckoutLocation] = useState('');
  const [checkinLocation, setCheckinLocation] = useState('');
  const [checkoutFuel, setCheckoutFuel] = useState(100);
  const [checkoutOdometer, setCheckoutOdometer] = useState('');

  const queryClient = useQueryClient();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedVehicle(null);
      setCheckoutLocation('');
      setCheckinLocation('');
      setCheckoutFuel(100);
      setCheckoutOdometer('');
    }
  }, [open]);

  const assignVehicleMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const { error } = await supabase
        .from('agreement_lines')
        .update({
          vehicle_id: assignmentData.vehicleId,
          out_location_id: assignmentData.checkoutLocation,
          in_location_id: assignmentData.checkinLocation,
        })
        .eq('id', line.id);

      if (error) throw error;

      // Update vehicle status to rented
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', assignmentData.vehicleId);

      if (vehicleError) throw vehicleError;

      return assignmentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agreement', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['agreement-lines', agreementId] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle assigned successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to assign vehicle: ' + error.message);
    }
  });

  const handleAssign = () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    if (!checkoutLocation) {
      toast.error('Please enter checkout location');
      return;
    }

    assignVehicleMutation.mutate({
      vehicleId: selectedVehicle.id,
      checkoutLocation,
      checkinLocation: checkinLocation || checkoutLocation,
      checkoutFuel,
      checkoutOdometer: parseInt(checkoutOdometer) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Vehicle to Agreement Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Vehicle</Label>
            <VehicleSelector
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              agreementStartDate={agreementStartDate}
              agreementEndDate={agreementEndDate}
              excludeVehicleId={line.vehicle_id} // Don't show currently assigned vehicle
            />
          </div>

          {/* Location and Condition Details */}
          {selectedVehicle && (
            <div className="space-y-4 border-t pt-4">
              <Label className="text-lg font-semibold">Assignment Details</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-location">Checkout Location *</Label>
                  <Input
                    id="checkout-location"
                    value={checkoutLocation}
                    onChange={(e) => setCheckoutLocation(e.target.value)}
                    placeholder="Enter checkout location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkin-location">Check-in Location</Label>
                  <Input
                    id="checkin-location"
                    value={checkinLocation}
                    onChange={(e) => setCheckinLocation(e.target.value)}
                    placeholder="Same as checkout if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-fuel">Checkout Fuel Level (%)</Label>
                  <Input
                    id="checkout-fuel"
                    type="number"
                    min="0"
                    max="100"
                    value={checkoutFuel}
                    onChange={(e) => setCheckoutFuel(parseInt(e.target.value) || 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-odometer">Checkout Odometer</Label>
                  <Input
                    id="checkout-odometer"
                    type="number"
                    value={checkoutOdometer}
                    onChange={(e) => setCheckoutOdometer(e.target.value)}
                    placeholder={`Current: ${selectedVehicle.odometer || 0}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedVehicle || !checkoutLocation || assignVehicleMutation.isPending}
            >
              {assignVehicleMutation.isPending ? 'Assigning...' : 'Assign Vehicle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};