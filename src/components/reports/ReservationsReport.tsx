import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimpleBarChart } from '@/components/charts';
import { Calendar, Car, AlertTriangle, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReservationsReportProps {
  dateRange: { from: Date; to: Date };
  filters: {
    branch: string;
    vehicleType: string;
    status: string;
  };
}

const ReservationsReport: React.FC<ReservationsReportProps> = ({ dateRange, filters }) => {
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations-report', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_datetime', dateRange.from.toISOString())
        .lte('end_datetime', dateRange.to.toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading reservations data...</div>;
  }

  // Calculate KPIs
  const upcomingBookings = reservations.filter(r => r.status === 'confirmed').length;
  const availableFleet = 15; // Mock data
  const overbookingAlerts = 2; // Mock data
  const totalReservations = reservations.length;

  // Mock availability data by location
  const availabilityData = [
    { location: 'Downtown', available: 8, booked: 12, overbooked: 1 },
    { location: 'Airport', available: 5, booked: 18, overbooked: 2 },
    { location: 'Mall', available: 12, booked: 6, overbooked: 0 },
    { location: 'North Branch', available: 9, booked: 10, overbooked: 0 }
  ];

  const upcomingReservations = [
    {
      bookingId: 'B001',
      customer: 'John Smith',
      vehicle: 'Toyota Camry',
      pickupDate: '2024-02-15',
      returnDate: '2024-02-18',
      branch: 'Downtown',
      status: 'confirmed'
    },
    {
      bookingId: 'B002',
      customer: 'Sarah Johnson',
      vehicle: 'Honda Civic',
      pickupDate: '2024-02-16',
      returnDate: '2024-02-20',
      branch: 'Airport',
      status: 'confirmed'
    },
    {
      bookingId: 'B003',
      customer: 'Mike Wilson',
      vehicle: 'Nissan Altima',
      pickupDate: '2024-02-17',
      returnDate: '2024-02-19',
      branch: 'Mall',
      status: 'pending'
    }
  ];

  const kpiCards = [
    {
      title: 'Upcoming Bookings',
      value: upcomingBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available Fleet',
      value: availableFleet,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Overbooking Alerts',
      value: overbookingAlerts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Reservations',
      value: totalReservations,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservations & Availability</h1>
        <p className="text-muted-foreground">Booking overview and fleet availability tracking</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-lg font-bold text-card-foreground">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Availability Heatmap */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Availability by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={availabilityData}
            xAxisKey="location"
            bars={[
              { dataKey: 'available', name: 'Available', color: 'hsl(var(--chart-1))' },
              { dataKey: 'booked', name: 'Booked', color: 'hsl(var(--chart-2))' },
              { dataKey: 'overbooked', name: 'Overbooked', color: 'hsl(var(--chart-3))' }
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Upcoming Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Booking ID</TableHead>
                <TableHead className="text-muted-foreground">Customer</TableHead>
                <TableHead className="text-muted-foreground">Vehicle</TableHead>
                <TableHead className="text-muted-foreground">Pick-up Date</TableHead>
                <TableHead className="text-muted-foreground">Return Date</TableHead>
                <TableHead className="text-muted-foreground">Branch</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingReservations.map((reservation) => (
                <TableRow key={reservation.bookingId} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-mono text-sm text-card-foreground">{reservation.bookingId}</TableCell>
                  <TableCell className="text-card-foreground">{reservation.customer}</TableCell>
                  <TableCell className="text-card-foreground">{reservation.vehicle}</TableCell>
                  <TableCell className="text-muted-foreground">{reservation.pickupDate}</TableCell>
                  <TableCell className="text-muted-foreground">{reservation.returnDate}</TableCell>
                  <TableCell className="text-muted-foreground">{reservation.branch}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationsReport;