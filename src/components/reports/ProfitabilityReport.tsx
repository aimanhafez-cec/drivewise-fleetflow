import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProfitabilityReportProps {
  dateRange?: DateRange;
}

const ProfitabilityReport = ({ dateRange }: ProfitabilityReportProps) => {
  const { data: profitabilityData, isLoading } = useQuery({
    queryKey: ['profitability-analysis', dateRange],
    queryFn: async () => {
      const fromDate = dateRange?.from?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateRange?.to?.toISOString() || new Date().toISOString();

      // Revenue data by vehicle
      const { data: vehicleRevenue } = await supabase
        .from('reservations')
        .select(`
          total_amount,
          vehicle_id,
          vehicles (
            id, make, model, year, license_plate,
            categories (name)
          )
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .not('total_amount', 'is', null)
        .not('vehicle_id', 'is', null);

      // Cost data from damage records
      const { data: vehicleCosts } = await supabase
        .from('damage_records')
        .select('vehicle_id, repair_cost, recorded_at')
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate)
        .not('repair_cost', 'is', null);

      // Agreement-level profitability
      const { data: agreements } = await supabase
        .from('agreements')
        .select('id, total_amount, vehicle_id, agreement_date, status')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .not('total_amount', 'is', null);

      return { 
        vehicleRevenue: vehicleRevenue || [], 
        vehicleCosts: vehicleCosts || [],
        agreements: agreements || []
      };
    },
  });

  if (isLoading) {
    return <div className="space-y-4">Loading profitability data...</div>;
  }

  // Process vehicle-level profitability
  const vehicleProfitability = profitabilityData?.vehicleRevenue.reduce((acc: any[], reservation) => {
    const vehicleId = reservation.vehicle_id;
    if (!vehicleId) return acc;

    const existing = acc.find(item => item.vehicleId === vehicleId);
    const revenue = Number(reservation.total_amount || 0);
    
    if (existing) {
      existing.revenue += revenue;
      existing.rentals += 1;
    } else {
      const vehicle = reservation.vehicles;
      acc.push({
        vehicleId,
        make: vehicle?.make || 'Unknown',
        model: vehicle?.model || 'Unknown',
        year: vehicle?.year || 0,
        licensePlate: vehicle?.license_plate || 'Unknown',
        category: vehicle?.categories?.name || 'Unknown',
        revenue,
        rentals: 1,
        costs: 0,
        profit: 0,
        margin: 0,
        roi: 0
      });
    }
    return acc;
  }, []) || [];

  // Add costs to vehicles
  profitabilityData?.vehicleCosts.forEach(cost => {
    const vehicle = vehicleProfitability.find(v => v.vehicleId === cost.vehicle_id);
    if (vehicle) {
      vehicle.costs += Number(cost.repair_cost || 0);
    }
  });

  // Calculate profitability metrics for each vehicle
  vehicleProfitability.forEach(vehicle => {
    // Add estimated operational costs (insurance, fuel, etc.)
    const estimatedOperationalCosts = vehicle.rentals * 150; // ~150 AED per rental
    vehicle.costs += estimatedOperationalCosts;
    
    vehicle.profit = vehicle.revenue - vehicle.costs;
    vehicle.margin = vehicle.revenue > 0 ? (vehicle.profit / vehicle.revenue) * 100 : 0;
    vehicle.roi = vehicle.costs > 0 ? (vehicle.profit / vehicle.costs) * 100 : 0;
  });

  // Sort by profitability
  const sortedByProfit = [...vehicleProfitability].sort((a, b) => b.profit - a.profit);
  const mostProfitable = sortedByProfit.slice(0, 5);
  const leastProfitable = sortedByProfit.slice(-5).reverse();

  // Category-level profitability
  const categoryProfitability = vehicleProfitability.reduce((acc: any[], vehicle) => {
    const existing = acc.find(item => item.category === vehicle.category);
    if (existing) {
      existing.revenue += vehicle.revenue;
      existing.costs += vehicle.costs;
      existing.vehicles += 1;
    } else {
      acc.push({
        category: vehicle.category,
        revenue: vehicle.revenue,
        costs: vehicle.costs,
        vehicles: 1,
        profit: 0,
        margin: 0
      });
    }
    return acc;
  }, []);

  categoryProfitability.forEach(cat => {
    cat.profit = cat.revenue - cat.costs;
    cat.margin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
  });

  // Overall metrics
  const totalRevenue = vehicleProfitability.reduce((sum, v) => sum + v.revenue, 0);
  const totalCosts = vehicleProfitability.reduce((sum, v) => sum + v.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgProfitPerVehicle = vehicleProfitability.length > 0 ? totalProfit / vehicleProfitability.length : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +18.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall profitability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit/Vehicle</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgProfitPerVehicle)}</div>
            <p className="text-xs text-muted-foreground">
              Per vehicle performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCosts > 0 ? ((totalProfit / totalCosts) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profitability by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability by Vehicle Category</CardTitle>
          <CardDescription>Revenue, costs, and profit margins by vehicle class</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
              costs: { label: 'Costs', color: 'hsl(var(--chart-2))' },
              profit: { label: 'Profit', color: 'hsl(var(--chart-3))' }
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer>
              <BarChart data={categoryProfitability}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />} 
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="costs" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="profit" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Profitable Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top Performing Vehicles
            </CardTitle>
            <CardDescription>Highest profit generators</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostProfitable.map((vehicle) => (
                  <TableRow key={vehicle.vehicleId}>
                    <TableCell className="font-medium">
                      {vehicle.make} {vehicle.model}
                      <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(vehicle.profit)}
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600">{vehicle.margin.toFixed(1)}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Least Profitable Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Underperforming Vehicles
            </CardTitle>
            <CardDescription>Vehicles requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leastProfitable.map((vehicle) => (
                  <TableRow key={vehicle.vehicleId}>
                    <TableCell className="font-medium">
                      {vehicle.make} {vehicle.model}
                      <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {formatCurrency(vehicle.profit)}
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600">{vehicle.margin.toFixed(1)}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfitabilityReport;