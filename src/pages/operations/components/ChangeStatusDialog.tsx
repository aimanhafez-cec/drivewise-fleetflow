import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChangeVehicleStatus } from '@/hooks/useVehicleStatus';
import { VehicleWithStatus, StatusChangeData } from '@/lib/api/vehicle-status';

interface ChangeStatusDialogProps {
  vehicle: VehicleWithStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'rented', label: 'On Rent' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'accident_repair', label: 'Accident Repair' },
  { value: 'registration_pending', label: 'Registration Pending' },
  { value: 'internal_use', label: 'Internal Use' },
  { value: 'sold', label: 'Sold' },
  { value: 'de_fleeted', label: 'De-fleeted' },
];

const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({
  vehicle,
  open,
  onOpenChange,
}) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<StatusChangeData>>();
  const changeMutation = useChangeVehicleStatus();
  const toStatus = watch('to_status');

  const onSubmit = (data: Partial<StatusChangeData>) => {
    if (!data.to_status || !data.reason_code) return;

    changeMutation.mutate(
      {
        vehicle_id: vehicle.id,
        to_status: data.to_status,
        reason_code: data.reason_code,
        reason_description: data.reason_description,
        odometer_reading: data.odometer_reading,
        location: data.location,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Vehicle Status</DialogTitle>
          <DialogDescription>
            {vehicle.license_plate} - {vehicle.make} {vehicle.model}
            <div className="mt-1 text-sm">
              Current: <span className="font-semibold">{vehicle.operational_status || 'Not set'}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to_status">New Status *</Label>
            <Select value={toStatus} onValueChange={(value) => setValue('to_status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason_code">Reason Code *</Label>
            <Input
              id="reason_code"
              placeholder="e.g., routine_inspection, customer_return"
              {...register('reason_code', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason_description">Description</Label>
            <Textarea
              id="reason_description"
              placeholder="Additional details..."
              rows={2}
              {...register('reason_description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="odometer_reading">Odometer (km)</Label>
              <Input
                id="odometer_reading"
                type="number"
                placeholder="Current reading"
                {...register('odometer_reading', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Current location"
                {...register('location')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changeMutation.isPending}>
              {changeMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeStatusDialog;
