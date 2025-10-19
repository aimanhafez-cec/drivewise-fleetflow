import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ConvertToAgreementPreCheck } from '@/components/agreements/ConvertToAgreementPreCheck';
import { ReservationFilters, ReservationFilterState } from '@/components/reservations/ReservationFilters';
import { ReservationKPICards } from '@/components/reservations/ReservationKPICards';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

const Reservations = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReservationFilterState>({});
  const [convertModal, setConvertModal] = useState<{ open: boolean; reservation?: any }>({ 
    open: false 
  });

  // Fetch reservations with filters
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            email,
            phone
          ),
          vehicles:vehicle_id (
            make,
            model,
            license_plate,
            vin
          ),
          categories:vehicle_class_id (
            name,
            description
          )
        `)
        .is('converted_agreement_id', null)
        .neq('status', 'cancelled');

      // Apply filters
      if (filters.search) {
        query = query.or(
          `profiles.full_name.ilike.%${filters.search}%,` +
          `profiles.phone.ilike.%${filters.search}%,` +
          `ro_number.ilike.%${filters.search}%`
        );
      }

      if (filters.reservationType) {
        query = query.eq('reservation_type', filters.reservationType);
      }

      if (filters.paymentStatus) {
        query = query.eq('down_payment_status', filters.paymentStatus);
      }

      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }

      if (filters.dateFrom) {
        query = query.gte('start_datetime', startOfDay(filters.dateFrom).toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('start_datetime', endOfDay(filters.dateTo).toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch KPI data
  const { data: kpiData } = useQuery({
    queryKey: ['reservations-kpis'],
    queryFn: async () => {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      // Total open reservations
      const { count: totalCount } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .is('converted_agreement_id', null)
        .neq('status', 'cancelled');

      // Pending payments amount
      const { data: pendingPayments } = await supabase
        .from('reservations')
        .select('down_payment_amount')
        .in('down_payment_status', ['pending', 'partial'])
        .is('converted_agreement_id', null);

      const pendingTotal = pendingPayments?.reduce(
        (sum, r) => sum + (r.down_payment_amount || 0),
        0
      ) || 0;

      // Today's pickups
      const { count: todayCount } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('start_datetime', startOfDay(today).toISOString())
        .lte('start_datetime', endOfDay(today).toISOString())
        .eq('down_payment_status', 'paid');

      // This week's revenue
      const { data: weekReservations } = await supabase
        .from('reservations')
        .select('total_amount')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .is('converted_agreement_id', null);

      const weekRevenue = weekReservations?.reduce(
        (sum, r) => sum + (r.total_amount || 0),
        0
      ) || 0;

      return {
        totalReservations: totalCount || 0,
        pendingPayments: pendingTotal,
        todayPickups: todayCount || 0,
        weekRevenue,
      };
    },
  });

  const handleConvertToAgreement = (reservation: any) => {
    setConvertModal({ open: true, reservation });
  };

  const handleConfirmConvert = () => {
    if (convertModal.reservation) {
      setConvertModal({ open: false });
      navigate(`/agreements/new?fromReservation=${convertModal.reservation.id}`);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            Manage reservations, payments, and agreements
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/reservations/new')} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
          </Button>
          <Button variant="outline" onClick={() => navigate('/daily-planner')} size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Planner
          </Button>
          <Button variant="outline" onClick={() => navigate('/agreements')} size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Agreements
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ReservationKPICards
        data={kpiData || {
          totalReservations: 0,
          pendingPayments: 0,
          todayPickups: 0,
          weekRevenue: 0,
        }}
        isLoading={!kpiData}
      />

      {/* Filters */}
      <ReservationFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Reservations List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Open Reservations</CardTitle>
          <CardDescription>
            {reservations?.length || 0} active reservation(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservations && reservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConvertToAgreement={handleConvertToAgreement}
                  onCollectPayment={(res) => {
                    // TODO: Open payment collection dialog
                    console.log('Collect payment for:', res.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reservations found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.values(filters).some(v => v)
                  ? 'Try adjusting your filters'
                  : 'Create your first reservation to get started'}
              </p>
              <Button onClick={() => navigate('/reservations/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert to Agreement Modal */}
      {convertModal.reservation && (
        <ConvertToAgreementPreCheck
          open={convertModal.open}
          onOpenChange={(open) =>
            setConvertModal({ open, reservation: open ? convertModal.reservation : undefined })
          }
          onConfirm={handleConfirmConvert}
          reservation={convertModal.reservation}
        />
      )}
    </div>
  );
};

export default Reservations;
