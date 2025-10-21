import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AgreementPaymentsAPI, 
  CreatePaymentData, 
  ProcessPaymentData,
  AuthorizeDepositData 
} from '@/lib/api/agreement-payments';
import { toast } from 'sonner';

export const useAgreementPayments = (agreementId?: string) => {
  return useQuery({
    queryKey: ['agreement-payments', agreementId],
    queryFn: () => AgreementPaymentsAPI.listPayments(agreementId!),
    enabled: !!agreementId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAgreementPayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ['agreement-payments', paymentId],
    queryFn: () => AgreementPaymentsAPI.getPayment(paymentId!),
    enabled: !!paymentId,
    staleTime: 30 * 1000,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => AgreementPaymentsAPI.createPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-payments', data.agreement_id] });
      queryClient.invalidateQueries({ queryKey: ['agreement-payment-summary', data.agreement_id] });
      toast.success('Payment record created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payment: ${error.message}`);
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: ProcessPaymentData }) =>
      AgreementPaymentsAPI.processPayment(paymentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-payments'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-payment-summary', data.agreement_id] });
      toast.success('Payment processed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Payment failed: ${error.message}`);
    },
  });
};

export const useAuthorizeDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: AuthorizeDepositData }) =>
      AgreementPaymentsAPI.authorizeDeposit(paymentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-payments'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-payment-summary', data.agreement_id] });
      toast.success('Security deposit authorized');
    },
    onError: (error: Error) => {
      toast.error(`Authorization failed: ${error.message}`);
    },
  });
};

export const useFailPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      AgreementPaymentsAPI.failPayment(paymentId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agreement-payments'] });
      queryClient.invalidateQueries({ queryKey: ['agreement-payment-summary', data.agreement_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
};

export const usePaymentSummary = (agreementId?: string) => {
  return useQuery({
    queryKey: ['agreement-payment-summary', agreementId],
    queryFn: () => AgreementPaymentsAPI.getPaymentSummary(agreementId!),
    enabled: !!agreementId,
    staleTime: 30 * 1000,
  });
};
