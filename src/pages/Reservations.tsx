import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FileText, Download, Zap, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ConvertToAgreementModal } from '@/components/reservation/ConvertToAgreementModal';
import { ReservationFilters, ReservationFilterState } from '@/components/reservations/ReservationFilters';
import { ReservationKPICards } from '@/components/reservations/ReservationKPICards';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { ExpressReservationModal } from '@/components/reservations/express/ExpressReservationModal';
import { QuickFilterPills } from '@/components/reservations/QuickFilterPills';
import { BulkActionsToolbar } from '@/components/reservations/BulkActionsToolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Reservations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReservationFilterState>({});
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>();
  const [activeViewId, setActiveViewId] = useState<string>();
  const [expressModalOpen, setExpressModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [convertModal, setConvertModal] = useState<{ open: boolean; reservation?: any }>({ 
    open: false 
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onQuickBook: () => setExpressModalOpen(true),
    onNewReservation: () => navigate('/reservations/new'),
    onSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
      searchInput?.focus();
    },
    onRefresh: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-kpis'] });
    },
    onSelectAll: () => {
      if (reservations) {
        setSelectedIds(reservations.map(r => r.id));
      }
    },
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
      // Fetch all reservations for calculations
      const { data: allReservations, error } = await supabase
        .from('reservations')
        .select('*')
        .is('converted_agreement_id', null);

      if (error) throw error;

      const reservations = allReservations || [];
      const total = reservations.length;
      const confirmed = reservations.filter(r => r.status === 'confirmed').length;
      const pending = reservations.filter(r => r.status === 'pending').length;
      const cancelled = reservations.filter(r => r.status === 'cancelled').length;
      const completed = reservations.filter(r => r.status === 'completed').length;

      const totalRevenue = reservations.reduce((sum, r) => 
        sum + (Number(r.total_amount) || 0), 0);

      const averageBookingValue = total > 0 ? totalRevenue / total : 0;
      const conversionRate = total > 0 ? (confirmed / total) * 100 : 0;

      // Calculate average days to confirm
      const confirmedReservations = reservations.filter(r => 
        r.status === 'confirmed' && r.updated_at && r.created_at
      );
      
      const avgDaysToConfirm = confirmedReservations.length > 0
        ? confirmedReservations.reduce((sum, r) => {
            const created = new Date(r.created_at).getTime();
            const updated = new Date(r.updated_at).getTime();
            const days = (updated - created) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / confirmedReservations.length
        : 0;

      return {
        totalReservations: total,
        confirmedReservations: confirmed,
        pendingReservations: pending,
        cancelledReservations: cancelled,
        completedReservations: completed,
        totalRevenue,
        averageBookingValue,
        conversionRate,
        avgDaysToConfirm
      };
    },
  });

  const handleConvertToAgreement = (reservation: any) => {
    setConvertModal({ open: true, reservation });
  };

  const handleClearFilters = () => {
    setFilters({});
    setActiveQuickFilter(undefined);
    setActiveViewId(undefined);
  };

  const handleQuickFilterApply = (filter: any) => {
    setActiveQuickFilter(filter.filterId);
    setActiveViewId(undefined);
    setFilters({
      ...filter,
      filterId: undefined, // Remove the filterId from actual filters
    });
  };

  const handleApplySavedView = (filters: ReservationFilterState) => {
    setFilters(filters);
    setActiveQuickFilter(undefined);
    // Note: activeViewId would be set by SavedViewsManager if needed
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
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
          <Button onClick={() => setExpressModalOpen(true)} size="sm" className="bg-gradient-to-r from-primary to-primary/80 relative">
            <Zap className="mr-2 h-4 w-4" />
            Quick Book
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">Ctrl+Q</Badge>
          </Button>
          <Button onClick={() => navigate('/reservations/new')} variant="outline" size="sm" className="relative">
            <Plus className="mr-2 h-4 w-4" />
            New Reservation
            <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">Ctrl+N</Badge>
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
          <Button variant="ghost" size="sm" className="gap-2">
            <Keyboard className="h-4 w-4" />
            <Badge variant="secondary" className="text-xs px-1.5 py-0">?</Badge>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ReservationKPICards
        metrics={kpiData || {
          totalReservations: 0,
          confirmedReservations: 0,
          pendingReservations: 0,
          cancelledReservations: 0,
          completedReservations: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
          conversionRate: 0,
          avgDaysToConfirm: 0
        }}
        isLoading={!kpiData}
      />

      {/* Quick Filter Pills */}
      <QuickFilterPills
        onFilterApply={handleQuickFilterApply}
        activeFilter={activeQuickFilter}
      />

      {/* Filters */}
      <ReservationFilters
        filters={filters}
        onFiltersChange={handleApplySavedView}
        onClear={handleClearFilters}
        activeViewId={activeViewId}
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
                  isSelected={selectedIds.includes(reservation.id)}
                  onToggleSelect={() => handleToggleSelection(reservation.id)}
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

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        totalCount={reservations?.length || 0}
      />

      {/* Express Reservation Modal */}
      <ExpressReservationModal
        open={expressModalOpen}
        onOpenChange={setExpressModalOpen}
      />

      {/* Convert to Agreement Modal */}
      {convertModal.reservation && (
        <ConvertToAgreementModal
          open={convertModal.open}
          onOpenChange={(open) =>
            setConvertModal({ open, reservation: open ? convertModal.reservation : undefined })
          }
          reservation={convertModal.reservation}
        />
      )}
    </div>
  );
};

export default Reservations;
