import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { StandardLineChart, StandardBarChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils/currency';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ReservationsReportProps {
  dateRange?: DateRange;
}

export default function ReservationsReport({ dateRange }: ReservationsReportProps) {
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations-report', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('id, customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, status, total_amount');

      if (dateRange?.from) {
        query = query.gte('start_datetime', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('start_datetime', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, status');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  // Calculate reservation statistics
  const activeReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'checked_out').length;
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const completedReservations = reservations.filter(r => r.status === 'completed').length;

  // Calculate occupancy rate
  const totalVehicles = vehicles.length;
  const occupancyRate = totalVehicles > 0 ? Math.round((activeReservations / totalVehicles) * 100) : 0;

  // Generate daily booking trends for current week
  const today = new Date();
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  
  const dailyTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayBookings = reservations.filter(r => {
      if (!r.start_datetime) return false;
      const reservationDate = new Date(r.start_datetime);
      return reservationDate.toDateString() === date.toDateString();
    }).length;

    return {
      day: dayName,
      bookings: dayBookings
    };
  });

  // Calculate bookings by location
  const locationBookings = reservations.reduce((acc: Record<string, { bookings: number; revenue: number }>, reservation) => {
    const location = reservation.pickup_location || 'Unknown';
    if (!acc[location]) {
      acc[location] = { bookings: 0, revenue: 0 };
    }
    acc[location].bookings += 1;
    acc[location].revenue += Number(reservation.total_amount) || 0;
    return acc;
  }, {});

  const locationData = Object.entries(locationBookings).map(([location, data]) => ({
    location,
    bookings: data.bookings,
    revenue: data.revenue
  })).sort((a, b) => b.bookings - a.bookings);

  // Check for potential overbookings
  const overbookings = reservations.filter(reservation => {
    if (!reservation.vehicle_id || !reservation.start_datetime || !reservation.end_datetime) {
      return false;
    }

    const conflictingReservations = reservations.filter(other => {
      if (other.id === reservation.id || other.vehicle_id !== reservation.vehicle_id) {
        return false;
      }
      if (!other.start_datetime || !other.end_datetime) {
        return false;
      }

      const start1 = new Date(reservation.start_datetime!);
      const end1 = new Date(reservation.end_datetime!);
      const start2 = new Date(other.start_datetime);
      const end2 = new Date(other.end_datetime);

      return (start1 < end2 && end1 > start2);
    });

    return conflictingReservations.length > 0;
  });

  // Get upcoming reservations (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const upcomingReservations = reservations.filter(r => {
    if (!r.start_datetime) return false;
    const startDate = new Date(r.start_datetime);
    return startDate >= new Date() && startDate <= nextWeek;
  }).slice(0, 10);

  const trendsConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-1))",
    },
  };

  const locationConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--chart-2))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{occupancyRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Overbooking Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overbookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overbooking Alert */}
      {overbookings.length > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-white">
            Warning: {overbookings.length} potential overbooking conflict(s) detected. Please review vehicle assignments.
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Daily Booking Trends</CardTitle>
            <CardDescription className="text-gray-300">
              Bookings for the current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StandardLineChart
              data={dailyTrends}
              config={trendsConfig}
              height={300}
              xAxisKey="day"
              lines={[{ dataKey: "bookings", name: "Bookings" }]}
              showLegend={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Bookings by Location</CardTitle>
            <CardDescription className="text-gray-300">
              Reservation volume and revenue by pickup location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StandardBarChart
              data={locationData.slice(0, 5)}
              config={locationConfig}
              height={300}
              xAxisKey="location"
              bars={[
                { dataKey: "bookings", name: "Bookings" },
                { dataKey: "revenue", name: "Revenue" }
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Upcoming Reservations</CardTitle>
          <CardDescription className="text-gray-300">
            Reservations starting in the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Start Date</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="text-white">
                    {reservation.start_datetime ? 
                      new Date(reservation.start_datetime).toLocaleDateString() : 'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-white">{reservation.pickup_location || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{formatCurrency(Number(reservation.total_amount) || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overbooking Details */}
      {overbookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Overbooking Conflicts</CardTitle>
            <CardDescription className="text-gray-300">
              Vehicles with overlapping reservations that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Vehicle</TableHead>
                  <TableHead className="text-white">Start Date</TableHead>
                  <TableHead className="text-white">End Date</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overbookings.slice(0, 10).map((reservation) => {
                  const vehicle = vehicles.find(v => v.id === reservation.vehicle_id);
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell className="text-white">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                      </TableCell>
                      <TableCell className="text-white">
                        {reservation.start_datetime ? 
                          new Date(reservation.start_datetime).toLocaleDateString() : 'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-white">
                        {reservation.end_datetime ? 
                          new Date(reservation.end_datetime).toLocaleDateString() : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{reservation.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}