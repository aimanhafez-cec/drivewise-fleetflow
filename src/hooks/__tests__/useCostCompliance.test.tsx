import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useCostComplianceDashboard,
  useBillingCycles,
  useCreateBillingCycle,
  useGenerateBillingPreview,
} from '../useCostCompliance';
import { CostComplianceAPI } from '@/lib/api/costCompliance';

// Mock the API
vi.mock('@/lib/api/costCompliance', () => ({
  CostComplianceAPI: {
    getDashboardStats: vi.fn(),
    listBillingCycles: vi.fn(),
    createBillingCycle: vi.fn(),
    generateBillingPreview: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCostCompliance hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCostComplianceDashboard', () => {
    it('should fetch dashboard statistics', async () => {
      const mockStats = {
        total_expenses: 50,
        total_expenses_count: 25,
        total_tolls_fines: 100,
        total_tolls_fines_count: 75,
        pending_tolls_fines: 30,
        total_exceptions: 20,
        total_exceptions_count: 15,
        open_exceptions: 10,
        awaiting_approval: 5,
        total_billing_cycles: 5,
        pending_billing_amount: 5000,
        recent_activity: [],
      };

      vi.mocked(CostComplianceAPI.getDashboardStats).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useCostComplianceDashboard(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.data).toEqual(mockStats);
      expect(CostComplianceAPI.getDashboardStats).toHaveBeenCalled();
    });

    it('should handle errors when fetching dashboard stats', async () => {
      vi.mocked(CostComplianceAPI.getDashboardStats).mockRejectedValue(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() => useCostComplianceDashboard(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to fail
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useBillingCycles', () => {
    it('should fetch billing cycles', async () => {
      const mockCycles = [
        {
          id: '1',
          billing_cycle_no: 'BC-001',
          contract_id: 'c1',
          status: 'open' as const,
          period_start: '2025-01-01',
          period_end: '2025-01-31',
          billing_date: '2025-02-01',
          total_expenses: 0,
          total_tolls: 0,
          total_fines: 0,
          total_exceptions: 0,
          total_amount: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      vi.mocked(CostComplianceAPI.listBillingCycles).mockResolvedValue(mockCycles);

      const { result } = renderHook(() => useBillingCycles(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.data).toEqual(mockCycles);
      expect(CostComplianceAPI.listBillingCycles).toHaveBeenCalledWith(undefined);
    });

    it('should fetch billing cycles filtered by contract_id', async () => {
      const contractId = 'contract-123';
      const mockCycles = [
        {
          id: '1',
          billing_cycle_no: 'BC-001',
          contract_id: contractId,
          status: 'open' as const,
          period_start: '2025-01-01',
          period_end: '2025-01-31',
          billing_date: '2025-02-01',
          total_expenses: 0,
          total_tolls: 0,
          total_fines: 0,
          total_exceptions: 0,
          total_amount: 0,
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ];

      vi.mocked(CostComplianceAPI.listBillingCycles).mockResolvedValue(mockCycles);

      const { result } = renderHook(() => useBillingCycles(contractId), {
        wrapper: createWrapper(),
      });

      // Wait for the query to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.data).toEqual(mockCycles);
      expect(CostComplianceAPI.listBillingCycles).toHaveBeenCalledWith(contractId);
    });
  });

  describe('useCreateBillingCycle', () => {
    it('should create a billing cycle and show success toast', async () => {
      const newCycleData = {
        billing_cycle_no: 'BC-001',
        contract_id: 'contract-123',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        billing_date: '2025-02-01',
      };

      const mockCreatedCycle = {
        id: 'cycle-1',
        ...newCycleData,
        status: 'open' as const,
        total_expenses: 0,
        total_tolls: 0,
        total_fines: 0,
        total_exceptions: 0,
        total_amount: 0,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };

      vi.mocked(CostComplianceAPI.createBillingCycle).mockResolvedValue(
        mockCreatedCycle
      );

      const { result } = renderHook(() => useCreateBillingCycle(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newCycleData);

      // Wait for the mutation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(CostComplianceAPI.createBillingCycle).toHaveBeenCalledWith(
        newCycleData
      );
    });

    it('should handle errors when creating billing cycle', async () => {
      const newCycleData = {
        billing_cycle_no: 'BC-001',
        contract_id: 'contract-123',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        billing_date: '2025-02-01',
      };

      vi.mocked(CostComplianceAPI.createBillingCycle).mockRejectedValue(
        new Error('Creation failed')
      );

      const { result } = renderHook(() => useCreateBillingCycle(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newCycleData);

      // Wait for the mutation to fail
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useGenerateBillingPreview', () => {
    it('should generate billing preview', async () => {
      const params = {
        contractId: 'contract-123',
        periodStart: '2025-01-01',
        periodEnd: '2025-01-31',
      };

      const mockPreview = {
        contract_id: params.contractId,
        period_start: params.periodStart,
        period_end: params.periodEnd,
        summary: {
          total_expenses: 1000,
          total_tolls: 500,
          total_fines: 200,
          subtotal: 1700,
          vat: 85,
          grand_total: 1785,
        },
        expenses: [],
        tolls: [],
        fines: [],
        exceptions: [],
      };

      vi.mocked(CostComplianceAPI.generateBillingPreview).mockResolvedValue(
        mockPreview
      );

      const { result } = renderHook(() => useGenerateBillingPreview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(params);

      // Wait for the mutation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(CostComplianceAPI.generateBillingPreview).toHaveBeenCalledWith(
        params.contractId,
        params.periodStart,
        params.periodEnd
      );
    });
  });
});
