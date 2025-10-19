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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useReservationToAgreement } from '@/hooks/useReservationToAgreement';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ConvertToAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: any;
}

export const ConvertToAgreementModal: React.FC<ConvertToAgreementModalProps> = ({
  open,
  onOpenChange,
  reservation,
}) => {
  const [notes, setNotes] = useState('');
  const { convertToAgreement, canConvert, isConverting } = useReservationToAgreement();
  const navigate = useNavigate();

  const conversionCheck = canConvert(reservation);

  const handleConvert = async () => {
    const result = await convertToAgreement(reservation.id);
    
    if (result.success && result.agreementId) {
      onOpenChange(false);
      // Navigate to the new agreement
      setTimeout(() => {
        navigate(`/agreements/${result.agreementId}`);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            Convert to Agreement
          </DialogTitle>
          <DialogDescription>
            Convert this confirmed reservation into a rental agreement to begin the checkout process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reservation Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reservation Number:</span>
              <Badge variant="outline">{reservation?.ro_number}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Customer:</span>
              <span className="text-sm">{reservation?.customer_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="text-sm font-semibold">
                {formatCurrency(reservation?.total_amount || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Down Payment:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {formatCurrency(reservation?.down_payment_amount || 0)}
                </span>
                {reservation?.down_payment_status === 'paid' ? (
                  <Badge className="bg-emerald-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    PAID
                  </Badge>
                ) : (
                  <Badge variant="destructive">PENDING</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Status Check */}
          {!conversionCheck.canConvert ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cannot Convert:</strong> {conversionCheck.reason}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-900 dark:text-emerald-100">
                <strong>Ready for Conversion:</strong> This reservation meets all requirements
                and can be converted to an agreement.
              </AlertDescription>
            </Alert>
          )}

          {/* Conversion Process Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">What happens next?</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  A new agreement will be created with a unique agreement number
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  The reservation will be marked as "completed" and linked to the agreement
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  You'll be redirected to the agreement page to proceed with vehicle checkout
                </span>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="conversion-notes">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="conversion-notes"
              placeholder="Add any notes about this conversion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
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
            onClick={handleConvert}
            disabled={!conversionCheck.canConvert || isConverting}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Convert to Agreement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
