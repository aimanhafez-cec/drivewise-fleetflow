import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Car, User, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ReservationSearch, SearchFilters } from '@/components/reservations/ReservationSearch';
import { ConvertToAgreementPreCheck } from '@/components/agreements/ConvertToAgreementPreCheck';
import { formatCurrency } from '@/lib/utils';
const Reservations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [convertModal, setConvertModal] = useState<{
    open: boolean;
    reservation?: any;
  }>({
    open: false
  });

  // Fetch open reservations (not converted/cancelled) with search filters
  const {
    data: reservations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['reservations:open', searchFilters],
    queryFn: async () => {
      console.log('Fetching reservations with filters:', searchFilters);
      let query = supabase.from('reservations').select(`
          *,
          profiles:customer_id (
            full_name,
            email
          ),
          vehicles (
            make,
            model,
            license_plate
          )
        `).in('status', searchFilters.status ? [searchFilters.status as any] : ['pending', 'confirmed', 'checked_out']).is('converted_agreement_id', null);

      // Apply search filter
      if (searchFilters.query) {
        query = query.or(`profiles.full_name.ilike.%${searchFilters.query}%,id.ilike.%${searchFilters.query}%`);
      }

      // Apply date filters
      if (searchFilters.dateFrom) {
        query = query.gte('start_datetime', searchFilters.dateFrom);
      }
      if (searchFilters.dateTo) {
        query = query.lte('end_datetime', searchFilters.dateTo);
      }
      const {
        data,
        error
      } = await query.order('created_at', {
        ascending: false
      });
      console.log('Reservations query result:', {
        data,
        error
      });
      if (error) {
        console.error('Reservations query error:', error);
        throw error;
      }
      return data;
    }
  });

  // Get counts for summary cards
  const {
    data: counts
  } = useQuery({
    queryKey: ['reservations:counts'],
    queryFn: async () => {
      const [totalQuery, checkedOutQuery, pendingQuery] = await Promise.all([supabase.from('reservations').select('id', {
        count: 'exact'
      }).in('status', ['pending', 'confirmed', 'checked_out']).is('converted_agreement_id', null), supabase.from('reservations').select('id', {
        count: 'exact'
      }).eq('status', 'checked_out').is('converted_agreement_id', null), supabase.from('reservations').select('id', {
        count: 'exact'
      }).eq('status', 'pending').is('converted_agreement_id', null)]);
      return {
        total: totalQuery.count || 0,
        active: checkedOutQuery.count || 0,
        pending: pendingQuery.count || 0
      };
    }
  });
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleConvertToAgreement = (reservation: any) => {
    setConvertModal({
      open: true,
      reservation
    });
  };
  const handleConfirmConvert = () => {
    if (convertModal.reservation) {
      setConvertModal({
        open: false
      });
      // Navigate to agreement wizard
      navigate(`/agreements/new?fromReservation=${convertModal.reservation.id}`);
    }
  };
  if (isLoading) {
    return <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>;
  }
  return <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Open Reservations</h1>
            <p className="text-muted-foreground">
              Manage active customer reservations and bookings
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button id="btn-new-reservation" onClick={() => navigate('/reservations/new')} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Reservation</span>
              <span className="sm:hidden">New</span>
            </Button>
            
            
            
            <Button variant="outline" onClick={() => navigate('/agreements')} size="sm">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Agreements</span>
            </Button>
          </div>
      </div>

      {/* Search & Filters */}
      <ReservationSearch onSearch={setSearchFilters} isLoading={isLoading} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Not yet converted
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reservations?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From open reservations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Open Reservations</CardTitle>
          <CardDescription>
            Active reservations that haven't been converted to agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservations && reservations.length > 0 ? <div id="reservations-table" className="space-y-4">
              {reservations.map(reservation => <div key={reservation.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4 flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/reservations/${reservation.id}`)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {reservation.profiles?.full_name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {reservation.vehicles ? `${reservation.vehicles.make} ${reservation.vehicles.model}` : 'No vehicle assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-center">
                      <p className="text-sm font-medium">
                        {reservation.start_datetime && reservation.end_datetime ? <>
                            {format(new Date(reservation.start_datetime), 'MMM dd')} - {format(new Date(reservation.end_datetime), 'MMM dd, yyyy')}
                          </> : 'Dates TBD'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(reservation.total_amount || 0)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                      <Button id={`btn-convert-agreement-${reservation.id}`} size="sm" onClick={e => {
                  e.stopPropagation();
                  handleConvertToAgreement(reservation);
                }} className="w-full sm:w-auto">
                        <span className="hidden sm:inline">Convert to Agreement</span>
                        <span className="sm:hidden">Convert</span>
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div> : <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No open reservations</h3>
              <p className="text-muted-foreground">
                Create your first reservation to get started.
              </p>
              <Button className="mt-4" onClick={() => navigate('/reservations/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </div>}
        </CardContent>
      </Card>

      {/* Convert to Agreement Modal */}
      {convertModal.reservation && <ConvertToAgreementPreCheck open={convertModal.open} onOpenChange={open => setConvertModal({
      open,
      reservation: open ? convertModal.reservation : undefined
    })} onConfirm={handleConfirmConvert} reservation={convertModal.reservation} />}
    </div>;
};
export default Reservations;