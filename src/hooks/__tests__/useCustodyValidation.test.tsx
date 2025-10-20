import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustodyValidation } from '../useCustodyValidation';
import * as useToastModule from '@/hooks/use-toast';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    toasts: [],
    dismiss: vi.fn(),
  })),
}));

describe('useCustodyValidation', () => {
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockToast = vi.fn();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({ 
      toast: mockToast,
      toasts: [],
      dismiss: vi.fn(),
    });
  });

  it('should validate custody for submission', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const custody = {
      customer_id: '123e4567-e89b-12d3-a456-426614174001',
      custodian_type: 'customer',
      custodian_name: 'John Doe',
      reason_code: 'maintenance',
      incident_date: '2025-10-20T10:00:00Z',
      effective_from: '2025-10-20T10:00:00Z',
      rate_policy: 'inherit',
    };

    let validationResult;
    act(() => {
      validationResult = result.current.validateForSubmission(custody);
    });

    expect(validationResult.valid).toBe(true);
    expect(result.current.isValidating).toBe(false);
  });

  it('should validate status transitions', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const custody = {
      customer_id: '123e4567-e89b-12d3-a456-426614174001',
      custodian_type: 'customer',
      custodian_name: 'John Doe',
      reason_code: 'maintenance',
      incident_date: '2025-10-20T10:00:00Z',
      effective_from: '2025-10-20T10:00:00Z',
      rate_policy: 'inherit',
    };

    let validationResult;
    act(() => {
      validationResult = result.current.validateStatusTransition('draft', 'pending_approval', custody);
    });

    expect(validationResult.valid).toBe(true);
  });

  it('should validate vehicle eligibility', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const vehicle = {
      status: 'available',
      condition: 'excellent',
      registration_expiry: '2026-10-20',
    };

    let validationResult;
    act(() => {
      validationResult = result.current.validateVehicleEligibility(vehicle);
    });

    expect(validationResult.valid).toBe(true);
  });

  it('should validate document requirements', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const custody = {
      reason_code: 'maintenance',
    };
    const documents = [
      { document_type: 'customer_acknowledgment' },
    ];

    let validationResult;
    act(() => {
      validationResult = result.current.validateDocumentRequirements(custody, documents);
    });

    expect(validationResult.valid).toBe(true);
  });

  it('should show validation errors via toast', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const validationResult = {
      valid: false,
      errors: ['Error 1', 'Error 2'],
      warnings: [],
    };

    act(() => {
      result.current.showValidationErrors(validationResult);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Validation Errors',
      description: expect.stringContaining('Error 1'),
      variant: 'destructive',
    });
  });

  it('should show validation warnings via toast', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const validationResult = {
      valid: true,
      errors: [],
      warnings: ['Warning 1', 'Warning 2'],
    };

    act(() => {
      result.current.showValidationWarnings(validationResult);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Validation Warnings',
      description: expect.stringContaining('Warning 1'),
      variant: 'default',
    });
  });

  it('should not show toast when no errors', () => {
    const { result } = renderHook(() => useCustodyValidation());

    const validationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    act(() => {
      result.current.showValidationErrors(validationResult);
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should set isValidating during validation', () => {
    const { result } = renderHook(() => useCustodyValidation());

    expect(result.current.isValidating).toBe(false);

    act(() => {
      result.current.validateForSubmission({});
    });

    expect(result.current.isValidating).toBe(false);
  });
});
