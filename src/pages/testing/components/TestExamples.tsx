import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TestExamples = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Examples & Patterns</CardTitle>
          <CardDescription>Common testing patterns and best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unit" className="space-y-4">
            <TabsList>
              <TabsTrigger value="unit">Unit Tests</TabsTrigger>
              <TabsTrigger value="integration">Integration Tests</TabsTrigger>
              <TabsTrigger value="hooks">Hook Tests</TabsTrigger>
              <TabsTrigger value="api">API Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="unit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Component Rendering Test</h4>
                    <Badge>Recommended</Badge>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    await userEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Utility Function Test</h4>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { formatCurrency } from '@/lib/utils/chartUtils'

describe('formatCurrency', () => {
  it('formats numbers as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
    expect(formatCurrency(0)).toBe('$0')
    expect(formatCurrency(-500)).toBe('-$500')
  })
})`}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Form Submission Test</h4>
                    <Badge>Best Practice</Badge>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReservationForm from '@/components/ReservationForm'

describe('ReservationForm Integration', () => {
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn()
    render(<ReservationForm onSubmit={onSubmit} />)

    // Fill in form fields
    await userEvent.type(
      screen.getByLabelText('Customer Name'),
      'John Doe'
    )
    await userEvent.selectOptions(
      screen.getByLabelText('Vehicle'),
      'Toyota Camry'
    )

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Assert
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        customerName: 'John Doe',
        vehicle: 'Toyota Camry'
      })
    })
  })
})`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">API Mock Test</h4>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReservationList from '@/components/ReservationList'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ReservationList with API', () => {
  it('loads and displays reservations', async () => {
    render(<ReservationList />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('RES-000001')).toBeInTheDocument()
    })
  })
})`}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hooks" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Custom Hook Test</h4>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { renderHook, waitFor } from '@testing-library/react'
import { useReservationAnalytics } from '@/hooks/useReservationAnalytics'

describe('useReservationAnalytics', () => {
  it('fetches and processes analytics data', async () => {
    const { result } = renderHook(() => useReservationAnalytics())

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify data structure
    expect(result.current.metrics).toHaveProperty('totalReservations')
    expect(result.current.metrics).toHaveProperty('totalRevenue')
    expect(Array.isArray(result.current.trends)).toBe(true)
  })
})`}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">API Service Test</h4>
                    <Badge variant="outline">Mocked</Badge>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { describe, it, expect, vi } from 'vitest'
import { reservationsApi } from '@/lib/api/reservations'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('Reservations API', () => {
  it('fetches reservations successfully', async () => {
    const mockData = [
      { id: '1', ro_number: 'RES-000001', status: 'confirmed' }
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: mockData,
        error: null
      })
    })

    const result = await reservationsApi.getAll()
    
    expect(result).toEqual(mockData)
    expect(supabase.from).toHaveBeenCalledWith('reservations')
  })
})`}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Testing Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-l-success rounded-lg bg-success/5">
              <p className="font-semibold text-success mb-1">✓ Do: Test user behavior</p>
              <p className="text-sm text-muted-foreground">Focus on how users interact with your components</p>
            </div>
            <div className="p-4 border-l-4 border-l-success rounded-lg bg-success/5">
              <p className="font-semibold text-success mb-1">✓ Do: Use meaningful test descriptions</p>
              <p className="text-sm text-muted-foreground">Write tests that clearly describe what they're testing</p>
            </div>
            <div className="p-4 border-l-4 border-l-destructive rounded-lg bg-destructive/5">
              <p className="font-semibold text-destructive mb-1">✗ Don't: Test implementation details</p>
              <p className="text-sm text-muted-foreground">Avoid testing internal state or methods directly</p>
            </div>
            <div className="p-4 border-l-4 border-l-destructive rounded-lg bg-destructive/5">
              <p className="font-semibold text-destructive mb-1">✗ Don't: Write flaky tests</p>
              <p className="text-sm text-muted-foreground">Ensure tests are deterministic and reliable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestExamples;
