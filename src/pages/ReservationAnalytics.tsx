import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useReservationAnalytics } from '@/hooks/useReservationAnalytics';
import { ReservationKPICards } from '@/components/reservations/ReservationKPICards';
import { StandardLineChart } from '@/components/charts/StandardLineChart';
import { StandardBarChart } from '@/components/charts/StandardBarChart';
import { StandardPieChart } from '@/components/charts/StandardPieChart';
import { DEFAULT_CHART_CONFIG } from '@/lib/chartConfig';
import { formatCurrency } from '@/lib/utils/currency';

const ReservationAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const { data: analyticsData, isLoading, refetch } = useReservationAnalytics(dateRange);

  const handleExport = () => {
    if (!analyticsData) return;
    
    const csvContent = [
      ['Reservation Analytics Report'],
      ['Date Range', `${dateRange?.from ? format(dateRange.from, 'PP') : ''} - ${dateRange?.to ? format(dateRange.to, 'PP') : ''}`],
      [''],
      ['Metric', 'Value'],
      ['Total Reservations', analyticsData.metrics.totalReservations],
      ['Confirmed', analyticsData.metrics.confirmedReservations],
      ['Pending', analyticsData.metrics.pendingReservations],
      ['Cancelled', analyticsData.metrics.cancelledReservations],
      ['Completed', analyticsData.metrics.completedReservations],
      ['Total Revenue', formatCurrency(analyticsData.metrics.totalRevenue)],
      ['Average Booking Value', formatCurrency(analyticsData.metrics.averageBookingValue)],
      ['Conversion Rate', `${analyticsData.metrics.conversionRate.toFixed(1)}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservation-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const statusData = analyticsData?.statusDistribution 
    ? Object.entries(analyticsData.statusDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value
      }))
    : [];

  const bookingTypeData = analyticsData?.bookingTypeDistribution
    ? Object.entries(analyticsData.bookingTypeDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value
      }))
    : [];

  const locationData = analyticsData?.locations?.map(loc => ({
    location: loc.location.length > 20 ? loc.location.substring(0, 20) + '...' : loc.location,
    bookings: loc.count,
    revenue: loc.revenue
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservation Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into reservation performance and trends
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {analyticsData && (
        <ReservationKPICards metrics={analyticsData.metrics} isLoading={isLoading} />
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Trends</CardTitle>
            <CardDescription>Daily reservation and revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <StandardLineChart
              data={analyticsData?.trends || []}
              config={DEFAULT_CHART_CONFIG}
              xAxisKey="date"
              lines={[
                { dataKey: 'reservations', name: 'Reservations' },
                { dataKey: 'revenue', name: 'Revenue' }
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Status</CardTitle>
            <CardDescription>Distribution by booking status</CardDescription>
          </CardHeader>
          <CardContent>
            <StandardPieChart
              data={statusData}
              config={DEFAULT_CHART_CONFIG}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Most popular pickup locations</CardDescription>
          </CardHeader>
          <CardContent>
            <StandardBarChart
              data={locationData}
              config={DEFAULT_CHART_CONFIG}
              xAxisKey="location"
              bars={[
                { dataKey: 'bookings', name: 'Bookings' }
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Types</CardTitle>
            <CardDescription>Distribution by reservation type</CardDescription>
          </CardHeader>
          <CardContent>
            <StandardPieChart
              data={bookingTypeData}
              config={DEFAULT_CHART_CONFIG}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Days to Confirm</p>
              <p className="text-2xl font-bold">
                {analyticsData?.metrics.avgDaysToConfirm.toFixed(1)} days
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">
                {analyticsData?.metrics.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
              <p className="text-2xl font-bold">
                {analyticsData && analyticsData.metrics.totalReservations > 0
                  ? ((analyticsData.metrics.cancelledReservations / analyticsData.metrics.totalReservations) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationAnalytics;
