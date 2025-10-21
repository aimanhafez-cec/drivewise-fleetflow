import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostComplianceAPI } from '../costCompliance';
import { mockSupabaseClient } from '@/test/mocks/supabase';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('CostComplianceAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated dashboard statistics', async () => {
      const mockStats = {
        total_tolls_fines: 100,
        total_exceptions: 20,
        total_billing_cycles: 5,
        pending_amount: 5000,
      };

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: mockStats,
        error: null,
      });

      const result = await CostComplianceAPI.getDashboardStats();

      expect(result).toEqual(mockStats);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'get_cost_compliance_dashboard_stats'
      );
    });

    it('should throw error when RPC fails', async () => {
      const mockError = new Error('RPC failed');
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(CostComplianceAPI.getDashboardStats()).rejects.toThrow(
        'RPC failed'
      );
    });
  });

  describe('listBillingCycles', () => {
    it('should list all billing cycles when no filter provided', async () => {
      const mockCycles = [
        { id: '1', contract_id: 'c1', status: 'draft' },
        { id: '2', contract_id: 'c2', status: 'finalized' },
      ];

      mockSupabaseClient.from().select().order.mockResolvedValueOnce({
        data: mockCycles,
        error: null,
      });

      const result = await CostComplianceAPI.listBillingCycles();

      expect(result).toEqual(mockCycles);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'contract_billing_cycles'
      );
    });

    it('should filter by contract_id when provided', async () => {
      const contractId = 'contract-123';
      const mockCycles = [{ id: '1', contract_id: contractId, status: 'draft' }];

      mockSupabaseClient.from().select().eq.mockReturnThis();
      mockSupabaseClient.from().select().order.mockResolvedValueOnce({
        data: mockCycles,
        error: null,
      });

      const result = await CostComplianceAPI.listBillingCycles(contractId);

      expect(result).toEqual(mockCycles);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith(
        'contract_id',
        contractId
      );
    });
  });

  describe('createBillingCycle', () => {
    it('should create a new billing cycle', async () => {
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
        status: 'draft',
        total_expenses: 0,
        total_tolls: 0,
        total_fines: 0,
        total_amount: 0,
      };

      mockSupabaseClient.from().insert().select().single.mockResolvedValueOnce({
        data: mockCreatedCycle,
        error: null,
      });

      const result = await CostComplianceAPI.createBillingCycle(newCycleData);

      expect(result).toEqual(mockCreatedCycle);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        'contract_billing_cycles'
      );
    });
  });

  describe('generateBillingPreview', () => {
    it('should generate billing preview for a contract', async () => {
      const contractId = 'contract-123';
      const periodStart = '2025-01-01';
      const periodEnd = '2025-01-31';

      const mockPreview = {
        contract_id: contractId,
        period: { start: periodStart, end: periodEnd },
        summary: {
          total_expenses: 1000,
          total_tolls: 500,
          total_fines: 200,
          subtotal: 1700,
          tax: 85,
          grand_total: 1785,
        },
      };

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: mockPreview,
        error: null,
      });

      const result = await CostComplianceAPI.generateBillingPreview(
        contractId,
        periodStart,
        periodEnd
      );

      expect(result).toEqual(mockPreview);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'generate_billing_preview',
        {
          p_contract_id: contractId,
          p_period_start: periodStart,
          p_period_end: periodEnd,
        }
      );
    });
  });

  describe('finalizeBillingCycle', () => {
    it('should finalize a billing cycle', async () => {
      const cycleId = 'cycle-123';
      const invoiceId = 'inv-456';

      const mockFinalizedCycle = {
        id: cycleId,
        status: 'finalized',
        invoice_id: invoiceId,
      };

      mockSupabaseClient.from().update().eq().select().single.mockResolvedValueOnce({
        data: mockFinalizedCycle,
        error: null,
      });

      const result = await CostComplianceAPI.finalizeBillingCycle(
        cycleId,
        invoiceId
      );

      expect(result).toEqual(mockFinalizedCycle);
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        status: 'finalized',
        invoice_id: invoiceId,
      });
    });
  });

  describe('batchGenerateBilling', () => {
    it('should process multiple contracts and return results', async () => {
      const contracts = [
        {
          contract_id: 'c1',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
        },
        {
          contract_id: 'c2',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
        },
      ];

      // Mock successful responses
      mockSupabaseClient.rpc
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: {}, error: null });

      const result = await CostComplianceAPI.batchGenerateBilling(contracts);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures', async () => {
      const contracts = [
        {
          contract_id: 'c1',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
        },
        {
          contract_id: 'c2',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
        },
      ];

      // Mock one success and one failure
      mockSupabaseClient.rpc
        .mockResolvedValueOnce({ data: {}, error: null })
        .mockResolvedValueOnce({ data: null, error: new Error('Failed') });

      const result = await CostComplianceAPI.batchGenerateBilling(contracts);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('runExceptionDetection', () => {
    it('should run exception detection and return results', async () => {
      const mockResult = {
        created: 5,
        errors: [],
      };

      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await CostComplianceAPI.runExceptionDetection();

      expect(result).toEqual(mockResult);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
        'detect_compliance_exceptions'
      );
    });
  });
});
