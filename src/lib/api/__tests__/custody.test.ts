import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustodyAPI } from '../custody';
import * as supabaseClient from '@/integrations/supabase/client';
import { mockSupabaseClient, mockCustodyTransaction } from '@/test/mocks/supabase';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

describe('CustodyAPI', () => {
  let custodyApi: CustodyAPI;

  beforeEach(() => {
    custodyApi = new CustodyAPI();
    vi.clearAllMocks();
  });

  describe('createCustodyTransaction', () => {
    it('should create a custody transaction', async () => {
      const mockData = { ...mockCustodyTransaction };
      mockSupabaseClient.from().select().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await custodyApi.createCustodyTransaction({
        customer_id: '123e4567-e89b-12d3-a456-426614174001',
        custodian_type: 'customer',
        custodian_name: 'John Doe',
        reason_code: 'maintenance',
        incident_date: '2025-10-20T10:00:00Z',
        effective_from: '2025-10-20T10:00:00Z',
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('custody_transactions');
      expect(result).toEqual(mockData);
    });

    it('should throw error when creation fails', async () => {
      mockSupabaseClient.from().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Failed to create' },
      });

      await expect(
        custodyApi.createCustodyTransaction({
          customer_id: '123e4567-e89b-12d3-a456-426614174001',
          custodian_type: 'customer',
          custodian_name: 'John Doe',
          reason_code: 'maintenance',
          incident_date: '2025-10-20T10:00:00Z',
          effective_from: '2025-10-20T10:00:00Z',
        })
      ).rejects.toThrow();
    });
  });

  describe('getCustodyTransaction', () => {
    it('should fetch a custody transaction by ID', async () => {
      const mockData = { ...mockCustodyTransaction };
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await custodyApi.getCustodyTransaction('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('custody_transactions');
      expect(result).toEqual(mockData);
    });
  });

  describe('updateCustodyTransaction', () => {
    it('should update a custody transaction', async () => {
      const updates = { status: 'pending_approval' as const };
      const mockData = { ...mockCustodyTransaction, ...updates };
      
      mockSupabaseClient.from().update().eq().select().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await custodyApi.updateCustodyTransaction(
        '123e4567-e89b-12d3-a456-426614174000',
        updates
      );

      expect(result.status).toBe('pending_approval');
    });
  });

  describe('deleteCustodyTransaction', () => {
    it('should delete a custody transaction', async () => {
      mockSupabaseClient.from().delete().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.deleteCustodyTransaction('123e4567-e89b-12d3-a456-426614174000')
      ).resolves.not.toThrow();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('custody_transactions');
    });
  });

  describe('listCustodyTransactions', () => {
    it('should list custody transactions with filters', async () => {
      const mockData = [mockCustodyTransaction];
      mockSupabaseClient.from().select.mockReturnValue({
        ...mockSupabaseClient.from(),
        in: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
          count: 1,
        }),
      });

      const result = await custodyApi.listCustodyTransactions(
        { status: ['draft'] },
        { page: 1, pageSize: 10 }
      );

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('searchCustody', () => {
    it('should search custody transactions', async () => {
      const mockData = [mockCustodyTransaction];
      mockSupabaseClient.from().select().or.mockReturnValue({
        ...mockSupabaseClient.from(),
        limit: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      const result = await custodyApi.searchCustody('CST-000001');

      expect(result).toHaveLength(1);
      expect(result[0].custody_no).toBe('CST-000001');
    });
  });

  describe('submitForApproval', () => {
    it('should submit custody for approval', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: {
          approve_by: '2025-10-20T13:00:00Z',
          handover_by: '2025-10-20T15:00:00Z',
        },
        error: null,
      });

      mockSupabaseClient.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.submitForApproval('123e4567-e89b-12d3-a456-426614174000')
      ).resolves.not.toThrow();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('calculate_custody_sla', {
        p_custody_id: '123e4567-e89b-12d3-a456-426614174000',
      });
    });
  });

  describe('approveCustody', () => {
    it('should approve a custody transaction', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.approveCustody(
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174005',
          'Approved'
        )
      ).resolves.not.toThrow();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('custody_transactions');
    });
  });

  describe('rejectCustody', () => {
    it('should reject a custody transaction', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.rejectCustody(
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174005',
          'Rejected due to incomplete information'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('closeCustody', () => {
    it('should close a custody transaction', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.closeCustody(
          '123e4567-e89b-12d3-a456-426614174000',
          {
            actual_return_date: '2025-10-25T10:00:00Z',
            return_odometer: 50000,
          },
          '123e4567-e89b-12d3-a456-426614174005'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('voidCustody', () => {
    it('should void a custody transaction', async () => {
      mockSupabaseClient.from().update().eq.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        custodyApi.voidCustody(
          '123e4567-e89b-12d3-a456-426614174000',
          'Customer cancelled',
          '123e4567-e89b-12d3-a456-426614174005'
        )
      ).resolves.not.toThrow();
    });
  });
});
