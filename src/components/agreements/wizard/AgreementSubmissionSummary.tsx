import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Link,
  CheckCircle2,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import type { EnhancedWizardData } from '@/types/agreement-wizard';

interface AgreementSubmissionSummaryProps {
  wizardData: EnhancedWizardData;
  instantBookingRoNumber?: string;
}

export const AgreementSubmissionSummary = ({ 
  wizardData, 
  instantBookingRoNumber 
}: AgreementSubmissionSummaryProps) => {
  const isFromInstantBooking = wizardData.source === 'instant_booking';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Agreement Creation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Source:</span>
            <Badge variant={isFromInstantBooking ? "default" : "secondary"}>
              {isFromInstantBooking && <Link className="h-3 w-3 mr-1" />}
              {wizardData.source === 'instant_booking' && 'From Instant Booking'}
              {wizardData.source === 'reservation' && 'From Reservation'}
              {wizardData.source === 'direct' && 'Direct Agreement'}
            </Badge>
          </div>
          
          {isFromInstantBooking && instantBookingRoNumber && (
            <div className="text-xs text-muted-foreground pl-4">
              Will be linked to booking: {instantBookingRoNumber}
            </div>
          )}
        </div>

        <Separator />

        {/* Key Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Customer</div>
              <div className="text-xs text-muted-foreground">
                Customer ID: {wizardData.step1.customerId?.substring(0, 8)}...
              </div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Rental Period</div>
              <div className="text-xs text-muted-foreground">
                {new Date(wizardData.step1.pickupDateTime).toLocaleDateString()} - {' '}
                {new Date(wizardData.step1.dropoffDateTime).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {wizardData.step1.agreementType.charAt(0).toUpperCase() + wizardData.step1.agreementType.slice(1)} • {' '}
                {wizardData.step1.rentalPurpose.charAt(0).toUpperCase() + wizardData.step1.rentalPurpose.slice(1)}
              </div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Total Amount</div>
              <div className="text-lg font-bold text-primary">
                AED {wizardData.step3.pricingBreakdown.total.toFixed(2)}
              </div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>

          {wizardData.step4.selectedAddons.length > 0 && (
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm font-medium">Add-ons</div>
                <div className="text-xs text-muted-foreground">
                  {wizardData.step4.selectedAddons.length} item(s) selected
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Status */}
        {isFromInstantBooking && wizardData.step5.advancePayment.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Payment already collected via instant booking</span>
            </div>
          </div>
        )}

        {/* Actions to be performed */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Actions on Submit:</div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-4">
            <li>• Create new agreement record</li>
            {isFromInstantBooking && (
              <>
                <li>• Link instant booking to agreement</li>
                <li>• Update instant booking status to "completed"</li>
                <li>• Transfer payment records to agreement</li>
              </>
            )}
            {wizardData.step4.selectedAddons.length > 0 && (
              <li>• Create {wizardData.step4.selectedAddons.length} agreement line item(s)</li>
            )}
            {wizardData.step5.advancePayment.status === 'completed' && (
              <li>• Record advance payment transaction</li>
            )}
            {wizardData.step6?.documents && wizardData.step6.documents.length > 0 && (
              <li>• Link {wizardData.step6.documents.length} document(s)</li>
            )}
          </ul>
        </div>

        {/* Warnings if any */}
        {!wizardData.step1.customerId && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Customer must be selected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
