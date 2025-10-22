import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertItem } from './AlertItem';
import { RefreshCw, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Alert } from '@/lib/api/admin-dashboard';

interface AlertsPanelProps {
  alerts: Alert[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function AlertsPanel({ alerts, isLoading, onRefresh }: AlertsPanelProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // Real-time subscriptions for critical changes
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agreements'
        },
        () => {
          if (onRefresh) {
            onRefresh();
            toast({
              title: 'New Agreement',
              description: 'A new agreement has been created.',
              variant: 'default'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agreements'
        },
        () => {
          if (onRefresh) {
            onRefresh();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_orders'
        },
        () => {
          if (onRefresh) {
            onRefresh();
            toast({
              title: 'New Work Order',
              description: 'A new work order has been created.',
              variant: 'default'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefresh, toast]);

  const handleManualRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastRefresh(new Date());
      toast({
        title: 'Refreshed',
        description: 'Alerts updated successfully.',
        variant: 'default'
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Alerts</h3>
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 mb-4">
            <Bell className="h-8 w-8 text-green-600" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">All Clear!</h4>
          <p className="text-sm text-muted-foreground">
            No alerts at the moment. Everything is running smoothly.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} {...alert} />
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="h-auto py-1 px-2"
          >
            {autoRefresh ? 'Disable' : 'Enable'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated: {lastRefresh.toLocaleTimeString('en-AE')}
        </p>
      </div>
    </Card>
  );
}
