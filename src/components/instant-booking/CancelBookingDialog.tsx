import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface CancelBookingDialogProps {
  bookingId: string | null;
  bookingNumber: string | null;
  open: boolean;
  onClose: () => void;
}

const CancelBookingDialog = ({
  bookingId,
  bookingNumber,
  open,
  onClose,
}: CancelBookingDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancellationReason, setCancellationReason] = useState('');

  const cancelBooking = useMutation({
    mutationFn: async () => {
      if (!bookingId) throw new Error('No booking ID');

      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          notes: cancellationReason
            ? `Cancellation reason: ${cancellationReason}`
            : 'Cancelled by admin',
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Cancelled',
        description: `Booking ${bookingNumber} has been successfully cancelled.`,
      });
      queryClient.invalidateQueries({ queryKey: ['instant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: 'Cancellation Failed',
        description: 'Unable to cancel booking. Please try again.',
        variant: 'destructive',
      });
      console.error('Cancel booking error:', error);
    },
  });

  const handleClose = () => {
    setCancellationReason('');
    onClose();
  };

  const handleCancel = () => {
    cancelBooking.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel booking{' '}
            <span className="font-semibold">{bookingNumber}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Cancelling this booking will:
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>Mark the booking as cancelled</li>
              <li>Free up the reserved vehicle (if assigned)</li>
              <li>Trigger refund process (if applicable)</li>
              <li>Send cancellation notification to customer</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={cancelBooking.isPending}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
          >
            {cancelBooking.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelBookingDialog;
