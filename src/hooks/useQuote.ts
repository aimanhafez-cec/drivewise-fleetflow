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
      console.log('🚀 Invoking submit-quote-approval with:', params);
      
      const { data, error } = await supabase.functions.invoke('submit-quote-approval', {
        body: params,
      });

      console.log('📥 Response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Quote approved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['quote', data.quote_id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: 'Quote Approved',
        description: 'Quote has been submitted and auto-approved successfully.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Full error object:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to submit quote';
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateQuotePDF = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quote: any) => {
      // Extract quote number for filename
      const quoteNumber = quote?.quote_number || 'Quote';
      
      // Temporarily change document title for PDF filename
      const originalTitle = document.title;
      document.title = `Autostrad_Quote_${quoteNumber}`;
      
      // Give browser time to render print layout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Trigger print
      window.print();
      
      // Restore original title
      document.title = originalTitle;
      
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
