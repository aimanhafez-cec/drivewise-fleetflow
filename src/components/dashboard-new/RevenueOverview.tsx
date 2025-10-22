import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { RevenueKPIs, TrendData } from '@/lib/api/admin-dashboard';

interface RevenueOverviewProps {
  revenueData: RevenueKPIs | undefined;
  trendData: TrendData[];
  isLoading: boolean;
}

export function RevenueOverview({ revenueData, trendData, isLoading }: RevenueOverviewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  if (!revenueData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load revenue data</p>
        </div>
      </Card>
    );
  }

  // Format trend data for chart (last 12 data points)
  const chartData = trendData.slice(-12).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' }),
    revenue: d.value
  }));

  // Revenue breakdown data (mock distribution for now)
  const revenueBreakdown = [
    { name: 'Daily Rentals', value: revenueData.totalRevenueMTD * 0.35, color: '#0EA5E9' },
    { name: 'Monthly Contracts', value: revenueData.totalRevenueMTD * 0.30, color: '#14B8A6' },
    { name: 'Corporate Leasing', value: revenueData.totalRevenueMTD * 0.25, color: '#F59E0B' },
    { name: 'Add-ons & Insurance', value: revenueData.totalRevenueMTD * 0.08, color: '#10B981' },
    { name: 'Salik/Fines', value: revenueData.totalRevenueMTD * 0.02, color: '#EF4444' }
  ];

  const formatCurrency = (value: number) => {
    return `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Financial performance</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/reports')}
        >
          View Reports
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Revenue MTD</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(revenueData.totalRevenueMTD)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {revenueData.revenueGrowthRate >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs font-semibold ${
              revenueData.revenueGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(revenueData.revenueGrowthRate).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">YTD Revenue</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(revenueData.totalRevenueYTD)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Year to date</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Avg Transaction</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(revenueData.averageTransactionValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Per booking</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
          <p className="text-xl font-bold text-amber-600">
            {formatCurrency(revenueData.outstandingReceivables)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-amber-600">Receivables</span>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-3">Revenue Trend (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={formatCompactCurrency}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Revenue Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Legend */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold mb-3">By Revenue Type</h4>
          {revenueBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / revenueData.totalRevenueMTD) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
