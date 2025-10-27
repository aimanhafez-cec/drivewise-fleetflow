import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Mail, ArrowUpDown } from 'lucide-react';
import { useReservationQuickActions } from '@/hooks/useReservationQuickActions';

interface QuickActionButtonsProps {
  reservation: any;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ reservation }) => {
  const { updateStatus, quickPayment, sendEmail } = useReservationQuickActions();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(reservation.down_payment_amount || 0);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleQuickPayment = async () => {
    await quickPayment.mutateAsync({
      reservationId: reservation.id,
      amount: paymentAmount,
      method: paymentMethod,
    });
    setPaymentDialogOpen(false);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'confirmed' | 'checked_out' | 'completed' | 'cancelled') => {
    await updateStatus.mutateAsync({
      reservationId: reservation.id,
      status: newStatus,
    });
  };

  const handleSendEmail = async () => {
    await sendEmail.mutateAsync({
      reservationId: reservation.id,
      type: 'confirmation',
    });
  };

  return (
    <>
      <div className="flex gap-1">
        {/* Quick Payment */}
        {reservation.down_payment_status === 'pending' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setPaymentDialogOpen(true);
            }}
            title="Quick Payment"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
        )}

        {/* Quick Status Change */}
        <Select
          value={reservation.status}
          onValueChange={(value: any) => {
            handleStatusChange(value as 'pending' | 'confirmed' | 'checked_out' | 'completed' | 'cancelled');
          }}
        >
          <SelectTrigger 
            className="h-8 w-8 p-0 border-0 hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
            title="Change Status"
          >
            <ArrowUpDown className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent onClick={(e) => e.stopPropagation()}>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick Email */}
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            handleSendEmail();
          }}
          title="Send Email"
        >
          <Mail className="h-4 w-4" />
        </Button>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Record payment for reservation {reservation.ro_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                min={0}
                max={reservation.total_amount}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickPayment} disabled={quickPayment.isPending}>
              {quickPayment.isPending ? 'Processing...' : 'Collect Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
