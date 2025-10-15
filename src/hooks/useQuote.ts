import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubmitQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      quote_id: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('submit-quote-approval', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote', data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: 'Quote Approved',
        description: 'Quote has been submitted and auto-approved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit quote',
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateQuotePDF = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // For now, use browser print - later can be enhanced with PDF library
      window.print();
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'PDF Ready',
        description: 'Quote PDF is ready to print or save.',
      });
    },
  });
};

export const useSendQuoteToCustomer = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      quote_id: string;
      customer_email: string;
      message?: string;
    }) => {
      // TODO: Implement email sending via edge function
      // For now, show placeholder
      console.log('Sending quote to:', params);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Coming Soon',
        description: 'Email sending will be implemented in the next phase.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Send',
        description: error.message || 'Failed to send quote to customer',
        variant: 'destructive',
      });
    },
  });
};
