import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

const MockDataManager = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mock Data Manager</CardTitle>
          <CardDescription>Reusable mock data for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reservations Mock */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Reservation Mock Data</h4>
                <Badge>Core Entity</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(`export const mockReservations = [...]`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`export const mockReservations = [
  {
    id: '1',
    ro_number: 'RES-000001',
    customer_id: 'customer-1',
    vehicle_id: 'vehicle-1',
    status: 'confirmed',
    total_amount: 2500,
    start_datetime: '2025-10-20T10:00:00Z',
    end_datetime: '2025-10-25T10:00:00Z',
    pickup_location_id: 'location-1',
    dropoff_location_id: 'location-1',
    created_at: '2025-10-15T08:00:00Z'
  },
  {
    id: '2',
    ro_number: 'RES-000002',
    customer_id: 'customer-2',
    vehicle_id: 'vehicle-2',
    status: 'pending',
    total_amount: 3200,
    start_datetime: '2025-10-22T14:00:00Z',
    end_datetime: '2025-10-28T14:00:00Z',
    pickup_location_id: 'location-2',
    dropoff_location_id: 'location-3',
    created_at: '2025-10-16T10:30:00Z'
  }
]`}
            </pre>
          </div>

          {/* Vehicles Mock */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Vehicle Mock Data</h4>
                <Badge variant="secondary">Asset</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(`export const mockVehicles = [...]`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`export const mockVehicles = [
  {
    id: 'vehicle-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'White',
    plate_number: 'ABC-1234',
    status: 'available',
    daily_rate: 250,
    category_id: 'economy',
    mileage: 15000
  },
  {
    id: 'vehicle-2',
    make: 'BMW',
    model: 'X5',
    year: 2024,
    color: 'Black',
    plate_number: 'XYZ-5678',
    status: 'rented',
    daily_rate: 450,
    category_id: 'luxury',
    mileage: 8000
  }
]`}
            </pre>
          </div>

          {/* Customers Mock */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Customer Mock Data</h4>
                <Badge variant="outline">User</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(`export const mockCustomers = [...]`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`export const mockCustomers = [
  {
    id: 'customer-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+971501234567',
    license_no: 'LIC-123456',
    date_of_birth: '1990-05-15',
    nationality: 'UAE',
    total_bookings: 12,
    total_spent: 28500
  },
  {
    id: 'customer-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+971509876543',
    license_no: 'LIC-789012',
    date_of_birth: '1985-08-22',
    nationality: 'USA',
    total_bookings: 8,
    total_spent: 19200
  }
]`}
            </pre>
          </div>

          {/* Mock Factories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Mock Factory Functions</h4>
                <Badge>Generator</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(`export const createMockReservation = ...`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`// Factory functions for generating mock data
export const createMockReservation = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  ro_number: \`RES-\${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}\`,
  customer_id: 'default-customer',
  vehicle_id: 'default-vehicle',
  status: 'confirmed',
  total_amount: Math.floor(Math.random() * 5000) + 1000,
  start_datetime: new Date().toISOString(),
  end_datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockVehicle = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  color: 'White',
  plate_number: \`ABC-\${Math.floor(Math.random() * 10000)}\`,
  status: 'available',
  daily_rate: Math.floor(Math.random() * 500) + 100,
  mileage: Math.floor(Math.random() * 50000),
  ...overrides
})

// Usage:
// const reservation = createMockReservation({ status: 'cancelled' })
// const vehicle = createMockVehicle({ make: 'BMW', model: 'X5' })`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* MSW Handlers */}
      <Card>
        <CardHeader>
          <CardTitle>API Mocking with MSW</CardTitle>
          <CardDescription>Mock Service Worker setup for API testing</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { mockReservations, mockVehicles } from './data'

export const handlers = [
  http.get('/api/reservations', () => {
    return HttpResponse.json(mockReservations)
  }),
  
  http.get('/api/reservations/:id', ({ params }) => {
    const reservation = mockReservations.find(r => r.id === params.id)
    if (!reservation) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(reservation)
  }),
  
  http.post('/api/reservations', async ({ request }) => {
    const newReservation = await request.json()
    return HttpResponse.json(
      { ...newReservation, id: Math.random().toString() },
      { status: 201 }
    )
  })
]`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataManager;
