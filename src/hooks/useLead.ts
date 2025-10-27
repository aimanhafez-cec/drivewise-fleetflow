import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lead } from './useLeadsRealtime';

export const useLead = (leadId: string | undefined) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!leadId) {
      setLoading(false);
      return;
    }

    const fetchLead = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (error) throw error;
        
        setLead(data as Lead);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error fetching lead:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch lead details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLead();

    // Set up realtime subscription for this specific lead
    const channel = supabase
      .channel(`lead-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`,
        },
        (payload) => {
          setLead(payload.new as Lead);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId, toast]);

  const refetch = async () => {
    if (!leadId) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data as Lead);
    } catch (err) {
      console.error('Error refetching lead:', err);
    }
  };

  return { lead, loading, error, refetch };
};
