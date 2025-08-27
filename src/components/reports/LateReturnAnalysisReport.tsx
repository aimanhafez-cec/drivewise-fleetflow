import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, AlertTriangle, DollarSign, Users } from 'lucide-react';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';

interface LateReturnAnalysisReportProps {
  dateRange?: DateRange;
}

const LateReturnAnalysisReport: React.FC<LateReturnAnalysisReportProps> = ({ dateRange }) => {
  const { data: lateReturnsData, isLoading } = useQuery({
    queryKey: ['late-returns-analysis', dateRange],
    queryFn: async () => {
      // Get agreements with actual return datetime
      const { data: agreements, error } = await supabase
        .from('agreements')
        .select(`
          id,
          return_datetime,
          customer_id,
          customers!inner(full_name, customer_type),
          agreement_lines!inner(
            check_in_at,
            line_total,
            vehicle_id
          )
        `)
        .not('return_datetime', 'is', null)
        .not('agreement_lines.check_in_at', 'is', null);

      if (error) throw error;

      // Get vehicle information separately
      const vehicleIds = agreements?.flatMap(agreement => 
        agreement.agreement_lines?.map(line => line.vehicle_id)
      ).filter(Boolean) || [];

      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, license_plate, category_id, categories(name)')
        .in('id', vehicleIds);

      const vehicleMap = vehicles?.reduce((acc, vehicle) => {
        acc[vehicle.id] = vehicle;
        return acc;
      }, {} as Record<string, any>) || {};

      const lateReturns: any[] = [];
      const onTimeReturns: any[] = [];
      
      agreements?.forEach(agreement => {
        agreement.agreement_lines?.forEach(line => {
          const expectedReturn = new Date(line.check_in_at);
          const actualReturn = new Date(agreement.return_datetime);
          const delayHours = differenceInHours(actualReturn, expectedReturn);
          const delayDays = differenceInDays(actualReturn, expectedReturn);
          
          const vehicle = vehicleMap[line.vehicle_id];
          
          const returnData = {
            agreementId: agreement.id,
            customerName: agreement.customers.full_name,
            customerType: agreement.customers.customer_type,
            customerId: agreement.customer_id,
            expectedReturn: line.check_in_at,
            actualReturn: agreement.return_datetime,
            delayHours: Math.max(0, delayHours),
            delayDays: Math.max(0, delayDays),
            isLate: delayHours > 2, // Consider 2+ hours as late
            vehicleInfo: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})` : 'N/A',
            categoryName: vehicle?.categories?.name || 'Uncategorized',
            lineTotal: Number(line.line_total) || 0,
            // Estimate late fee (would be stored in database in real implementation)
            lateFee: delayHours > 2 ? Math.min(delayDays * 50, 500) : 0 // AED 50 per day, max AED 500
          };
          
          if (returnData.isLate) {
            lateReturns.push(returnData);
          } else {
            onTimeReturns.push(returnData);
          }
        });
      });

      return {
        lateReturns,
        onTimeReturns,
        totalReturns: lateReturns.length + onTimeReturns.length
      };
    },
  });

  const { data: customerOffenders } = useQuery({
    queryKey: ['frequent-late-customers', dateRange],
    queryFn: async () => {
      if (!lateReturnsData?.lateReturns) return [];

      // Group late returns by customer
      const customerLateCount: Record<string, {
        count: number;
        name: string;
        type: string;
        totalDelayHours: number;
        totalLateFees: number;
      }> = {};

      lateReturnsData.lateReturns.forEach((lateReturn: any) => {
        const customerId = lateReturn.customerId;
        if (!customerLateCount[customerId]) {
          customerLateCount[customerId] = {
            count: 0,
            name: lateReturn.customerName,
            type: lateReturn.customerType,
            totalDelayHours: 0,
            totalLateFees: 0
          };
        }
        customerLateCount[customerId].count += 1;
        customerLateCount[customerId].totalDelayHours += lateReturn.delayHours;
        customerLateCount[customerId].totalLateFees += lateReturn.lateFee;
      });

      return Object.entries(customerLateCount)
        .map(([customerId, data]) => ({
          customerId,
          ...data,
          averageDelayHours: data.totalDelayHours / data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    enabled: !!lateReturnsData
  });

  const { data: monthlyTrends } = useQuery({
    queryKey: ['late-return-trends', dateRange],
    queryFn: async () => {
      if (!lateReturnsData) return [];

      // Group by month
      const monthlyData: Record<string, { total: number; late: number }> = {};
      
      [...lateReturnsData.lateReturns, ...lateReturnsData.onTimeReturns].forEach((returnData: any) => {
        const date = new Date(returnData.actualReturn);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { total: 0, late: 0 };
        }
        
        monthlyData[monthKey].total += 1;
        if (returnData.isLate) {
          monthlyData[monthKey].late += 1;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        total: data.total,
        late: data.late,
        percentage: data.total > 0 ? (data.late / data.total) * 100 : 0
      }));
    },
    enabled: !!lateReturnsData
  });

  if (isLoading) {
    return <div className="p-4">Loading late return analysis data...</div>;
  }

  const lateReturns = lateReturnsData?.lateReturns || [];
  const totalReturns = lateReturnsData?.totalReturns || 0;
  const lateReturnRate = totalReturns > 0 ? (lateReturns.length / totalReturns) * 100 : 0;
  
  // Calculate metrics
  const totalLateFees = lateReturns.reduce((sum: number, lr: any) => sum + lr.lateFee, 0);
  const averageDelay = lateReturns.length > 0 
    ? lateReturns.reduce((sum: number, lr: any) => sum + lr.delayHours, 0) / lateReturns.length 
    : 0;
  
  // Group by vehicle category
  const categoryAnalysis = lateReturns.reduce((acc: any, lr: any) => {
    const category = lr.categoryName;
    if (!acc[category]) {
      acc[category] = { count: 0, totalDelay: 0, totalFees: 0 };
    }
    acc[category].count += 1;
    acc[category].totalDelay += lr.delayHours;
    acc[category].totalFees += lr.lateFee;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryAnalysis).map(([category, data]: [string, any]) => ({
    category,
    count: data.count,
    averageDelay: data.totalDelay / data.count,
    totalFees: data.totalFees
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Return Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateReturnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {lateReturns.length} of {totalReturns} returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Delay</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDelay.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Per late return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLateFees)}</div>
            <p className="text-xs text-muted-foreground">
              From late fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequent Offenders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerOffenders?.filter(c => c.count >= 3).length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Customers with 3+ late returns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Late Return Trends</CardTitle>
            <CardDescription>Monthly late return percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Late Return Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Late Returns by Vehicle Category</CardTitle>
            <CardDescription>Category breakdown of late returns</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Frequent Offenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Frequent Late Return Customers</CardTitle>
          <CardDescription className="text-card-foreground">Customers with multiple late returns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Late Returns</TableHead>
                <TableHead>Avg. Delay</TableHead>
                <TableHead>Total Late Fees</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOffenders?.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{customer.count}</TableCell>
                  <TableCell>{customer.averageDelayHours.toFixed(1)}h</TableCell>
                  <TableCell>{formatCurrency(customer.totalLateFees)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      customer.count >= 5 ? "destructive" : 
                      customer.count >= 3 ? "secondary" : 
                      "outline"
                    }>
                      {customer.count >= 5 ? "High" : customer.count >= 3 ? "Medium" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Late Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Late Returns</CardTitle>
          <CardDescription className="text-card-foreground">Latest instances of late vehicle returns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Expected Return</TableHead>
                <TableHead>Actual Return</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Late Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lateReturns.slice(0, 10).map((lateReturn: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{lateReturn.customerName}</TableCell>
                  <TableCell>{lateReturn.vehicleInfo}</TableCell>
                  <TableCell>{format(new Date(lateReturn.expectedReturn), 'MMM dd, HH:mm')}</TableCell>
                  <TableCell>{format(new Date(lateReturn.actualReturn), 'MMM dd, HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {lateReturn.delayDays > 0 ? `${lateReturn.delayDays}d ` : ''}{lateReturn.delayHours % 24}h
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(lateReturn.lateFee)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LateReturnAnalysisReport;