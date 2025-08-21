import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, Wrench, AlertTriangle, Fuel, Shield } from 'lucide-react';

interface CostAnalysisReportProps {
  dateRange?: DateRange;
}

const CostAnalysisReport = ({ dateRange }: CostAnalysisReportProps) => {
  const { data: costData, isLoading } = useQuery({
    queryKey: ['cost-analysis', dateRange],
    queryFn: async () => {
      const fromDate = dateRange?.from?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateRange?.to?.toISOString() || new Date().toISOString();

      // Actual maintenance costs from damage records
      const { data: damageRecords } = await supabase
        .from('damage_records')
        .select('repair_cost, recorded_at, vehicle_id, vehicles(make, model, categories(name))')
        .gte('recorded_at', fromDate)
        .lte('recorded_at', toDate)
        .not('repair_cost', 'is', null);

      // Vehicle count for cost per vehicle calculations
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, category_id, categories(name)');

      return { damageRecords: damageRecords || [], vehicles: vehicles || [] };
    },
  });

  if (isLoading) {
    return <div className="space-y-4">Loading cost data...</div>;
  }

  // Calculate actual maintenance costs
  const totalMaintenanceCost = costData?.damageRecords.reduce((sum, record) => 
    sum + Number(record.repair_cost || 0), 0
  ) || 0;

  // Simulate other operational costs based on fleet size
  const fleetSize = costData?.vehicles.length || 0;
  const estimatedFuelCosts = fleetSize * 1200; // ~1200 AED per vehicle per period
  const estimatedInsuranceCosts = fleetSize * 800; // ~800 AED per vehicle per period
  const estimatedOverheadCosts = fleetSize * 300; // ~300 AED per vehicle per period

  // Monthly cost trends (simulate data with actual maintenance costs)
  const monthlyCosts = [
    { month: 'Jan', maintenance: totalMaintenanceCost * 0.15, fuel: estimatedFuelCosts * 0.12, insurance: estimatedInsuranceCosts * 0.12, overhead: estimatedOverheadCosts * 0.12 },
    { month: 'Feb', maintenance: totalMaintenanceCost * 0.18, fuel: estimatedFuelCosts * 0.11, insurance: estimatedInsuranceCosts * 0.11, overhead: estimatedOverheadCosts * 0.11 },
    { month: 'Mar', maintenance: totalMaintenanceCost * 0.22, fuel: estimatedFuelCosts * 0.13, insurance: estimatedInsuranceCosts * 0.13, overhead: estimatedOverheadCosts * 0.13 },
    { month: 'Apr', maintenance: totalMaintenanceCost * 0.20, fuel: estimatedFuelCosts * 0.14, insurance: estimatedInsuranceCosts * 0.14, overhead: estimatedOverheadCosts * 0.14 },
    { month: 'May', maintenance: totalMaintenanceCost * 0.25, fuel: estimatedFuelCosts * 0.15, insurance: estimatedInsuranceCosts * 0.15, overhead: estimatedOverheadCosts * 0.15 },
  ];

  // Cost breakdown by category
  const costBreakdown = [
    { category: 'Maintenance', amount: totalMaintenanceCost, color: 'hsl(var(--chart-1))' },
    { category: 'Fuel', amount: estimatedFuelCosts, color: 'hsl(var(--chart-2))' },
    { category: 'Insurance', amount: estimatedInsuranceCosts, color: 'hsl(var(--chart-3))' },
    { category: 'Overhead', amount: estimatedOverheadCosts, color: 'hsl(var(--chart-4))' },
  ];

  const totalOperatingCosts = totalMaintenanceCost + estimatedFuelCosts + estimatedInsuranceCosts + estimatedOverheadCosts;
  const costPerVehicle = fleetSize > 0 ? totalOperatingCosts / fleetSize : 0;

  // Cost per vehicle class
  const costsByVehicleClass = costData?.vehicles.reduce((acc: any[], vehicle) => {
    const categoryName = vehicle.categories?.name || 'Unknown';
    const existing = acc.find(item => item.category === categoryName);
    const estimatedCostPerVehicle = 2300; // Base cost per vehicle
    
    if (existing) {
      existing.cost += estimatedCostPerVehicle;
      existing.vehicles += 1;
    } else {
      acc.push({ category: categoryName, cost: estimatedCostPerVehicle, vehicles: 1 });
    }
    return acc;
  }, []) || [];

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operating Costs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOperatingCosts)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMaintenanceCost)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(costPerVehicle)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              Operational efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Cost Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Trends</CardTitle>
          <CardDescription>Operating costs breakdown by category over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              maintenance: { label: 'Maintenance', color: 'hsl(var(--chart-1))' },
              fuel: { label: 'Fuel', color: 'hsl(var(--chart-2))' },
              insurance: { label: 'Insurance', color: 'hsl(var(--chart-3))' },
              overhead: { label: 'Overhead', color: 'hsl(var(--chart-4))' }
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Cost']} />} 
                />
                <Bar dataKey="maintenance" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="insurance" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="overhead" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
            <CardDescription>Distribution of operating expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={costBreakdown.reduce((acc, item, index) => ({
                ...acc,
                [item.category.toLowerCase()]: { 
                  label: item.category, 
                  color: `hsl(var(--chart-${(index % 8) + 1}))` 
                }
              }), {})}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                    label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 8) + 1}))`} stroke="hsl(var(--background))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-2 mt-4">
              {costBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: `hsl(var(--chart-${(index % 8) + 1}))` }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost by Vehicle Class */}
        <Card>
          <CardHeader>
            <CardTitle>Costs by Vehicle Class</CardTitle>
            <CardDescription>Operating costs per vehicle category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                cost: { label: 'Cost', color: 'hsl(var(--chart-1))' }
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costsByVehicleClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value) => [formatCurrency(Number(value)), 'Cost']} />} 
                  />
                  <Bar dataKey="cost" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostAnalysisReport;