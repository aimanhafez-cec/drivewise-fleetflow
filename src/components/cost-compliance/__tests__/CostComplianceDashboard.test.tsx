import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CostComplianceDashboard } from '../CostComplianceDashboard';
import { useCostComplianceDashboard } from '@/hooks/useCostCompliance';

// Mock the hooks
vi.mock('@/hooks/useCostCompliance', () => ({
  useCostComplianceDashboard: vi.fn(),
}));

describe('CostComplianceDashboard', () => {
  const mockOnTabChange = vi.fn();

  it('should render loading state', () => {
    vi.mocked(useCostComplianceDashboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CostComplianceDashboard onTabChange={mockOnTabChange} />);

    expect(container.textContent).toContain('Loading');
  });

  it('should render error state', () => {
    vi.mocked(useCostComplianceDashboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load'),
    } as any);

    const { container } = render(<CostComplianceDashboard onTabChange={mockOnTabChange} />);

    expect(container.textContent).toMatch(/failed to load/i);
  });

  it('should render dashboard with statistics', () => {
    const mockStats = {
      total_expenses: 100,
      total_tolls_fines: 150,
      pending_tolls_fines: 50,
      total_exceptions: 25,
      open_exceptions: 10,
      awaiting_approval: 5,
      total_billing_cycles: 8,
      pending_billing_amount: 12500.5,
      recent_activity: [],
    };

    vi.mocked(useCostComplianceDashboard).mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CostComplianceDashboard onTabChange={mockOnTabChange} />);

    // Check if key metrics are displayed in the container
    expect(container.textContent).toContain('150');
    expect(container.textContent).toContain('25');
    expect(container.textContent).toContain('8');
  });

  it('should display quick action buttons', () => {
    const mockStats = {
      total_expenses: 100,
      total_tolls_fines: 150,
      pending_tolls_fines: 50,
      total_exceptions: 25,
      open_exceptions: 10,
      awaiting_approval: 5,
      total_billing_cycles: 8,
      pending_billing_amount: 12500.5,
      recent_activity: [],
    };

    vi.mocked(useCostComplianceDashboard).mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CostComplianceDashboard onTabChange={mockOnTabChange} />);

    // Check for quick action buttons in the container
    expect(container.textContent).toMatch(/new toll.*fine/i);
    expect(container.textContent).toMatch(/generate billing/i);
  });

  it('should format currency values correctly', () => {
    const mockStats = {
      total_expenses: 100,
      total_tolls_fines: 150,
      pending_tolls_fines: 50,
      total_exceptions: 25,
      open_exceptions: 10,
      awaiting_approval: 5,
      total_billing_cycles: 8,
      pending_billing_amount: 12500.5,
      recent_activity: [],
    };

    vi.mocked(useCostComplianceDashboard).mockReturnValue({
      data: mockStats,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CostComplianceDashboard onTabChange={mockOnTabChange} />);

    // Check for formatted currency (should display as AED 12,500.50)
    expect(container.textContent).toMatch(/12,500\.50/);
  });
});
