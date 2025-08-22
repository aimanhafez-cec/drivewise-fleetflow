import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StandardBarChart } from '@/components/charts';
import { formatCurrency } from '@/lib/utils/currency';
import { useAllVehicles } from '@/hooks/useVehicles';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ProfitabilityReportProps {
  dateRange?: DateRange;
}

export default function ProfitabilityReport({ dateRange }: ProfitabilityReportProps) {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useAllVehicles();
  
  const { data: agreements = [], isLoading: agreementsLoading } = useQuery({
    queryKey: ['profitability-agreements', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('agreements')
        .select('vehicle_id, total_amount, agreement_date');

      if (dateRange?.from) {
        query = query.gte('agreement_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('agreement_date', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: damageRecords = [] } = useQuery({
    queryKey: ['damage-records', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_records')
        .select('vehicle_id, repair_cost');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (vehiclesLoading || agreementsLoading) {
    return <div className="text-white">Loading...</div>;
  }

  // Calculate vehicle-level profitability
  const vehicleProfitability = vehicles.map(vehicle => {
    const vehicleRevenue = agreements
      .filter(a => a.vehicle_id === vehicle.id)
      .reduce((sum, a) => sum + (Number(a.total_amount) || 0), 0);
    
    const vehicleCosts = damageRecords
      .filter(d => d.vehicle_id === vehicle.id)
      .reduce((sum, d) => sum + (Number(d.repair_cost) || 0), 0);
    
    const profit = vehicleRevenue - vehicleCosts;
    const margin = vehicleRevenue > 0 ? (profit / vehicleRevenue) * 100 : 0;
    const roi = vehicleCosts > 0 ? (profit / vehicleCosts) * 100 : 0;

    return {
      vehicle,
      revenue: vehicleRevenue,
      costs: vehicleCosts,
      profit,
      margin,
      roi
    };
  });

  // Calculate category-level profitability
  const categoryProfitability = vehicleProfitability.reduce((acc: Record<string, any>, item) => {
    const category = item.vehicle.category_id || 'Unknown';
    if (!acc[category]) {
      acc[category] = { revenue: 0, costs: 0, profit: 0, count: 0 };
    }
    acc[category].revenue += item.revenue;
    acc[category].costs += item.costs;
    acc[category].profit += item.profit;
    acc[category].count += 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryProfitability).map(([category, data]) => ({
    category: category === 'Unknown' ? 'Uncategorized' : category,
    revenue: data.revenue,
    costs: data.costs,
    profit: data.profit,
    margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
  }));

  // Calculate overall metrics
  const totalProfit = vehicleProfitability.reduce((sum, v) => sum + v.profit, 0);
  const totalRevenue = vehicleProfitability.reduce((sum, v) => sum + v.revenue, 0);
  const totalCosts = vehicleProfitability.reduce((sum, v) => sum + v.costs, 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgProfitPerVehicle = vehicles.length > 0 ? totalProfit / vehicles.length : 0;

  // Get top and bottom performers
  const sortedByProfit = [...vehicleProfitability].sort((a, b) => b.profit - a.profit);
  const topPerformers = sortedByProfit.slice(0, 5);
  const bottomPerformers = sortedByProfit.slice(-5).reverse();

  const profitabilityConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))",
    },
    costs: {
      label: "Costs",
      color: "hsl(var(--chart-4))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg Profit/Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(avgProfitPerVehicle)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Fleet ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalCosts > 0 ? ((totalProfit / totalCosts) * 100).toFixed(1) : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability by Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Profitability by Vehicle Category</CardTitle>
          <CardDescription className="text-gray-300">
            Revenue, costs, and profit breakdown by vehicle category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StandardBarChart
            data={categoryData}
            config={profitabilityConfig}
            height={350}
            xAxisKey="category"
            bars={[
              { dataKey: "revenue", name: "Revenue", stackId: "a" },
              { dataKey: "costs", name: "Costs", stackId: "a" },
              { dataKey: "profit", name: "Profit" }
            ]}
          />
        </CardContent>
      </Card>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Top 5 Most Profitable Vehicles</CardTitle>
            <CardDescription className="text-gray-300">
              Vehicles generating the highest profit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Vehicle</TableHead>
                  <TableHead className="text-white">Profit</TableHead>
                  <TableHead className="text-white">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((item) => (
                  <TableRow key={item.vehicle.id}>
                    <TableCell className="text-white">
                      {item.vehicle.make} {item.vehicle.model}
                    </TableCell>
                    <TableCell className="text-white">{formatCurrency(item.profit)}</TableCell>
                    <TableCell className="text-white">{item.margin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Least Profitable Vehicles</CardTitle>
            <CardDescription className="text-gray-300">
              Vehicles with lowest or negative profitability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Vehicle</TableHead>
                  <TableHead className="text-white">Profit</TableHead>
                  <TableHead className="text-white">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bottomPerformers.map((item) => (
                  <TableRow key={item.vehicle.id}>
                    <TableCell className="text-white">
                      {item.vehicle.make} {item.vehicle.model}
                    </TableCell>
                    <TableCell className="text-white">{formatCurrency(item.profit)}</TableCell>
                    <TableCell className="text-white">{item.margin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}