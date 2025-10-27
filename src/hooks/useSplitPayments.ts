import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SplitPaymentsAPI } from '@/lib/api/split-payments';
import { useToast } from '@/hooks/use-toast';
import type { PaymentAllocation, SplitPaymentItem } from '@/lib/api/agreement-payments';

interface UseSplitPaymentsProps {
  agreementId: string;
  customerId: string;
  totalAmount: number;
  onSuccess?: (payments: SplitPaymentItem[]) => void;
}

/**
 * Hook to manage split payment processing
 */
export const useSplitPayments = ({
  agreementId,
  customerId,
  totalAmount,
  onSuccess,
}: UseSplitPaymentsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [allocation, setAllocation] = useState<PaymentAllocation>({
    totalAmount,
    allocatedAmount: 0,
    remainingAmount: totalAmount,
    payments: [],
  });

  // Mutation for processing split payments
  const processMutation = useMutation({
    mutationFn: (allocation: PaymentAllocation) =>
      SplitPaymentsAPI.processSplitPayments(agreementId, customerId, allocation),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Payment Successful',
          description: `Processed ${result.processedPayments.length} payment(s) successfully`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['customer-payment-profile', customerId] });
        queryClient.invalidateQueries({ queryKey: ['agreement-payments', agreementId] });
        
        onSuccess?.(result.processedPayments);
      } else {
        toast({
          title: 'Payment Failed',
          description: result.error || 'Failed to process payments',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  // Validate allocation
  const validateAllocation = useCallback(() => {
    return SplitPaymentsAPI.validateAllocation(allocation);
  }, [allocation]);

  // Process payments
  const processPayments = useCallback(() => {
    const validation = validateAllocation();
    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.errors[0],
        variant: 'destructive',
      });
      return;
    }
    
    processMutation.mutate(allocation);
  }, [allocation, validateAllocation, processMutation, toast]);

  return {
    allocation,
    setAllocation,
    processPayments,
    isProcessing: processMutation.isPending,
    validateAllocation,
  };
};
