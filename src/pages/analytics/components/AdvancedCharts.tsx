import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Scatter, ScatterChart, ZAxis, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from "recharts";

const composedData = [
  { month: "Jan", revenue: 45000, bookings: 120, avgValue: 375 },
  { month: "Feb", revenue: 52000, bookings: 145, avgValue: 358 },
  { month: "Mar", revenue: 48000, bookings: 132, avgValue: 363 },
  { month: "Apr", revenue: 61000, bookings: 167, avgValue: 365 },
  { month: "May", revenue: 55000, bookings: 151, avgValue: 364 },
  { month: "Jun", revenue: 67000, bookings: 189, avgValue: 354 },
];

const scatterData = [
  { x: 100, y: 200, z: 200, name: "Economy" },
  { x: 120, y: 100, z: 260, name: "Compact" },
  { x: 170, y: 300, z: 400, name: "Mid-size" },
  { x: 140, y: 250, z: 280, name: "SUV" },
  { x: 150, y: 400, z: 500, name: "Luxury" },
  { x: 110, y: 280, z: 200, name: "Van" },
];

const radarData = [
  { metric: "Revenue", score: 85 },
  { metric: "Customer Satisfaction", score: 92 },
  { metric: "Fleet Utilization", score: 78 },
  { metric: "Booking Conversion", score: 71 },
  { metric: "Repeat Customers", score: 88 },
  { metric: "Avg Rating", score: 94 },
];

const treemapData = [
  { name: "Dubai", value: 450000, fill: "hsl(var(--chart-1))" },
  { name: "Abu Dhabi", value: 320000, fill: "hsl(var(--chart-2))" },
  { name: "Sharjah", value: 180000, fill: "hsl(var(--chart-3))" },
  { name: "Ajman", value: 95000, fill: "hsl(var(--chart-4))" },
  { name: "Ras Al Khaimah", value: 72000, fill: "hsl(var(--chart-5))" },
  { name: "Fujairah", value: 48000, fill: "hsl(var(--chart-6))" },
];

const AdvancedCharts = () => {
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
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composed Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Multi-Metric Analysis</CardTitle>
            <CardDescription>Combined view of revenue, bookings, and average value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={composedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  fill="hsl(var(--chart-1))" 
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                  name="Revenue"
                />
                <Bar yAxisId="right" dataKey="bookings" fill="hsl(var(--chart-2))" name="Bookings" />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgValue" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Avg Value"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Category Performance</CardTitle>
            <CardDescription>Bookings vs Revenue by category (bubble size = profit)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Bookings"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Revenue"
                  stroke="hsl(var(--muted-foreground))"
                />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Scatter 
                  name="Categories" 
                  data={scatterData} 
                  fill="hsl(var(--chart-1))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Scorecard</CardTitle>
            <CardDescription>Multi-dimensional performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))" 
                  fillOpacity={0.6}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treemap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Location</CardTitle>
            <CardDescription>Hierarchical view of location performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <Treemap
                data={treemapData}
                dataKey="value"
                aspectRatio={4 / 3}
                stroke="hsl(var(--background))"
                content={({ x, y, width, height, name, value }) => (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: treemapData.find(d => d.name === name)?.fill,
                        stroke: "hsl(var(--background))",
                        strokeWidth: 2,
                      }}
                    />
                    {width > 80 && height > 40 && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 10}
                          textAnchor="middle"
                          fill="hsl(var(--background))"
                          fontSize={14}
                          fontWeight="bold"
                        >
                          {name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 10}
                          textAnchor="middle"
                          fill="hsl(var(--background))"
                          fontSize={12}
                        >
                          AED {(value / 1000).toFixed(0)}K
                        </text>
                      </>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedCharts;
