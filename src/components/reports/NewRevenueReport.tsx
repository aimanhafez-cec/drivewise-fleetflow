import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleBarChart, SimpleLineChart } from '@/components/charts/SimpleCharts';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/currency';

interface NewRevenueReportProps {
  dateRange?: DateRange;
}

export const NewRevenueReport: React.FC<NewRevenueReportProps> = ({ dateRange }) => {
  // Fetch reservations data for revenue calculation
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['revenue-reservations', dateRange],
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

  // Fetch agreements for completed revenue
  const { data: agreements } = useQuery({
    queryKey: ['revenue-agreements', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('agreements')
        .select('*')
        .not('total_amount', 'is', null);

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

  // Calculate revenue metrics
  const totalRevenue = agreements?.reduce((sum, agreement) => 
    sum + (Number(agreement.total_amount) || 0), 0) || 0;
  
  const totalReservations = reservations?.length || 0;
  const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;
  const averageBookingValue = totalReservations > 0 ? totalRevenue / totalReservations : 0;

  // Group revenue by month
  const monthlyRevenue = agreements?.reduce((acc, agreement) => {
    const month = new Date(agreement.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + (Number(agreement.total_amount) || 0);
    return acc;
  }, {} as Record<string, number>) || {};

  const monthlyRevenueData = Object.entries(monthlyRevenue)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue)
    }));

  // Revenue by status
  const revenueByStatus = reservations?.reduce((acc, reservation) => {
    const status = reservation.status;
    const amount = Number(reservation.total_amount) || 0;
    acc[status] = (acc[status] || 0) + amount;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusRevenueData = Object.entries(revenueByStatus).map(([status, revenue]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    revenue: Math.round(revenue)
  }));

  const currencyFormatter = (value: number, name: string): [string, string] => [formatCurrency(value), name];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-white/70">From completed rentals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalReservations}</div>
            <p className="text-xs text-white/70">All booking statuses</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{confirmedReservations}</div>
            <p className="text-xs text-white/70">Ready to proceed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Average Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(averageBookingValue)}</div>
            <p className="text-xs text-white/70">Per reservation</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-white/70">
              Revenue performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart 
              data={monthlyRevenueData}
              xAxisKey="month"
              lines={[{ dataKey: 'revenue', name: 'Revenue', color: '#10b981' }]}
              height={300}
              formatter={currencyFormatter}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Revenue by Booking Status</CardTitle>
            <CardDescription className="text-white/70">
              Revenue distribution across reservation statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={statusRevenueData}
              xAxisKey="status"
              bars={[{ dataKey: 'revenue', name: 'Revenue' }]}
              height={300}
              formatter={currencyFormatter}
            />
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary Table */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Revenue Breakdown</CardTitle>
          <CardDescription className="text-white/70">
            Detailed revenue analysis by booking status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-white">Status</th>
                  <th className="text-left p-2 text-white">Count</th>
                  <th className="text-left p-2 text-white">Revenue</th>
                  <th className="text-left p-2 text-white">Average Value</th>
                </tr>
              </thead>
              <tbody>
                {statusRevenueData.map((item) => {
                  const count = reservations?.filter(r => 
                    (r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ')) === item.status
                  ).length || 0;
                  const avgValue = count > 0 ? item.revenue / count : 0;
                  
                  return (
                    <tr key={item.status} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-2 text-white font-medium">{item.status}</td>
                      <td className="p-2 text-white">{count}</td>
                      <td className="p-2 text-white">{formatCurrency(item.revenue)}</td>
                      <td className="p-2 text-white">{formatCurrency(avgValue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};