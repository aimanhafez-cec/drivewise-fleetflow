import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Car, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VehicleAssignmentDialogProps {
  bookingId: string | null;
  bookingNumber: string | null;
  currentVehicleId: string | null;
  startDate: string | null;
  endDate: string | null;
  open: boolean;
  onClose: () => void;
}

const VehicleAssignmentDialog = ({
  bookingId,
  bookingNumber,
  currentVehicleId,
  startDate,
  endDate,
  open,
  onClose,
}: VehicleAssignmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(currentVehicleId);

  // Fetch available vehicles
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['available-vehicles', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('make');

      if (error) throw error;
      return data;
    },
    enabled: open && !!startDate && !!endDate,
  });

  const assignVehicle = useMutation({
    mutationFn: async () => {
      if (!bookingId || !selectedVehicleId) throw new Error('Missing required data');

      const { error } = await supabase
        .from('reservations')
        .update({ vehicle_id: selectedVehicleId })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Vehicle Assigned',
        description: `Vehicle has been successfully assigned to booking ${bookingNumber}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['instant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-details'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Assignment Failed',
        description: 'Unable to assign vehicle. Please try again.',
        variant: 'destructive',
      });
      console.error('Vehicle assignment error:', error);
    },
  });

  const handleAssign = () => {
    assignVehicle.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Assign Vehicle
          </DialogTitle>
          <DialogDescription>
            Select a vehicle to assign to booking <span className="font-semibold">{bookingNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid gap-3">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicleId === vehicle.id;
                const isCurrent = currentVehicleId === vehicle.id;

                return (
                  <Card
                    key={vehicle.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-md'
                        : 'hover:shadow-sm hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            isSelected ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <Car className={`h-6 w-6 ${
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.license_plate}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">{vehicle.color || 'N/A'}</Badge>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {vehicle.status}
                              </Badge>
                              {isCurrent && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Currently Assigned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No available vehicles found for the selected dates
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assignVehicle.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              assignVehicle.isPending ||
              !selectedVehicleId ||
              selectedVehicleId === currentVehicleId
            }
          >
            {assignVehicle.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Assigning...
              </>
            ) : (
              'Assign Vehicle'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleAssignmentDialog;
