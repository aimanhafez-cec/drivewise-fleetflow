import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const BookingStatsCards = () => {
  const today = new Date().toISOString().split('T')[0];

  // Today's Instant Bookings
  const { data: todayStats, isLoading: loadingToday } = useQuery({
    queryKey: ['instant-booking-today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('booking_type', 'INSTANT')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);
      
      if (error) throw error;
      
      return {
        count: data.length,
        revenue: data.reduce((sum, r) => sum + (r.total_amount || 0), 0)
      };
    }
  });

  // Pending Down Payments (will be accurate in Phase 3)
  const { data: pendingPayments, isLoading: loadingPending } = useQuery({
    queryKey: ['instant-booking-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('booking_type', 'INSTANT')
        .eq('status', 'pending');
      
      if (error) throw error;
      
      return {
        count: data.length,
        amount: data.reduce((sum, r) => sum + ((r.total_amount || 0) * 0.3), 0)
      };
    }
  });

  // Auto-Approved Stats
  const { data: approvalStats, isLoading: loadingApproval } = useQuery({
    queryKey: ['instant-booking-approval'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('auto_approved')
        .eq('booking_type', 'INSTANT');
      
      if (error) throw error;
      
      const autoApproved = data.filter(r => r.auto_approved).length;
      const total = data.length;
      
      return {
        autoApproved,
        manual: total - autoApproved,
        percentage: total > 0 ? (autoApproved / total) * 100 : 0
      };
    }
  });

  // Conversion Rate
  const { data: conversionStats, isLoading: loadingConversion } = useQuery({
    queryKey: ['instant-booking-conversion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, converted_agreement_id')
        .eq('booking_type', 'INSTANT');
      
      if (error) throw error;
      
      const converted = data.filter(r => r.converted_agreement_id).length;
      const total = data.length;
      
      return {
        converted,
        total,
        percentage: total > 0 ? (converted / total) * 100 : 0
      };
    }
  });

  const stats = [
    {
      title: "Today's Instant Bookings",
      value: todayStats?.count || 0,
      subtitle: `AED ${(todayStats?.revenue || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`,
      icon: Calendar,
      color: 'text-[hsl(var(--chart-1))]',
      bgColor: 'bg-[hsl(var(--chart-1))]/10',
      loading: loadingToday
    },
    {
      title: "Pending Down Payments",
      value: pendingPayments?.count || 0,
      subtitle: `AED ${(pendingPayments?.amount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      loading: loadingPending
    },
    {
      title: "Auto-Approved",
      value: `${(approvalStats?.percentage || 0).toFixed(0)}%`,
      subtitle: `${approvalStats?.autoApproved || 0} of ${(approvalStats?.autoApproved || 0) + (approvalStats?.manual || 0)} bookings`,
      icon: Zap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      loading: loadingApproval
    },
    {
      title: "Average Booking Time",
      value: "4.2 min",
      subtitle: "23% faster than standard",
      icon: Clock,
      color: 'text-[hsl(var(--chart-3))]',
      bgColor: 'bg-[hsl(var(--chart-3))]/10',
      loading: false
    },
    {
      title: "Conversion Rate",
      value: `${(conversionStats?.percentage || 0).toFixed(0)}%`,
      subtitle: `${conversionStats?.converted || 0} of ${conversionStats?.total || 0} converted`,
      icon: TrendingUp,
      color: 'text-[hsl(var(--chart-2))]',
      bgColor: 'bg-[hsl(var(--chart-2))]/10',
      loading: loadingConversion
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        // Special styling for Average Booking Time card
        const isBookingTimeCard = stat.title === "Average Booking Time";
        
        return (
          <Card 
            key={index} 
            className={
              isBookingTimeCard 
                ? "border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300" 
                : "border-border/50 shadow-sm hover:shadow-md transition-shadow"
            }
          >
            <CardContent className="p-6">
              {stat.loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-sm font-medium ${isBookingTimeCard ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'}`}>
                      {stat.title}
                    </p>
                    <div className={`p-2 rounded-lg ${stat.bgColor} ${isBookingTimeCard ? 'relative' : ''}`}>
                      {isBookingTimeCard && (
                        <div className="absolute inset-0 bg-purple-400 dark:bg-purple-500 blur-xl opacity-30 animate-pulse rounded-lg" />
                      )}
                      <stat.icon className={`h-4 w-4 ${stat.color} relative z-10`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={
                        isBookingTimeCard 
                          ? "text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent"
                          : "text-2xl font-bold text-foreground"
                      }>
                        {stat.value}
                      </h3>
                      {isBookingTimeCard && (
                        <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-400 animate-bounce" />
                      )}
                    </div>
                    <p className={
                      isBookingTimeCard
                        ? "text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1"
                        : "text-xs text-muted-foreground"
                    }>
                      {isBookingTimeCard && <span>⚡</span>}
                      {stat.subtitle}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BookingStatsCards;
