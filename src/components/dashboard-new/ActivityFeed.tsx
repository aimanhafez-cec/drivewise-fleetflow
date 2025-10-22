import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  FileText,
  Car,
  RotateCcw,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

interface ActivityItem {
  id: string;
  type: 'agreement_signed' | 'vehicle_checkout' | 'vehicle_return' | 'payment_received' | 'quote_approved';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function ActivityFeed() {
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-activity-feed'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const activities: ActivityItem[] = [];

      // Fetch recent agreements
      const { data: agreements } = await supabase
        .from('agreements')
        .select('id, agreement_no, created_at, signed_timestamp, checkout_datetime, return_datetime, profiles!customer_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, created_at, status, total_amount')
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(3);

      // Process agreements
      agreements?.forEach(agreement => {
        if (agreement.signed_timestamp) {
          activities.push({
            id: `agreement-signed-${agreement.id}`,
            type: 'agreement_signed',
            title: 'Agreement Signed',
            description: `${agreement.agreement_no} signed by ${(agreement.profiles as any)?.full_name || 'Customer'}`,
            timestamp: new Date(agreement.signed_timestamp),
            metadata: { agreementId: agreement.id }
          });
        }

        if (agreement.checkout_datetime) {
          activities.push({
            id: `vehicle-checkout-${agreement.id}`,
            type: 'vehicle_checkout',
            title: 'Vehicle Checkout',
            description: `Vehicle handed over for ${agreement.agreement_no}`,
            timestamp: new Date(agreement.checkout_datetime),
            metadata: { agreementId: agreement.id }
          });
        }

        if (agreement.return_datetime) {
          activities.push({
            id: `vehicle-return-${agreement.id}`,
            type: 'vehicle_return',
            title: 'Vehicle Return',
            description: `Vehicle returned for ${agreement.agreement_no}`,
            timestamp: new Date(agreement.return_datetime),
            metadata: { agreementId: agreement.id }
          });
        }
      });

      // Process invoices
      invoices?.forEach(invoice => {
        activities.push({
          id: `payment-${invoice.id}`,
          type: 'payment_received',
          title: 'Payment Received',
          description: `${invoice.invoice_number} - AED ${Number(invoice.total_amount).toLocaleString('en-AE')}`,
          timestamp: new Date(invoice.created_at),
          metadata: { invoiceId: invoice.id }
        });
      });

      // Sort by timestamp descending
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000 // Auto-refresh every minute
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agreements'
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'agreement_signed':
        return FileText;
      case 'vehicle_checkout':
        return Car;
      case 'vehicle_return':
        return RotateCcw;
      case 'payment_received':
        return DollarSign;
      case 'quote_approved':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'agreement_signed':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'vehicle_checkout':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'vehicle_return':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
      case 'payment_received':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'quote_approved':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest transactions</p>
        </div>
      </div>

      {/* Activity List */}
      {activities && activities.length > 0 ? (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div 
                  key={activity.id}
                  className="flex gap-3 items-start pb-4 border-b last:border-0"
                >
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-foreground">
                        {activity.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">No Recent Activity</h4>
          <p className="text-sm text-muted-foreground">
            Activity will appear here as transactions occur
          </p>
        </div>
      )}
    </Card>
  );
}
