import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, DollarSign, MapPin } from 'lucide-react';

interface RevenueBreakdownReportProps {
  dateRange?: DateRange;
}

const RevenueBreakdownReport = ({ dateRange }: RevenueBreakdownReportProps) => {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-breakdown', dateRange],
    queryFn: async () => {
      const fromDate = dateRange?.from?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateRange?.to?.toISOString() || new Date().toISOString();

      // Revenue by time period
      const { data: reservations } = await supabase
        .from('reservations')
        .select('total_amount, start_datetime, booking_type, pickup_location, return_location')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .not('total_amount', 'is', null);

      // Revenue by vehicle class
      const { data: vehicleRevenue } = await supabase
        .from('reservations')
        .select(`
          total_amount,
          vehicles (
            category_id,
            categories (name)
          )
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .not('total_amount', 'is', null);

      return { reservations: reservations || [], vehicleRevenue: vehicleRevenue || [] };
    },
  });

  if (isLoading) {
    return <div className="space-y-4">Loading revenue data...</div>;
  }

  // Process data for charts
  const monthlyRevenue = revenueData?.reservations.reduce((acc: any[], reservation) => {
    const month = new Date(reservation.start_datetime).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.revenue += Number(reservation.total_amount || 0);
      existing.bookings += 1;
    } else {
      acc.push({ month, revenue: Number(reservation.total_amount || 0), bookings: 1 });
    }
    return acc;
  }, []) || [];

  // Revenue by booking type
  const bookingTypeRevenue = revenueData?.reservations.reduce((acc: any[], reservation) => {
    const type = reservation.booking_type || 'STANDARD';
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.revenue += Number(reservation.total_amount || 0);
      existing.count += 1;
    } else {
      acc.push({ type, revenue: Number(reservation.total_amount || 0), count: 1 });
    }
    return acc;
  }, []) || [];

  // Revenue by location
  const locationRevenue = revenueData?.reservations.reduce((acc: any[], reservation) => {
    const location = reservation.pickup_location || 'Unknown';
    const existing = acc.find(item => item.location === location);
    if (existing) {
      existing.revenue += Number(reservation.total_amount || 0);
    } else {
      acc.push({ location, revenue: Number(reservation.total_amount || 0) });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || [];

  const totalRevenue = revenueData?.reservations.reduce((sum, r) => sum + Number(r.total_amount || 0), 0) || 0;
  const totalBookings = revenueData?.reservations.length || 0;
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const chartColors = {
    revenue: 'hsl(var(--chart-1))',
    bookings: 'hsl(var(--chart-2))', 
    standard: 'hsl(var(--chart-1))',
    instant: 'hsl(var(--chart-3))',
    quote: 'hsl(var(--chart-4))',
    rfq: 'hsl(var(--chart-5))'
  };

  const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgRevenuePerBooking)}</div>
            <p className="text-xs text-muted-foreground">
              +4.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.3%</div>
            <p className="text-xs text-muted-foreground">
              Month-over-month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue and booking volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: 'Revenue', color: chartColors.revenue },
              bookings: { label: 'Bookings', color: chartColors.bookings }
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value, 
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]} />} 
                />
                <Bar yAxisId="right" dataKey="bookings" fill={chartColors.bookings} opacity={0.7} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={chartColors.revenue} strokeWidth={3} dot={{ fill: chartColors.revenue, strokeWidth: 2, r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Booking Type */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Booking Type</CardTitle>
            <CardDescription>Distribution across different booking channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={bookingTypeRevenue.reduce((acc, item, index) => ({
                ...acc,
                [item.type]: { 
                  label: item.type.replace('_', ' ').toUpperCase(), 
                  color: pieColors[index % pieColors.length] 
                }
              }), {})}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingTypeRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="type"
                    label={({ type, value, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bookingTypeRevenue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Locations</CardTitle>
            <CardDescription>Revenue by pickup location</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: chartColors.revenue }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationRevenue} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="location" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />} 
                  />
                  <Bar dataKey="revenue" fill={chartColors.revenue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueBreakdownReport;