import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Car, Calendar } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 45000, target: 40000, growth: 12.5 },
  { month: "Feb", revenue: 52000, target: 45000, growth: 15.6 },
  { month: "Mar", revenue: 48000, target: 47000, growth: 2.1 },
  { month: "Apr", revenue: 61000, target: 50000, growth: 22.0 },
  { month: "May", revenue: 55000, target: 52000, growth: 5.8 },
  { month: "Jun", revenue: 67000, target: 55000, growth: 21.8 },
];

const fleetUtilization = [
  { name: "Rented", value: 145, color: "hsl(var(--chart-1))" },
  { name: "Available", value: 78, color: "hsl(var(--chart-2))" },
  { name: "Maintenance", value: 23, color: "hsl(var(--chart-3))" },
  { name: "Reserved", value: 34, color: "hsl(var(--chart-4))" },
];

const customerMetrics = [
  { metric: "New Customers", value: 234, change: 18.2, trend: "up" },
  { metric: "Repeat Rate", value: 67, change: 5.4, trend: "up", unit: "%" },
  { metric: "Avg Booking Value", value: 2450, change: -3.2, trend: "down", prefix: "AED" },
  { metric: "Customer Satisfaction", value: 4.7, change: 0.3, trend: "up", suffix: "/5" },
];

const KPIDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="dubai">Dubai</SelectItem>
            <SelectItem value="abudhabi">Abu Dhabi</SelectItem>
            <SelectItem value="sharjah">Sharjah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {customerMetrics.map((metric) => (
          <Card key={metric.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              {metric.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.prefix}{metric.value}{metric.suffix}{metric.unit}
              </div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Target</CardTitle>
            <CardDescription>Monthly performance comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="target" fill="hsl(var(--chart-2))" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
            <CardDescription>Current vehicle status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fleetUtilization}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fleetUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Trend</CardTitle>
            <CardDescription>Month-over-month growth percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="hsl(var(--chart-1))" 
                  fillOpacity={1} 
                  fill="url(#colorGrowth)"
                  name="Growth %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KPIDashboard;
