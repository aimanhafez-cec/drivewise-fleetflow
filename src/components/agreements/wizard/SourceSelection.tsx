import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, FileText, Users, Search, Car, CheckCircle2, AlertCircle, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgreementSource } from '@/types/agreement-wizard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debug: Check user session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.warn('[SourceSelection] No authenticated user found. Data may be restricted by RLS.');
        toast.warning('Authentication', {
          description: 'Please ensure you are logged in to see all available bookings.',
        });
      } else {
        console.log('[SourceSelection] User authenticated:', user.id);
      }
    };
    checkSession();
  }, []);

  // Fetch available reservations
  const { data: reservations = [], isLoading: loadingReservations, error: reservationsError } = useQuery({
    queryKey: ['reservations-for-conversion'],
    queryFn: async () => {
      console.log('[SourceSelection] Fetching reservations for conversion...');
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

      if (error) {
        console.error('[SourceSelection] Error fetching reservations:', error);
        throw error;
      }
      
      console.log('[SourceSelection] Reservations fetched:', data?.length || 0, 'reservations');
      return data || [];
    },
  });

  // Fetch available instant bookings via edge function
  const { 
    data: instantBookingsData, 
    isLoading: loadingBookings, 
    error: bookingsError 
  } = useQuery({
    queryKey: ['instant-bookings', debouncedQuery, currentPage, pageSize],
    queryFn: async () => {
      console.log(`[SourceSelection] Fetching instant bookings (page: ${currentPage}, query: "${debouncedQuery}")...`);
      
      const { data, error } = await supabase.functions.invoke('list-instant-bookings', {
        body: {
          q: debouncedQuery,
          page: currentPage,
          pageSize,
        },
      });

      if (error) {
        console.error('[SourceSelection] Error fetching instant bookings:', error);
        throw error;
      }

      console.log(`[SourceSelection] Fetched ${data?.items?.length || 0} instant bookings (total: ${data?.total || 0})`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const instantBookings = instantBookingsData?.items || [];
  const totalInstantBookings = instantBookingsData?.total || 0;
  const totalPages = Math.ceil(totalInstantBookings / pageSize);

  // Show error toast if fetching fails
  useEffect(() => {
    if (reservationsError) {
      console.error('[SourceSelection] Reservations query error:', reservationsError);
      toast.error('Failed to Load Reservations', {
        description: 'Unable to fetch reservations. Please refresh the page.',
        duration: 5000,
      });
    }
  }, [reservationsError]);

  useEffect(() => {
    if (bookingsError) {
      console.error('[SourceSelection] Instant bookings query error:', bookingsError);
      toast.error('Failed to Load Instant Bookings', {
        description: 'Unable to fetch instant bookings. Please refresh the page.',
        duration: 5000,
      });
    }
  }, [bookingsError]);

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
                  <Badge variant="secondary" className="mt-2">
                    {loadingBookings ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Loading...
                      </>
                    ) : (
                      `${totalInstantBookings} available`
                    )}
                  </Badge>
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
              <div className="text-center py-12 text-muted-foreground space-y-3">
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="text-sm">Loading available reservations...</p>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by RO#, customer name, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingBookings ? (
              <div className="text-center py-12 text-muted-foreground space-y-3">
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="text-sm">Loading instant bookings...</p>
              </div>
            ) : instantBookings.length === 0 ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">No Instant Bookings Available</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {searchQuery 
                      ? 'No instant bookings match your search criteria.'
                      : 'There are no instant bookings available.'}
                  </p>
                  <div className="mt-3 text-xs text-amber-600">
                    <p className="font-medium">Showing all instant bookings (Booking Type: INSTANT)</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {instantBookings.map((booking: any) => (
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
                                  {booking.vehicles.make_model || `${booking.vehicles.make} ${booking.vehicles.model}`} {booking.vehicles.year}
                                  {booking.vehicles.registration_no && ` • ${booking.vehicles.registration_no}`}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {new Date(booking.pickup_datetime).toLocaleDateString()} - {new Date(booking.return_datetime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            AED {Number(booking.total_amount || 0).toFixed(2)}
                          </p>
                          {selectedSourceId === booking.id && (
                            <Badge variant="default" className="mt-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} ({totalInstantBookings} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
