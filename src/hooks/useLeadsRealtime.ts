import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  lead_no: string;
  source_type: string;
  source_name: string;
  status: 'new' | 'contacted' | 'quoted' | 'confirmed' | 'rejected' | 'expired';
  priority: 'high' | 'medium' | 'low';
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_nationality: string | null;
  language_preference: string;
  vehicle_category: string;
  alternative_categories: string[] | null;
  pickup_datetime: string;
  pickup_location: string;
  return_datetime: string;
  return_location: string;
  duration_days: number;
  estimated_value: number;
  special_requests: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  sla_response_deadline: string | null;
  sla_breached: boolean;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseLeadsRealtimeOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableNotifications?: boolean;
  enableSoundAlerts?: boolean;
}

export const useLeadsRealtime = (options: UseLeadsRealtimeOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    enableNotifications = true,
    enableSoundAlerts = true,
  } = options;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLeadCount, setNewLeadCount] = useState(0);
  const { toast } = useToast();

  // Request notification permission
  useEffect(() => {
    if (enableNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enableNotifications]);

  // Play sound alert
  const playAlert = () => {
    if (enableSoundAlerts) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjOH0fPTgjMGHm7A7+OZUA0PVq3n7ql');
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  // Show desktop notification
  const showNotification = (lead: Lead) => {
    if (enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('New High Priority Lead!', {
        body: `${lead.customer_name} - ${lead.vehicle_category} - AED ${lead.estimated_value}`,
        icon: '/favicon.ico',
        tag: lead.id,
      });
    }
  };

  // Fetch initial leads
  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const newLead = payload.new as Lead;
          setLeads((prev) => [newLead, ...prev]);
          setNewLeadCount((prev) => prev + 1);

          // Show notification for high priority leads
          if (newLead.priority === 'high') {
            showNotification(newLead);
            playAlert();
            
            toast({
              title: '🔔 New High Priority Lead',
              description: `${newLead.customer_name} - ${newLead.vehicle_category}`,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const updatedLead = payload.new as Lead;
          setLeads((prev) =>
            prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const deletedLead = payload.old as Lead;
          setLeads((prev) => prev.filter((lead) => lead.id !== deletedLead.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLeads();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const resetNewLeadCount = () => setNewLeadCount(0);

  return {
    leads,
    loading,
    newLeadCount,
    resetNewLeadCount,
    refetch: fetchLeads,
  };
};
