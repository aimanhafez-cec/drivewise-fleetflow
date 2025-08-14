import React, { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface ConvertToAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  reservation: {
    reservationNo: string;
    customer: string;
    priceList?: string;
    linesCount: number;
    checkOutDate: string;
    checkInDate: string;
    grandTotal: number;
    advancePaid: number;
    balanceDue: number;
  };
  isConverting: boolean;
}

export const ConvertToAgreementModal: React.FC<ConvertToAgreementModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  reservation,
  isConverting,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="modal-convert" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Agreement</DialogTitle>
          <DialogDescription>
            This will create a new agreement from this reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Reservation No.:</span>
              <p className="font-semibold">{reservation.reservationNo}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Customer:</span>
              <p className="font-semibold">{reservation.customer}</p>
            </div>
          </div>

          {reservation.priceList && (
            <div>
              <span className="font-medium text-muted-foreground">Price List:</span>
              <p className="font-semibold">{reservation.priceList}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Lines Count:</span>
              <Badge variant="secondary">{reservation.linesCount}</Badge>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Period:</span>
              <p className="text-sm">
                {reservation.checkOutDate} → {reservation.checkInDate}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Grand Total:</span>
              <span className="font-bold">${reservation.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Advance Paid:</span>
              <span>${reservation.advancePaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Balance Due:</span>
              <span className="font-bold text-destructive">
                ${reservation.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isConverting}
          >
            Cancel
          </Button>
          <Button 
            id="btn-confirm-convert"
            onClick={handleConfirm}
            disabled={isConverting}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};