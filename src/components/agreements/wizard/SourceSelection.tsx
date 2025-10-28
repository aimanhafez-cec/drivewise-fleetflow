import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, FileText, Users, Search, Car, CheckCircle2, AlertCircle, User } from 'lucide-react';
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
        .eq('booking_type', 'STANDARD')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch available instant bookings
  const { data: instantBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['instant-bookings-for-conversion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          ro_number,
          booking_type,
          instant_booking_score,
          auto_approved,
          start_datetime,
          end_datetime,
          pickup_location,
          return_location,
          total_amount,
          status,
          vehicle_id,
          vehicle_class_id,
          make_model,
          profiles:customer_id (
            full_name,
            email,
            phone
          ),
          vehicles:vehicle_id (
            registration_no,
            make,
            model,
            year,
            color
          )
        `)
        .eq('booking_type', 'INSTANT')
        .eq('status', 'confirmed')
        .is('converted_agreement_id', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

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

  const filteredInstantBookings = instantBookings.filter((booking: any) => {
    const searchLower = searchQuery.toLowerCase();
    const vehicleInfo = `${booking.make_model || ''} ${booking.vehicles?.registration_no || ''}`.toLowerCase();
    return (
      booking.ro_number?.toLowerCase().includes(searchLower) ||
      booking.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      booking.profiles?.email?.toLowerCase().includes(searchLower) ||
      vehicleInfo.includes(searchLower)
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
                  {instantBookings.length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {instantBookings.length} available
                    </Badge>
                  )}
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

        {/* Instant Booking Selection */}
        {source === 'instant_booking' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by RO#, customer name, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingBookings ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading instant bookings...
              </div>
            ) : filteredInstantBookings.length === 0 ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">No Instant Bookings Available</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {searchQuery 
                      ? 'No instant bookings match your search criteria.'
                      : 'There are no confirmed instant bookings available for conversion.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredInstantBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSourceId === booking.id
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleReservationSelect(booking.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">
                            {booking.ro_number || 'N/A'}
                          </span>
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            Instant Booking
                          </Badge>
                          {booking.auto_approved && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Auto-Approved
                            </Badge>
                          )}
                          {booking.instant_booking_score && (
                            <Badge variant="outline">
                              Score: {booking.instant_booking_score}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium text-foreground">
                              {booking.profiles?.full_name || 'Unknown Customer'}
                            </span>
                          </div>
                          
                          {booking.vehicles && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Car className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {booking.vehicles.make} {booking.vehicles.model} {booking.vehicles.year}
                                {booking.vehicles.registration_no && ` • ${booking.vehicles.registration_no}`}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {new Date(booking.start_datetime).toLocaleDateString()} - {new Date(booking.end_datetime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-lg font-bold">
                          AED {Number(booking.total_amount || 0).toFixed(2)}
                        </div>
                        <Badge variant="outline">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedSourceId === booking.id && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Selected for conversion</span>
                      </div>
                    )}
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
