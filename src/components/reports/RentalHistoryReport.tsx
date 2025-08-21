import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, DollarSign, Repeat } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { MONTHLY_TRENDS_CONFIG, VEHICLE_CATEGORY_COLORS } from '@/lib/chartConfig';
import { currencyTooltipFormatter, formatMonth } from '@/lib/utils/chartUtils';

interface RentalHistoryReportProps {
  dateRange?: DateRange;
}

const RentalHistoryReport: React.FC<RentalHistoryReportProps> = ({ dateRange }) => {
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers-rental-history', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          full_name,
          email,
          customer_type,
          total_rentals,
          total_spent,
          created_at
        `)
        .order('total_spent', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: revenueByMonth } = useQuery({
    queryKey: ['revenue-by-month', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('total_amount, created_at')
        .not('total_amount', 'is', null)
        .order('created_at');

      if (error) throw error;

      // Group by month
      const monthlyRevenue: Record<string, number> = {};
      data?.forEach(reservation => {
        const date = new Date(reservation.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(reservation.total_amount);
      });

      return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      }));
    },
  });

  const { data: customerSegmentation } = useQuery({
    queryKey: ['customer-segmentation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_type, total_spent')
        .not('total_spent', 'is', null);

      if (error) throw error;

      const segmentation = data?.reduce((acc, customer) => {
        const type = customer.customer_type || 'B2C';
        if (!acc[type]) {
          acc[type] = { count: 0, revenue: 0 };
        }
        acc[type].count += 1;
        acc[type].revenue += Number(customer.total_spent);
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      return Object.entries(segmentation || {}).map(([type, data]) => ({
        type,
        count: data.count,
        revenue: data.revenue,
        averageValue: data.revenue / data.count
      }));
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading rental history data...</div>;
  }

  const topCustomers = customersData?.slice(0, 10) || [];
  const totalCustomers = customersData?.length || 0;
  const totalRevenue = customersData?.reduce((sum, customer) => sum + (Number(customer.total_spent) || 0), 0) || 0;
  const averageLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  // Calculate retention rate (simplified - customers with more than 1 rental)
  const retainedCustomers = customersData?.filter(c => (c.total_rentals || 0) > 1).length || 0;
  const retentionRate = totalCustomers > 0 ? (retainedCustomers / totalCustomers) * 100 : 0;

  const chartColors = {
    revenue: 'hsl(var(--chart-1))',
    b2c: 'hsl(var(--chart-2))',
    b2b: 'hsl(var(--chart-3))',
    corporate: 'hsl(var(--chart-4))'
  };
  
  const pieColors = ['hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {retainedCustomers} repeat customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Repeat className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Customers with repeat rentals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={MONTHLY_TRENDS_CONFIG}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatMonth}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={currencyTooltipFormatter} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={MONTHLY_TRENDS_CONFIG.revenue.color}
                    strokeWidth={3}
                    dot={{ fill: MONTHLY_TRENDS_CONFIG.revenue.color, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
            <CardDescription>Revenue by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={customerSegmentation?.reduce((acc, item, index) => ({
                ...acc,
                [item.type.toLowerCase()]: { 
                  label: item.type, 
                  color: VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length] 
                }
              }), {}) || {}}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegmentation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="type"
                  >
                    {customerSegmentation?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length]} 
                        stroke="hsl(var(--background))" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={currencyTooltipFormatter} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
          <CardDescription>Highest spending customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Rentals</TableHead>
                <TableHead>Lifetime Value</TableHead>
                <TableHead>Avg. per Rental</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer) => {
                const avgPerRental = (customer.total_rentals || 0) > 0 
                  ? (Number(customer.total_spent) || 0) / (customer.total_rentals || 1) 
                  : 0;
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.customer_type || 'B2C'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{customer.total_rentals || 0}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(Number(customer.total_spent) || 0)}</TableCell>
                    <TableCell>{formatCurrency(avgPerRental)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalHistoryReport;