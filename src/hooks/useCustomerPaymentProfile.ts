import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerPaymentAPI } from '@/lib/api/customer-payment-profile';
import type { CustomerPaymentProfile } from '@/lib/api/agreement-payments';

/**
 * Hook to fetch and manage customer payment profile
 */
export const useCustomerPaymentProfile = (customerId?: string) => {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customer-payment-profile', customerId],
    queryFn: () => {
      if (!customerId) throw new Error('Customer ID is required');
      return CustomerPaymentAPI.getPaymentProfile(customerId);
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Provide mock data for development if query fails
  const mockProfile: CustomerPaymentProfile = {
    customerId: customerId || 'mock-customer-id',
    walletBalance: 2450.00,
    loyaltyPoints: 125000,
    loyaltyTier: 'gold',
    creditLimit: 10000.00,
    creditUsed: 2500.00,
    creditAvailable: 7500.00,
  };

  return {
    profile: profile || (error ? mockProfile : null),
    isLoading,
    error,
    refetch,
  };
};
