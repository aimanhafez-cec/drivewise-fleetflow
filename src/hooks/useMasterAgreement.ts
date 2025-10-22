import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubmitMasterAgreement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      agreement_id: string;
      notes?: string;
    }) => {
      console.log('🚀 Invoking submit-master-agreement-approval with:', params);
      
      const { data, error } = await supabase.functions.invoke('submit-master-agreement-approval', {
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
      console.log('✅ Master agreement approved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['master-agreement', data.agreement_id] });
      queryClient.invalidateQueries({ queryKey: ['master-agreements:list'] });
      toast({
        title: 'Master Agreement Approved',
        description: 'Master agreement has been submitted and auto-approved successfully.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Full error object:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to submit master agreement';
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateMasterAgreementPDF = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (agreement: any) => {
      const agreementNumber = agreement?.agreement_no || 'MasterAgreement';
      
      const originalTitle = document.title;
      document.title = `Autostrad_MasterAgreement_${agreementNumber}`;
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      window.print();
      
      document.title = originalTitle;
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'PDF Ready',
        description: 'Master agreement PDF is ready to print or save.',
      });
    },
  });
};

export const useSendMasterAgreementToCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      agreement_id: string;
      recipient_email: string;
      custom_message?: string;
      expiration_days?: number;
    }) => {
      console.log('📧 Sending master agreement to customer via edge function:', params);
      
      const { data, error } = await supabase.functions.invoke('send-master-agreement-to-customer', {
        body: params,
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }
      
      console.log('✅ Master agreement sent successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Success response:', data);
      queryClient.invalidateQueries({ queryKey: ['master-agreement', variables.agreement_id] });
      queryClient.invalidateQueries({ queryKey: ['master-agreements:list'] });
      toast({
        title: 'Master Agreement Sent Successfully',
        description: `Master agreement has been sent to ${variables.recipient_email}`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Send master agreement error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Failed to send master agreement to customer';
      toast({
        title: 'Failed to Send Master Agreement',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
