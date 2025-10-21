import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Car, 
  Calendar, 
  MapPin, 
  DollarSign,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface AgreementOverviewTabProps {
  agreement: any;
}

export const AgreementOverviewTab: React.FC<AgreementOverviewTabProps> = ({ agreement }) => {
  const navigate = useNavigate();
  
  const daysOut = agreement.checkout_datetime && agreement.status === 'active'
    ? differenceInDays(new Date(), new Date(agreement.checkout_datetime))
    : 0;

  const isOverdue = agreement.return_datetime && 
    new Date(agreement.return_datetime) < new Date() && 
    agreement.status === 'active';

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{agreement.profiles?.full_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{agreement.profiles?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{agreement.profiles?.phone || 'N/A'}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate(`/customers/${agreement.customer_id}`)}
          >
            View Full Profile
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {agreement.vehicles ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {agreement.vehicles.year} {agreement.vehicles.make} {agreement.vehicles.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-medium">{agreement.vehicles.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium text-xs">{agreement.vehicles.vin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{agreement.vehicles.color || 'N/A'}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => navigate(`/vehicles/${agreement.vehicle_id}`)}
              >
                View Vehicle Details
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">No vehicle assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Agreement Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agreement Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Agreement Date</p>
            <p className="font-medium">
              {format(new Date(agreement.agreement_date), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check-out</p>
            <p className="font-medium">
              {agreement.checkout_datetime 
                ? format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy HH:mm')
                : 'Not checked out'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected Return</p>
            <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
              {agreement.return_datetime 
                ? format(new Date(agreement.return_datetime), 'MMM dd, yyyy HH:mm')
                : 'TBD'}
            </p>
          </div>
          {agreement.status === 'active' && daysOut > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Days Out</p>
              <Badge variant={isOverdue ? 'destructive' : 'outline'} className="gap-1">
                <Clock className="h-3 w-3" />
                {daysOut} days
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-bold text-lg">{formatCurrency(agreement.total_amount || 0)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="font-medium text-green-600">{formatCurrency(0)}</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-sm font-medium">Balance Due</p>
            <p className="font-bold text-destructive">{formatCurrency(agreement.total_amount || 0)}</p>
          </div>
          <Button variant="default" size="sm" className="w-full mt-2">
            Record Payment
          </Button>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Agreement Timeline</CardTitle>
          <CardDescription>Key milestones and status changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            {/* Timeline Items */}
            <div className="space-y-6">
              {/* Reservation */}
              {agreement.reservation_id && (
                <div className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Reservation Created</p>
                    <p className="text-sm text-muted-foreground">
                      Converted from reservation
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => navigate(`/reservations/${agreement.reservation_id}`)}
                    >
                      View Reservation <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Agreement Created */}
              <div className="relative flex items-start gap-4 pl-10">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Agreement Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(agreement.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {/* Check-out */}
              {agreement.checkout_datetime && (
                <div className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Vehicle Checked Out</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(agreement.checkout_datetime), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}

              {/* Expected Return */}
              {agreement.return_datetime && (
                <div className="relative flex items-start gap-4 pl-10">
                  <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isOverdue ? 'bg-destructive' : 'bg-muted'
                  }`}>
                    <Calendar className={`h-4 w-4 ${isOverdue ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Expected Return</p>
                    <p className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      {format(new Date(agreement.return_datetime), 'MMM dd, yyyy HH:mm')}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Insurance Package</p>
            <p className="font-medium">{agreement.insurance_package_type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="text-sm">{agreement.notes || 'No notes'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
