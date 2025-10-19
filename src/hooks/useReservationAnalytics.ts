import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

export interface ReservationMetrics {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
  avgDaysToConfirm: number;
}

export interface ReservationTrend {
  date: string;
  reservations: number;
  revenue: number;
}

export interface LocationStats {
  location: string;
  count: number;
  revenue: number;
}

export const useReservationAnalytics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ['reservation-analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          customers:customer_id (
            full_name,
            email
          )
        `);

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data: reservations, error } = await query;
      if (error) throw error;

      // Calculate metrics
      const total = reservations?.length || 0;
      const confirmed = reservations?.filter(r => r.status === 'confirmed').length || 0;
      const pending = reservations?.filter(r => r.status === 'pending').length || 0;
      const cancelled = reservations?.filter(r => r.status === 'cancelled').length || 0;
      const completed = reservations?.filter(r => r.status === 'completed').length || 0;

      const totalRevenue = reservations?.reduce((sum, r) => 
        sum + (Number(r.total_amount) || 0), 0) || 0;

      const averageBookingValue = total > 0 ? totalRevenue / total : 0;
      const conversionRate = total > 0 ? (confirmed / total) * 100 : 0;

      // Calculate average days to confirm
      const confirmedReservations = reservations?.filter(r => 
        r.status === 'confirmed' && r.updated_at && r.created_at
      ) || [];
      
      const avgDaysToConfirm = confirmedReservations.length > 0
        ? confirmedReservations.reduce((sum, r) => {
            const created = new Date(r.created_at).getTime();
            const updated = new Date(r.updated_at).getTime();
            const days = (updated - created) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / confirmedReservations.length
        : 0;

      const metrics: ReservationMetrics = {
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

      // Calculate daily trends
      const trends = reservations?.reduce((acc, r) => {
        const date = new Date(r.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        if (!acc[date]) {
          acc[date] = { date, reservations: 0, revenue: 0 };
        }
        acc[date].reservations += 1;
        acc[date].revenue += Number(r.total_amount) || 0;
        return acc;
      }, {} as Record<string, ReservationTrend>) || {};

      const trendData = Object.values(trends).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate location stats
      const locationStats = reservations?.reduce((acc, r) => {
        const location = r.pickup_location || 'Unknown';
        if (!acc[location]) {
          acc[location] = { location, count: 0, revenue: 0 };
        }
        acc[location].count += 1;
        acc[location].revenue += Number(r.total_amount) || 0;
        return acc;
      }, {} as Record<string, LocationStats>) || {};

      const locationData = Object.values(locationStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Status distribution
      const statusDistribution = reservations?.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Booking type distribution
      const bookingTypeDistribution = reservations?.reduce((acc, r) => {
        const type = r.booking_type || 'STANDARD';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        metrics,
        trends: trendData,
        locations: locationData,
        statusDistribution,
        bookingTypeDistribution,
        rawData: reservations
      };
    },
  });
};
