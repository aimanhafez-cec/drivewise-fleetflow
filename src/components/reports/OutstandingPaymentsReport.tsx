import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, CreditCard, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

interface OutstandingPaymentsReportProps {
  dateRange?: DateRange;
}

const OutstandingPaymentsReport = ({ dateRange }: OutstandingPaymentsReportProps) => {
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['outstanding-payments', dateRange],
    queryFn: async () => {
      // Get unpaid invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, due_date, created_at, status, customer_id')
        .neq('status', 'paid')
        .order('due_date', { ascending: false });

      // Get customers separately
      const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, email, customer_type');

      // Get payment records for analysis
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, status, processed_at, created_at, customer_id')
        .order('created_at', { ascending: false });

      return { invoices: invoices || [], payments: payments || [], customers: customers || [] };
    },
  });

  if (isLoading) {
    return <div className="space-y-4">Loading payment data...</div>;
  }

  // Process aging buckets
  const today = new Date();
  const agingBuckets = {
    current: { label: '0-30 days', amount: 0, count: 0, invoices: [] as any[] },
    days30: { label: '31-60 days', amount: 0, count: 0, invoices: [] as any[] },
    days60: { label: '61-90 days', amount: 0, count: 0, invoices: [] as any[] },
    days90: { label: '90+ days', amount: 0, count: 0, invoices: [] as any[] },
  };

  paymentsData?.invoices.forEach(invoice => {
    const dueDate = new Date(invoice.due_date || invoice.created_at);
    const daysOverdue = differenceInDays(today, dueDate);
    const amount = Number(invoice.total_amount || 0);

    if (daysOverdue <= 30) {
      agingBuckets.current.amount += amount;
      agingBuckets.current.count += 1;
      agingBuckets.current.invoices.push({ ...invoice, daysOverdue });
    } else if (daysOverdue <= 60) {
      agingBuckets.days30.amount += amount;
      agingBuckets.days30.count += 1;
      agingBuckets.days30.invoices.push({ ...invoice, daysOverdue });
    } else if (daysOverdue <= 90) {
      agingBuckets.days60.amount += amount;
      agingBuckets.days60.count += 1;
      agingBuckets.days60.invoices.push({ ...invoice, daysOverdue });
    } else {
      agingBuckets.days90.amount += amount;
      agingBuckets.days90.count += 1;
      agingBuckets.days90.invoices.push({ ...invoice, daysOverdue });
    }
  });

  // Aging data for charts
  const agingChartData = Object.values(agingBuckets).map(bucket => ({
    period: bucket.label,
    amount: bucket.amount,
    count: bucket.count
  }));

  // Customer analysis - top overdue customers
  const customerOverdue = paymentsData?.invoices.reduce((acc: any[], invoice) => {
    const customer = paymentsData.customers?.find(c => c.id === invoice.customer_id);
    if (!customer) return acc;

    const existing = acc.find(item => item.customerId === customer.id);
    const amount = Number(invoice.total_amount || 0);
    
    if (existing) {
      existing.outstandingAmount += amount;
      existing.invoiceCount += 1;
    } else {
      acc.push({
        customerId: customer.id,
        customerName: customer.full_name,
        customerType: customer.customer_type,
        email: customer.email,
        outstandingAmount: amount,
        invoiceCount: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.outstandingAmount - a.outstandingAmount).slice(0, 10) || [];

  // Calculate key metrics
  const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);
  const totalInvoices = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.count, 0);
  const avgInvoiceAmount = totalInvoices > 0 ? totalOutstanding / totalInvoices : 0;
  
  // Mock DSO calculation (Days Sales Outstanding)
  const mockDSO = 35; // Average 35 days to collect
  
  // Collection efficiency (mock data)
  const collectionEfficiency = 78.5; // 78.5% collection rate

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const getAgingBadgeColor = (daysOverdue: number) => {
    if (daysOverdue <= 30) return 'default';
    if (daysOverdue <= 60) return 'secondary';
    if (daysOverdue <= 90) return 'destructive';
    return 'destructive';
  };

  const getAgingBadgeLabel = (daysOverdue: number) => {
    if (daysOverdue <= 0) return 'Current';
    if (daysOverdue <= 30) return `${daysOverdue} days`;
    if (daysOverdue <= 60) return `${daysOverdue} days`;
    if (daysOverdue <= 90) return `${daysOverdue} days`;
    return `${daysOverdue}+ days`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Sales Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDSO} days</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -3 days from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Efficiency</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionEfficiency}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoice Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgInvoiceAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per outstanding invoice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>A/R Aging Analysis</CardTitle>
            <CardDescription>Outstanding amounts by aging buckets</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: { label: 'Amount', color: 'hsl(var(--chart-1))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aging Distribution</CardTitle>
            <CardDescription>Breakdown of overdue amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: { label: 'Amount', color: 'hsl(var(--chart-1))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agingChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    nameKey="period"
                  >
                    {agingChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Overdue Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Overdue Customers
          </CardTitle>
          <CardDescription>Customers with highest outstanding balances</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Outstanding Amount</TableHead>
                <TableHead>Invoices</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOverdue.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.customerType}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-red-600">
                    {formatCurrency(customer.outstandingAmount)}
                  </TableCell>
                  <TableCell>{customer.invoiceCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Overdue Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Overdue Invoices</CardTitle>
          <CardDescription>Latest invoices requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData?.invoices.slice(0, 10).map((invoice) => {
                const dueDate = new Date(invoice.due_date || invoice.created_at);
                const daysOverdue = differenceInDays(today, dueDate);
                const customer = paymentsData.customers?.find(c => c.id === invoice.customer_id);
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{customer?.full_name || 'Unknown Customer'}</div>
                      <div className="text-xs text-muted-foreground">{customer?.email || 'No email'}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(invoice.total_amount || 0))}
                    </TableCell>
                    <TableCell>
                      {dueDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAgingBadgeColor(daysOverdue)}>
                        {getAgingBadgeLabel(daysOverdue)}
                      </Badge>
                    </TableCell>
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

export default OutstandingPaymentsReport;