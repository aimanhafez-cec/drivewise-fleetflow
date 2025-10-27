import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Lead } from '@/hooks/useLeadsRealtime';
import { format, differenceInDays } from 'date-fns';

interface LeadRentalPeriodProps {
  lead: Lead;
}

export const LeadRentalPeriod = ({ lead }: LeadRentalPeriodProps) => {
  const pickupDate = new Date(lead.pickup_datetime);
  const returnDate = new Date(lead.return_datetime);
  const actualDays = differenceInDays(returnDate, pickupDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rental Period & Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-base py-1 px-3">
            <Clock className="h-4 w-4 mr-2" />
            {lead.duration_days} Day{lead.duration_days !== 1 ? 's' : ''} Rental
          </Badge>
          {actualDays !== lead.duration_days && (
            <Badge variant="secondary" className="text-xs">
              {actualDays} actual days
            </Badge>
          )}
        </div>

        {/* Pickup Details */}
        <div className="space-y-3">
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Pickup
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {format(pickupDate, 'EEEE, MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {format(pickupDate, 'hh:mm a')}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-900">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-700 dark:text-green-300 mt-0.5" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {lead.pickup_location}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center">
            <div className="p-2 bg-muted rounded-full">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Return Details */}
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Calendar className="h-5 w-5 text-red-700 dark:text-red-300" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Return
                </p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {format(returnDate, 'EEEE, MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {format(returnDate, 'hh:mm a')}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-red-700 dark:text-red-300 mt-0.5" />
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  {lead.return_location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {lead.special_requests && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              Special Requests
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {lead.special_requests}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
