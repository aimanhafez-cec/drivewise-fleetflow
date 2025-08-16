import React from 'react';
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
import { Calendar, User, Car, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";

interface ConvertToAgreementPreCheckProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reservation: {
    id: string;
    customer_id: string;
    start_datetime: string;
    end_datetime: string;
    total_amount: number;
    status: string;
    profiles?: {
      full_name: string;
      email: string;
    };
    vehicles?: {
      make: string;
      model: string;
      license_plate: string;
    } | null;
  };
  isLoading?: boolean;
}

export const ConvertToAgreementPreCheck: React.FC<ConvertToAgreementPreCheckProps> = ({
  open,
  onOpenChange,
  onConfirm,
  reservation,
  isLoading = false,
}) => {
  const formatReservationNumber = (id: string) => `RES-${id.slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="modal-precheck-convert" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Convert to Agreement
          </DialogTitle>
          <DialogDescription>
            Review reservation details before proceeding to agreement creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reservation Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{formatReservationNumber(reservation.id)}</h3>
              <p className="text-sm text-muted-foreground">
                Status: <Badge variant="secondary">{reservation.status}</Badge>
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Customer</span>
              </div>
              <div className="pl-6">
                <p className="font-medium">{reservation.profiles?.full_name || 'Unknown Customer'}</p>
                <p className="text-sm text-muted-foreground">{reservation.profiles?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Vehicle</span>
              </div>
              <div className="pl-6">
                {reservation.vehicles ? (
                  <>
                    <p className="font-medium">
                      {reservation.vehicles.make} {reservation.vehicles.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.vehicles.license_plate}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No vehicle assigned</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates & Pricing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Rental Period</span>
            </div>
            <div className="pl-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Check Out</p>
                <p className="font-medium">
                  {format(new Date(reservation.start_datetime), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Check In</p>
                <p className="font-medium">
                  {format(new Date(reservation.end_datetime), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Financial Summary</span>
            </div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grand Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(reservation.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lines Count:</span>
                <span>1</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            id="btn-precheck-convert"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? 'Processing...' : 'Start Agreement Wizard'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};