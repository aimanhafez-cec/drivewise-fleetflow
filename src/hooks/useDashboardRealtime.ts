import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface DashboardRealtimeOptions {
  enabled?: boolean;
  onVehicleChange?: () => void;
  onReservationChange?: () => void;
  onAgreementChange?: () => void;
  onCustodyChange?: () => void;
}

export function useDashboardRealtime(options: DashboardRealtimeOptions = {}) {
  const { enabled = true } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Invalidate all dashboard queries
  const invalidateAllDashboardData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['compliance-stats'] });
    queryClient.invalidateQueries({ queryKey: ['custody-stats'] });
    queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-health-metrics'] });
  }, [queryClient]);

  // Invalidate specific query groups
  const invalidateFleetData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'fleet'] });
    queryClient.invalidateQueries({ queryKey: ['fleet-health-metrics'] });
    options.onVehicleChange?.();
  }, [queryClient, options]);

  const invalidateAgreementData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'agreements'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'alerts'] });
    options.onAgreementChange?.();
  }, [queryClient, options]);

  const invalidateReservationData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'revenue'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-activity-feed'] });
    options.onReservationChange?.();
  }, [queryClient, options]);

  const invalidateCustodyData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['custody-stats'] });
    options.onCustodyChange?.();
  }, [queryClient, options]);

  useEffect(() => {
    if (!enabled) return;

    console.log('[Dashboard Realtime] Setting up subscriptions');

    // Create a single channel for all subscriptions
    const channel = supabase
      .channel('dashboard-realtime')
      
      // Vehicle changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('[Dashboard Realtime] Vehicle change:', payload.eventType);
          
          if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            
            if (oldStatus !== newStatus) {
              toast({
                title: 'Vehicle Status Updated',
                description: `Vehicle status changed from ${oldStatus} to ${newStatus}`,
                variant: 'default'
              });
            }
          }
          
          invalidateFleetData();
        }
      )
      
      // Agreement changes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agreements'
        },
        (payload) => {
          console.log('[Dashboard Realtime] New agreement:', payload);
          
          toast({
            title: 'New Agreement Created',
            description: `Agreement ${(payload.new as any)?.agreement_no || 'created'}`,
            variant: 'default'
          });
          
          invalidateAgreementData();
          invalidateAllDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agreements'
        },
        (payload) => {
          console.log('[Dashboard Realtime] Agreement updated:', payload.eventType);
          
          const oldStatus = (payload.old as any)?.status;
          const newStatus = (payload.new as any)?.status;
          
          if (oldStatus !== newStatus && newStatus === 'pending_return') {
            toast({
              title: 'Return Due',
              description: `Agreement ${(payload.new as any)?.agreement_no || ''} is pending return`,
              variant: 'default'
            });
          }
          
          invalidateAgreementData();
        }
      )
      
      // Reservation changes
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('[Dashboard Realtime] New reservation:', payload);
          
          toast({
            title: 'New Reservation',
            description: `Reservation ${(payload.new as any)?.ro_number || 'created'}`,
            variant: 'default'
          });
          
          invalidateReservationData();
        }
      )
      
      // Custody changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custody_transactions'
        },
        (payload) => {
          console.log('[Dashboard Realtime] Custody change:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Custody Request',
              description: `Custody ${(payload.new as any)?.custody_no || 'created'}`,
              variant: 'default'
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            
            if (oldStatus !== newStatus && newStatus === 'approved') {
              toast({
                title: 'Custody Approved',
                description: `Custody ${(payload.new as any)?.custody_no || ''} has been approved`,
                variant: 'default'
              });
            }
          }
          
          invalidateCustodyData();
        }
      )
      
      // Corporate leasing line assignment changes (inspections)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'corporate_leasing_line_assignments'
        },
        (payload) => {
          console.log('[Dashboard Realtime] Line assignment change:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['inspection-dashboard'] });
        }
      )
      
      // Work orders (maintenance)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'work_orders'
        },
        (payload) => {
          console.log('[Dashboard Realtime] New work order:', payload);
          
          toast({
            title: 'New Work Order',
            description: 'A maintenance work order has been created',
            variant: 'default'
          });
          
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'maintenance'] });
        }
      )
      
      // Invoices (payments)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log('[Dashboard Realtime] Invoice change:', payload.eventType);
          
          if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            
            if (oldStatus !== newStatus && newStatus === 'paid') {
              toast({
                title: 'Payment Received',
                description: `Invoice ${(payload.new as any)?.invoice_number || ''} has been paid`,
                variant: 'default'
              });
            }
          }
          
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', 'revenue'] });
          queryClient.invalidateQueries({ queryKey: ['payment-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-activity-feed'] });
        }
      )
      
      .subscribe((status) => {
        console.log('[Dashboard Realtime] Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('[Dashboard Realtime] Successfully subscribed to all tables');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Dashboard Realtime] Channel error');
          toast({
            title: 'Connection Error',
            description: 'Real-time updates may be delayed. Please refresh the page.',
            variant: 'destructive'
          });
        }
      });

    // Cleanup on unmount
    return () => {
      console.log('[Dashboard Realtime] Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [
    enabled,
    toast,
    invalidateFleetData,
    invalidateAgreementData,
    invalidateReservationData,
    invalidateCustodyData,
    invalidateAllDashboardData,
    queryClient
  ]);

  return {
    invalidateAllDashboardData,
    invalidateFleetData,
    invalidateAgreementData,
    invalidateReservationData,
    invalidateCustodyData
  };
}
