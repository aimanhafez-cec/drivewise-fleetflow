import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TestUtilities = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Testing Utilities</CardTitle>
          <CardDescription>Helper functions and utilities for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Render Function */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">Custom Render with Providers</h4>
              <Badge>Core Utility</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Wrap components with necessary providers (Router, Query Client, Theme, etc.)
            </p>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`// src/lib/test-utils.tsx
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Usage:
// renderWithProviders(<MyComponent />)`}
            </pre>
          </div>

          {/* Mock Data Generator */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">Mock Data Generator</h4>
              <Badge variant="secondary">Data Helper</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Generate realistic mock data for testing
            </p>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`// src/lib/test-data.ts
export const mockReservation = (overrides = {}) => ({
  id: 'test-reservation-1',
  ro_number: 'RES-000001',
  customer_id: 'test-customer-1',
  vehicle_id: 'test-vehicle-1',
  status: 'confirmed',
  total_amount: 2500,
  start_datetime: '2025-10-20T10:00:00Z',
  end_datetime: '2025-10-25T10:00:00Z',
  created_at: '2025-10-15T08:00:00Z',
  ...overrides
})

export const mockCustomer = (overrides = {}) => ({
  id: 'test-customer-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+971501234567',
  ...overrides
})

// Usage:
// const reservation = mockReservation({ status: 'cancelled' })`}
            </pre>
          </div>

          {/* Wait For Utility */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">Wait For Elements</h4>
              <Badge variant="outline">Async Helper</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Helper for waiting for async operations and elements
            </p>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { screen, waitFor } from '@testing-library/react'

// Wait for element to appear
export const waitForElement = async (text: string) => {
  return await waitFor(() => 
    screen.getByText(text)
  )
}

// Wait for loading to finish
export const waitForLoadingToFinish = async () => {
  return await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Usage:
// await waitForElement('Success')
// await waitForLoadingToFinish()`}
            </pre>
          </div>

          {/* User Event Helpers */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">User Event Helpers</h4>
              <Badge>Interaction</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Common user interaction patterns
            </p>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

export const fillForm = async (fields: Record<string, string>) => {
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(label)
    await userEvent.clear(input)
    await userEvent.type(input, value)
  }
}

export const selectOption = async (label: string, option: string) => {
  const select = screen.getByLabelText(label)
  await userEvent.selectOptions(select, option)
}

// Usage:
// await fillForm({ 'Email': 'test@example.com', 'Name': 'Test User' })
// await selectOption('Status', 'confirmed')`}
            </pre>
          </div>

          {/* Setup/Teardown Helpers */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">Setup & Teardown Helpers</h4>
              <Badge variant="secondary">Lifecycle</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Common test lifecycle patterns
            </p>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { beforeEach, afterEach, vi } from 'vitest'

// Mock localStorage
export const setupLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
  global.localStorage = localStorageMock as any
  return localStorageMock
}

// Reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

// Common beforeEach/afterEach
beforeEach(() => {
  setupLocalStorage()
})

afterEach(() => {
  resetAllMocks()
})`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>vitest.config.ts setup</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestUtilities;
