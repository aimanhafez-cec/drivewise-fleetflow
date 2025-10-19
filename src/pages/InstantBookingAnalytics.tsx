import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StandardLineChart, StandardBarChart, StandardPieChart } from '@/components/charts';
import { formatCurrency, formatDate } from '@/lib/utils/chartUtils';
import { Calendar as CalendarIcon, Download, TrendingUp, DollarSign, Users, Clock } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const InstantBookingAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Fetch bookings data
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['instant-booking-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          created_at,
          start_datetime,
          end_datetime,
          total_amount,
          status,
          auto_approved,
          booking_type,
          customers (
            name
          ),
          vehicles (
            make,
            model,
            category_id,
            categories (
              name
            )
          )
        `)
        .eq('booking_type', 'INSTANT')
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Calculate metrics
  const metrics = {
    totalBookings: bookingsData?.length || 0,
    totalRevenue: bookingsData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
    avgBookingValue: bookingsData?.length 
      ? (bookingsData.reduce((sum, b) => sum + (b.total_amount || 0), 0) / bookingsData.length)
      : 0,
    autoApprovalRate: bookingsData?.length
      ? ((bookingsData.filter(b => b.auto_approved).length / bookingsData.length) * 100)
      : 0,
    completedBookings: bookingsData?.filter(b => b.status === 'completed').length || 0,
    pendingBookings: bookingsData?.filter(b => b.status === 'pending').length || 0,
    cancelledBookings: bookingsData?.filter(b => b.status === 'cancelled').length || 0,
  };

  // Daily bookings trend
  const dailyTrend = bookingsData?.reduce((acc, booking) => {
    const date = format(new Date(booking.created_at), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { date, bookings: 0, revenue: 0 };
    }
    acc[date].bookings += 1;
    acc[date].revenue += booking.total_amount || 0;
    return acc;
  }, {} as Record<string, { date: string; bookings: number; revenue: number }>);

  const trendData = Object.values(dailyTrend || {});

  // Status distribution
  const statusData = [
    { name: 'Completed', value: metrics.completedBookings, fill: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: metrics.pendingBookings, fill: 'hsl(var(--chart-2))' },
    { name: 'Cancelled', value: metrics.cancelledBookings, fill: 'hsl(var(--chart-3))' }
  ].filter(item => item.value > 0);

  // Vehicle category distribution
  const categoryData = bookingsData?.reduce((acc, booking) => {
    const category = (booking.vehicles as any)?.categories?.name || 'Unassigned';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData || {}).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  // Revenue by hour distribution
  const hourlyData = bookingsData?.reduce((acc, booking) => {
    const hour = new Date(booking.created_at).getHours();
    const hourLabel = `${hour}:00`;
    if (!acc[hourLabel]) {
      acc[hourLabel] = { hour: hourLabel, bookings: 0, revenue: 0 };
    }
    acc[hourLabel].bookings += 1;
    acc[hourLabel].revenue += booking.total_amount || 0;
    return acc;
  }, {} as Record<string, { hour: string; bookings: number; revenue: number }>);

  const hourlyChartData = Object.values(hourlyData || {}).sort((a, b) => 
    parseInt(a.hour) - parseInt(b.hour)
  );

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Booking ID', 'Customer', 'Vehicle', 'Amount', 'Status', 'Auto-Approved'],
      ...(bookingsData || []).map(b => [
        format(new Date(b.created_at), 'yyyy-MM-dd HH:mm'),
        b.id,
        (b.customers as any)?.name || '',
        `${(b.vehicles as any)?.make || ''} ${(b.vehicles as any)?.model || ''}`,
        b.total_amount?.toString() || '0',
        b.status,
        b.auto_approved ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instant-bookings-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Instant Booking Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                  : 'Select date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({ from: range.from, to: range.to || range.from });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <TrendingUp className="h-4 w-4 text-chart-1" />
                </div>
                <p className="text-3xl font-bold text-foreground">{metrics.totalBookings}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.completedBookings} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <DollarSign className="h-4 w-4 text-chart-2" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  AED {metrics.totalRevenue.toLocaleString('en-AE', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: AED {metrics.avgBookingValue.toLocaleString('en-AE', { minimumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Auto-Approval Rate</p>
                  <Clock className="h-4 w-4 text-chart-3" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.autoApprovalRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {bookingsData?.filter(b => b.auto_approved).length || 0} auto-approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <Users className="h-4 w-4 text-chart-4" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {metrics.totalBookings > 0 
                    ? ((metrics.completedBookings / metrics.totalBookings) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.cancelledBookings} cancelled
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trend</CardTitle>
            <CardDescription>Daily bookings and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <StandardLineChart
                data={trendData}
                xAxisKey="date"
                config={{
                  bookings: { label: 'Bookings', color: 'hsl(var(--chart-1))' },
                  revenue: { label: 'Revenue (AED)', color: 'hsl(var(--chart-2))' }
                }}
                lines={[
                  { dataKey: 'bookings', name: 'Bookings' },
                  { dataKey: 'revenue', name: 'Revenue (AED)' }
                ]}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Breakdown by booking status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <StandardPieChart
                data={statusData}
                config={{
                  completed: { label: 'Completed', color: 'hsl(var(--chart-1))' },
                  pending: { label: 'Pending', color: 'hsl(var(--chart-2))' },
                  cancelled: { label: 'Cancelled', color: 'hsl(var(--chart-3))' }
                }}
                nameKey="name"
                dataKey="value"
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Vehicle Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Category Performance</CardTitle>
            <CardDescription>Bookings by vehicle category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <StandardBarChart
                data={categoryChartData}
                xAxisKey="name"
                config={{
                  value: { label: 'Bookings', color: 'hsl(var(--chart-1))' }
                }}
                bars={[
                  { dataKey: 'value', name: 'Bookings' }
                ]}
                height={300}
              />
            )}
          </CardContent>
        </Card>

        {/* Hourly Booking Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Booking Pattern</CardTitle>
            <CardDescription>Bookings by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <StandardBarChart
                data={hourlyChartData}
                xAxisKey="hour"
                config={{
                  bookings: { label: 'Bookings', color: 'hsl(var(--chart-1))' },
                  revenue: { label: 'Revenue (AED)', color: 'hsl(var(--chart-2))' }
                }}
                bars={[
                  { dataKey: 'bookings', name: 'Bookings' },
                  { dataKey: 'revenue', name: 'Revenue (AED)' }
                ]}
                height={300}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstantBookingAnalytics;
