import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, FileText, Users, Search } from 'lucide-react';
import type { AgreementSource } from '@/types/agreement-wizard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SourceSelectionProps {
  selectedSource?: AgreementSource;
  selectedSourceId?: string;
  onSelect: (source: AgreementSource, sourceId?: string) => void;
}

export const SourceSelection = ({
  selectedSource,
  selectedSourceId,
  onSelect,
}: SourceSelectionProps) => {
  const [source, setSource] = useState<AgreementSource | undefined>(selectedSource);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available reservations
  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations-for-conversion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          ro_number,
          start_datetime,
          end_datetime,
          total_amount,
          status,
          profiles:customer_id (
            full_name,
            email
          )
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available instant bookings (if you have this table)
  // const { data: instantBookings = [], isLoading: loadingBookings } = useQuery({
  //   queryKey: ['instant-bookings-for-conversion'],
  //   queryFn: async () => {
  //     // Fetch instant bookings logic
  //     return [];
  //   },
  // });

  const handleSourceChange = (newSource: AgreementSource) => {
    setSource(newSource);
    if (newSource === 'direct') {
      onSelect(newSource);
    }
  };

  const handleReservationSelect = (reservationId: string) => {
    onSelect('reservation', reservationId);
  };

  const filteredReservations = reservations.filter((res: any) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      res.ro_number?.toLowerCase().includes(searchLower) ||
      res.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      res.profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Agreement Source</CardTitle>
        <CardDescription>
          Choose how you want to create this agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Type Selection */}
        <RadioGroup value={source} onValueChange={(v) => handleSourceChange(v as AgreementSource)}>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Reservation */}
            <div
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                source === 'reservation'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
              onClick={() => handleSourceChange('reservation')}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="reservation" id="source-reservation" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="source-reservation" className="cursor-pointer flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>From Reservation</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Convert an existing reservation
                  </p>
                  {reservations.length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {reservations.length} available
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Instant Booking */}
            <div
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                source === 'instant_booking'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
              onClick={() => handleSourceChange('instant_booking')}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="instant_booking" id="source-booking" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="source-booking" className="cursor-pointer flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>From Instant Booking</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Convert a paid instant booking
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Agreement */}
            <div
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                source === 'direct'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:border-primary/50'
              }`}
              onClick={() => handleSourceChange('direct')}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="direct" id="source-direct" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="source-direct" className="cursor-pointer flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Direct Agreement</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Walk-in customer without reservation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>

        {/* Reservation Selection */}
        {source === 'reservation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by RO number, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingReservations ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reservations...
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reservations available for conversion
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredReservations.map((reservation: any) => (
                  <div
                    key={reservation.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSourceId === reservation.id
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleReservationSelect(reservation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{reservation.ro_number}</span>
                          <Badge variant="outline">{reservation.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reservation.profiles?.full_name || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reservation.start_datetime).toLocaleDateString()} -{' '}
                          {new Date(reservation.end_datetime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">AED {Number(reservation.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Direct Agreement Info */}
        {source === 'direct' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Direct Agreement:</strong> You'll select the customer and configure all details in the next steps.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
