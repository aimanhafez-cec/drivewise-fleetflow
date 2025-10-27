import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { Lead } from '@/data/mockLeads';
import { format, differenceInDays } from 'date-fns';

interface LeadRequestDetailsProps {
  lead: Lead;
}

export const LeadRequestDetails = ({ lead }: LeadRequestDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Request Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Car className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Vehicle Requested</p>
              <p className="font-semibold">{lead.vehicle_category}</p>
              {lead.alternative_categories && lead.alternative_categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">Alternatives:</span>
                  {lead.alternative_categories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 mt-0.5 text-green-600" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pickup</p>
                <p className="text-sm font-semibold">
                  {format(new Date(lead.pickup_datetime), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(lead.pickup_datetime), 'HH:mm')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 mt-0.5 text-red-600" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Return</p>
                <p className="text-sm font-semibold">
                  {format(new Date(lead.return_datetime), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(lead.return_datetime), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <MapPin className="h-5 w-5 mt-0.5 text-blue-600" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pickup Location</p>
                <p className="text-sm font-semibold">{lead.pickup_location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Return Location</p>
                <p className="text-sm font-semibold">{lead.return_location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Rental Duration</p>
              <p className="text-lg font-bold text-primary">{lead.duration_days} Days</p>
            </div>
          </div>

          {lead.special_requests && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <FileText className="h-5 w-5 mt-0.5 text-amber-600" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Special Requests</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">{lead.special_requests}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
