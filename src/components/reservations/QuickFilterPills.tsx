import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Calendar,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, isPast } from 'date-fns';

interface QuickFilterPillsProps {
  onFilterApply: (filter: any) => void;
  activeFilter?: string;
}

export const QuickFilterPills: React.FC<QuickFilterPillsProps> = ({
  onFilterApply,
  activeFilter,
}) => {
  // Fetch counts for each filter
  const { data: counts } = useQuery({
    queryKey: ['quick-filter-counts'],
    queryFn: async () => {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      // Today's pickups
      const { count: todayCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('start_datetime', startOfDay(today).toISOString())
        .lte('start_datetime', endOfDay(today).toISOString())
        .is('converted_agreement_id', null);

      // Payment pending
      const { count: pendingPaymentCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('down_payment_status', 'pending')
        .is('converted_agreement_id', null);

      // Ready to convert (confirmed + paid)
      const { count: readyToConvertCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')
        .eq('down_payment_status', 'paid')
        .is('converted_agreement_id', null);

      // Ending soon (next 48 hours)
      const in48Hours = new Date(today.getTime() + 48 * 60 * 60 * 1000);
      const { count: endingSoonCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .lte('end_datetime', in48Hours.toISOString())
        .gte('end_datetime', today.toISOString())
        .in('status', ['confirmed', 'checked_out'])
        .is('converted_agreement_id', null);

      // This week
      const { count: thisWeekCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('start_datetime', weekStart.toISOString())
        .lte('start_datetime', weekEnd.toISOString())
        .is('converted_agreement_id', null);

      // High value (above average)
      const { data: allRes } = await supabase
        .from('reservations')
        .select('total_amount')
        .is('converted_agreement_id', null);
      
      const avgValue = allRes && allRes.length > 0
        ? allRes.reduce((sum, r) => sum + (r.total_amount || 0), 0) / allRes.length
        : 0;

      const { count: highValueCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gt('total_amount', avgValue)
        .is('converted_agreement_id', null);

      return {
        today: todayCount || 0,
        pendingPayment: pendingPaymentCount || 0,
        readyToConvert: readyToConvertCount || 0,
        endingSoon: endingSoonCount || 0,
        thisWeek: thisWeekCount || 0,
        highValue: highValueCount || 0,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const pills = [
    {
      id: 'today',
      label: "Today's Pickups",
      icon: Calendar,
      count: counts?.today || 0,
      filter: {
        dateFrom: startOfDay(new Date()),
        dateTo: endOfDay(new Date()),
      },
    },
    {
      id: 'payment-pending',
      label: 'Payment Pending',
      icon: DollarSign,
      count: counts?.pendingPayment || 0,
      variant: 'warning' as const,
      filter: {
        paymentStatus: 'pending',
      },
    },
    {
      id: 'ready-to-convert',
      label: 'Ready to Convert',
      icon: FileText,
      count: counts?.readyToConvert || 0,
      variant: 'success' as const,
      filter: {
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    },
    {
      id: 'ending-soon',
      label: 'Ending Soon',
      icon: Clock,
      count: counts?.endingSoon || 0,
      variant: 'warning' as const,
      filter: {
        // Custom logic needed in parent
        custom: 'ending-soon',
      },
    },
    {
      id: 'this-week',
      label: 'This Week',
      icon: Calendar,
      count: counts?.thisWeek || 0,
      filter: {
        dateFrom: startOfWeek(new Date()),
        dateTo: endOfWeek(new Date()),
      },
    },
    {
      id: 'high-value',
      label: 'High Value',
      icon: TrendingUp,
      count: counts?.highValue || 0,
      filter: {
        custom: 'high-value',
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const Icon = pill.icon;
        const isActive = activeFilter === pill.id;
        
        return (
          <Button
            key={pill.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterApply({ filterId: pill.id, ...pill.filter })}
            className={cn(
              'gap-2',
              pill.variant === 'warning' && !isActive && 'border-amber-300 hover:bg-amber-50',
              pill.variant === 'success' && !isActive && 'border-green-300 hover:bg-green-50'
            )}
          >
            <Icon className="h-4 w-4" />
            {pill.label}
            <Badge
              variant={isActive ? 'secondary' : 'outline'}
              className={cn(
                'ml-1',
                pill.variant === 'warning' && !isActive && 'bg-amber-100 text-amber-800',
                pill.variant === 'success' && !isActive && 'bg-green-100 text-green-800'
              )}
            >
              {pill.count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};
