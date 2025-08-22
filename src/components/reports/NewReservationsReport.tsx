import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimplePieChart, SimpleBarChart } from '@/components/charts/SimpleCharts';
import { DateRange } from 'react-day-picker';

interface NewReservationsReportProps {
  dateRange?: DateRange;
}

export const NewReservationsReport: React.FC<NewReservationsReportProps> = ({ dateRange }) => {
  // Fetch reservations data
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations-report', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('*');

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/20">
              <CardContent className="p-6">
                <div className="h-6 bg-white/20 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-white/20 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalReservations = reservations?.length || 0;
  const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;
  const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
  const cancelledReservations = reservations?.filter(r => r.status === 'cancelled').length || 0;

  // Status distribution for pie chart
  const statusCounts = reservations?.reduce((acc, reservation) => {
    const status = reservation.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count
  }));

  // Reservations by location
  const locationCounts = reservations?.reduce((acc, reservation) => {
    const location = reservation.pickup_location || 'Unknown';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const locationData = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 locations
    .map(([location, count]) => ({
      location: location.length > 20 ? location.substring(0, 20) + '...' : location,
      bookings: count
    }));

  // Reservations by booking type
  const bookingTypeCounts = reservations?.reduce((acc, reservation) => {
    const type = reservation.booking_type || 'STANDARD';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const bookingTypeData = Object.entries(bookingTypeCounts).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    count
  }));

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalReservations}</div>
            <p className="text-xs text-white/70">All bookings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{confirmedReservations}</div>
            <p className="text-xs text-white/70">Ready to proceed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingReservations}</div>
            <p className="text-xs text-white/70">Awaiting confirmation</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{cancelledReservations}</div>
            <p className="text-xs text-white/70">Cancelled bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Reservation Status Distribution</CardTitle>
            <CardDescription className="text-white/70">
              Breakdown of reservations by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={statusData} height={300} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Top Pickup Locations</CardTitle>
            <CardDescription className="text-white/70">
              Most popular pickup locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={locationData}
              xAxisKey="location"
              bars={[{ dataKey: 'bookings', name: 'Bookings' }]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Booking Type Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Booking Types</CardTitle>
            <CardDescription className="text-white/70">
              Distribution of booking types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingTypeData.map((item, index) => {
                const percentage = totalReservations > 0 ? (item.count / totalReservations * 100).toFixed(1) : '0';
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-white">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{item.count}</div>
                      <div className="text-white/70 text-sm">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Reservations</CardTitle>
            <CardDescription className="text-white/70">
              Latest booking activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {reservations?.slice(0, 10).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {reservation.pickup_location}
                    </div>
                    <div className="text-white/70 text-sm">
                      {new Date(reservation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(reservation.status)}>
                    {reservation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};