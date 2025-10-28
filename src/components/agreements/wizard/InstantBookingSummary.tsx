import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Car, 
  MapPin, 
  DollarSign, 
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface InstantBookingSummaryProps {
  instantBooking: {
    id: string;
    ro_number: string;
    instant_booking_score?: number;
    auto_approved?: boolean;
    start_datetime: string;
    end_datetime: string;
    total_amount?: number;
    status: string;
    make_model?: string;
    profiles?: {
      full_name: string;
      email: string;
      phone: string;
    };
    vehicles?: {
      registration_no: string;
      make: string;
      model: string;
      year: number;
      color: string;
    };
  };
}

export const InstantBookingSummary = ({ instantBooking }: InstantBookingSummaryProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card className="border-2 border-blue-500/50 bg-blue-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                IB
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Converting from Instant Booking
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    RO# {instantBooking.ro_number}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Data pre-filled from instant booking - review and complete remaining fields
                </p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Hide Details' : 'Show Details'}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer Info */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="font-semibold truncate">
                    {instantBooking.profiles?.full_name || 'Unknown Customer'}
                  </p>
                  {instantBooking.profiles?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {instantBooking.profiles.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Info */}
              {instantBooking.vehicles && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                    <p className="font-semibold truncate">
                      {instantBooking.vehicles.make} {instantBooking.vehicles.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {instantBooking.vehicles.year} • {instantBooking.vehicles.registration_no}
                    </p>
                  </div>
                </div>
              )}

              {/* Rental Period */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Rental Period</p>
                  <p className="text-sm font-semibold">
                    {formatDate(instantBooking.start_datetime)}
                  </p>
                  <p className="text-xs text-muted-foreground">to</p>
                  <p className="text-sm font-semibold">
                    {formatDate(instantBooking.end_datetime)}
                  </p>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    AED {instantBooking.total_amount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              {/* Booking Score */}
              {instantBooking.instant_booking_score !== undefined && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Booking Score</p>
                    <p className="text-2xl font-bold">
                      {instantBooking.instant_booking_score}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Status & Approval */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">
                      {instantBooking.status}
                    </Badge>
                    {instantBooking.auto_approved && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Auto-Approved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Customer verified • Payment processed • Ready for agreement</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/reservations/${instantBooking.id}`} target="_blank" rel="noopener noreferrer">
                  View Full Booking
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
