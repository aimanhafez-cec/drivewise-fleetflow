import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, Car, User, CreditCard, Download, Mail, MessageSquare, Printer, Eye } from 'lucide-react';
import type { BookingWizardData } from '@/pages/NewInstantBooking';
import { format } from 'date-fns';

interface WizardBookingConfirmationProps {
  bookingData: BookingWizardData;
  onComplete: () => void;
}

const WizardBookingConfirmation = ({ bookingData, onComplete }: WizardBookingConfirmationProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-emerald-100">
            <CheckCircle className="h-16 w-16 text-emerald-600" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your instant booking and agreement have been successfully created
          </p>
        </div>
        <div className="flex justify-center">
          <Badge className="bg-emerald-600 text-white text-lg px-6 py-2">
            Agreement: {bookingData.agreementNo || 'Processing...'}
          </Badge>
        </div>
      </div>

      {/* Booking Details */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <h3 className="font-semibold text-lg text-foreground">Booking Details</h3>
          
          {/* Customer */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium text-foreground">{bookingData.customerName}</p>
              <Badge variant="outline" className="mt-1">
                {bookingData.customerType}
              </Badge>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Rental Period</p>
              <p className="font-medium text-foreground">
                {format(new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`), 'MMM dd, yyyy HH:mm')}
                {' → '}
                {format(new Date(`${bookingData.returnDate}T${bookingData.returnTime}`), 'MMM dd, yyyy HH:mm')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.ceil(
                  (new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).getTime() -
                    new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </p>
            </div>
          </div>

          {/* Locations */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="font-medium text-foreground">
                Pickup: {bookingData.pickupLocation}
              </p>
              <p className="font-medium text-foreground">
                Return: {bookingData.returnLocation}
              </p>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Car className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Vehicle Selection</p>
              <p className="font-medium text-foreground capitalize">
                {bookingData.reservationType?.replace('_', ' ')}
              </p>
              {bookingData.vehicleClassName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {bookingData.vehicleClassName}
                </p>
              )}
              {bookingData.makeModel && (
                <p className="text-sm text-muted-foreground mt-1">
                  {bookingData.makeModel}
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          {bookingData.pricing && (
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Payment</p>
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">AED {bookingData.pricing.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Down Payment Paid:</span>
                    <span className="font-semibold text-emerald-600">
                      AED {bookingData.pricing.downPaymentRequired.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600">Balance Due at Pickup:</span>
                    <span className="font-semibold text-amber-600">
                      AED {bookingData.pricing.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
                {bookingData.paymentTransactionId && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Transaction ID: {bookingData.paymentTransactionId}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Next Steps</h3>
          <ol className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>You will receive a confirmation email with all booking details</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>An SMS will be sent to your registered mobile number</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Please arrive at the pickup location 15 minutes before your scheduled time</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>Bring your Emirates ID, driving license, and passport for verification</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">5.</span>
              <span>Complete the balance payment at pickup</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {bookingData.agreementId && (
          <Button 
            variant="default" 
            className="gap-2 md:col-span-2"
            onClick={() => navigate(`/agreements/${bookingData.agreementId}`)}
          >
            <Eye className="h-4 w-4" />
            View Agreement
          </Button>
        )}
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Complete Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onComplete} className="px-12" variant="outline">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default WizardBookingConfirmation;
