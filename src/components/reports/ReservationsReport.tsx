import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Calendar, TrendingUp, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { MONTHLY_TRENDS_CONFIG } from '@/lib/chartConfig';
import { formatNumber } from '@/lib/utils/chartUtils';

interface ReservationsReportProps {
  dateRange?: DateRange;
}

const ReservationsReport = ({ dateRange }: ReservationsReportProps) => {
  // Fetch reservations
  const { data: reservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations-report', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select(`
          id,
          customer_id,
          vehicle_id,
          start_datetime,
          end_datetime,
          status,
          pickup_location,
          return_location,
          total_amount,
          created_at
        `);
      
      if (dateRange?.from) {
        query = query.gte('start_datetime', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('end_datetime', dateRange.to.toISOString());
      }

      const { data, error } = await query.order('start_datetime', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch vehicles for availability calculation
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles-availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate, status, location')
        .order('make, model');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (loadingReservations || loadingVehicles) {
    return <div>Loading reservations report...</div>;
  }

  // Calculate statistics
  const activeReservations = reservations.filter(r => r.status === 'confirmed' || r.status === 'checked_out');
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  
  // Calculate occupancy rate
  const totalVehicles = vehicles.length;
  const occupiedVehicles = activeReservations.length;
  const occupancyRate = totalVehicles > 0 ? Math.round((occupiedVehicles / totalVehicles) * 100) : 0;

  // Generate daily booking trend
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const dailyBookings = weekDays.map(day => {
    const dayBookings = reservations.filter(r => 
      r.start_datetime && isSameDay(new Date(r.start_datetime), day)
    );
    
    return {
      day: format(day, 'EEE'),
      date: format(day, 'MMM dd'),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, r) => sum + (r.total_amount || 0), 0),
    };
  });

  // Location breakdown
  const locationStats = reservations.reduce((acc, reservation) => {
    const location = reservation.pickup_location || 'Unknown';
    if (!acc[location]) {
      acc[location] = { bookings: 0, revenue: 0 };
    }
    acc[location].bookings++;
    acc[location].revenue += reservation.total_amount || 0;
    return acc;
  }, {} as Record<string, { bookings: number; revenue: number }>);

  const locationData = Object.entries(locationStats).map(([location, stats]) => ({
    location,
    bookings: stats.bookings,
    revenue: stats.revenue,
  })).sort((a, b) => b.bookings - a.bookings);

  // Check for potential overbooking
  const vehicleBookings = reservations.reduce((acc, reservation) => {
    if (!reservation.vehicle_id || !reservation.start_datetime || !reservation.end_datetime) return acc;
    
    if (!acc[reservation.vehicle_id]) {
      acc[reservation.vehicle_id] = [];
    }
    
    acc[reservation.vehicle_id].push({
      start: new Date(reservation.start_datetime),
      end: new Date(reservation.end_datetime),
      id: reservation.id,
      status: reservation.status,
    });
    
    return acc;
  }, {} as Record<string, Array<{ start: Date; end: Date; id: string; status: string }>>);

  // Find overlapping reservations
  const overbookings = Object.entries(vehicleBookings).filter(([vehicleId, bookings]) => {
    const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
    
    for (let i = 0; i < activeBookings.length; i++) {
      for (let j = i + 1; j < activeBookings.length; j++) {
        const booking1 = activeBookings[i];
        const booking2 = activeBookings[j];
        
        // Check for overlap
        if (booking1.start < booking2.end && booking2.start < booking1.end) {
          return true;
        }
      }
    }
    
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Reservations Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations.length}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">{occupiedVehicles} of {totalVehicles} vehicles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overbooking Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overbookings.length}</div>
            <p className="text-xs text-muted-foreground">Conflicts detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Booking Trend</CardTitle>
            <CardDescription>Reservations created per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={MONTHLY_TRENDS_CONFIG}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <AreaChart data={dailyBookings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke={MONTHLY_TRENDS_CONFIG.bookings.color}
                    fill={MONTHLY_TRENDS_CONFIG.bookings.color}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Location</CardTitle>
            <CardDescription>Popular pickup locations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: { label: "Bookings", color: "hsl(142, 76%, 36%)" },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <BarChart data={locationData.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="location" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} 
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="hsl(142, 76%, 36%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reservations</CardTitle>
          <CardDescription>Next 20 reservations scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Pickup Location</TableHead>
                <TableHead>Return Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations
                .filter(r => r.start_datetime && new Date(r.start_datetime) >= new Date())
                .slice(0, 20)
                .map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-mono text-sm">
                    {reservation.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {reservation.start_datetime 
                      ? format(new Date(reservation.start_datetime), 'MMM dd, yyyy HH:mm')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {reservation.end_datetime 
                      ? format(new Date(reservation.end_datetime), 'MMM dd, yyyy HH:mm')
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{reservation.pickup_location || 'Not specified'}</TableCell>
                  <TableCell>{reservation.return_location || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      reservation.status === 'confirmed' ? 'default' :
                      reservation.status === 'pending' ? 'outline' :
                      reservation.status === 'completed' ? 'secondary' :
                      'destructive'
                    }>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(reservation.total_amount || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overbooking Alerts */}
      {overbookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Overbooking Alerts</CardTitle>
            <CardDescription>Vehicles with conflicting reservations that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overbookings.map(([vehicleId, bookings]) => {
                const vehicle = vehicles.find(v => v.id === vehicleId);
                const conflictingBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
                
                return (
                  <div key={vehicleId} className="border border-destructive/20 rounded-lg p-4">
                    <div className="font-medium mb-2">
                      {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})` : 'Unknown Vehicle'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {conflictingBookings.length} overlapping reservations detected
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReservationsReport;