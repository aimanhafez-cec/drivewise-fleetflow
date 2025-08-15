import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReservationLine } from '@/types/reservation';

interface LineDetailsModalProps {
  line: ReservationLine | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lineId: string, updates: Partial<ReservationLine>) => void;
  onDelete: (lineId: string) => void;
}

export const LineDetailsModal: React.FC<LineDetailsModalProps> = ({
  line,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!line) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Line Details - Line {line.lineNo}</DialogTitle>
          <DialogDescription>
            View and edit reservation line details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Reservation Type</label>
              <div className="text-sm text-muted-foreground">{line.reservationTypeId}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Vehicle Class</label>
              <div className="text-sm text-muted-foreground">{line.vehicleClassId}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Check Out Date</label>
              <div className="text-sm text-muted-foreground">
                {line.checkOutDate ? line.checkOutDate.toLocaleString() : 'Not set'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Check In Date</label>
              <div className="text-sm text-muted-foreground">
                {line.checkInDate ? line.checkInDate.toLocaleString() : 'Not set'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Line Net Price</label>
              <div className="text-sm text-muted-foreground">{line.lineNetPrice.toFixed(2)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Tax Value</label>
              <div className="text-sm text-muted-foreground">{line.taxValue.toFixed(2)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Line Total</label>
              <div className="text-sm text-muted-foreground font-medium">{line.lineTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive" onClick={() => onDelete(line.id)}>
            Delete Line
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
