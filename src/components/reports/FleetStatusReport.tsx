import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Car, CheckCircle, Wrench } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { FLEET_STATUS_CONFIG, VEHICLE_CATEGORY_COLORS } from '@/lib/chartConfig';
import { formatNumber, percentageTooltipFormatter } from '@/lib/utils/chartUtils';

interface FleetStatusReportProps {
  dateRange?: DateRange;
}

const FleetStatusReport = ({ dateRange }: FleetStatusReportProps) => {
  // Fetch vehicles data
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-fleet-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate, status, category_id, location, daily_rate, created_at')
        .order('make, model');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch reservations for utilization calculation
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations-utilization', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('id, vehicle_id, start_datetime, end_datetime, status');
      
      if (dateRange?.from) {
        query = query.gte('start_datetime', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('end_datetime', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Process data
  const statusCounts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: getStatusColor(status),
  }));

  console.log('Fleet Status - Raw status counts:', statusCounts);
  console.log('Fleet Status - Pie data:', pieData);
  console.log('Fleet Status - Chart config keys:', Object.keys(FLEET_STATUS_CONFIG));

  // Calculate utilization by location
  const utilizationByLocation = vehicles.reduce((acc, vehicle) => {
    if (!vehicle.location) return acc;
    
    const vehicleReservations = reservations.filter(r => r.vehicle_id === vehicle.id);
    const totalDays = dateRange?.from && dateRange?.to 
      ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    const rentalDays = vehicleReservations.reduce((sum, res) => {
      if (!res.start_datetime || !res.end_datetime) return sum;
      const start = new Date(res.start_datetime);
      const end = new Date(res.end_datetime);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    if (!acc[vehicle.location]) {
      acc[vehicle.location] = { totalVehicles: 0, totalRentalDays: 0, totalPossibleDays: 0 };
    }
    
    acc[vehicle.location].totalVehicles++;
    acc[vehicle.location].totalRentalDays += rentalDays;
    acc[vehicle.location].totalPossibleDays += totalDays;
    
    return acc;
  }, {} as Record<string, { totalVehicles: number; totalRentalDays: number; totalPossibleDays: number }>);

  const utilizationData = Object.entries(utilizationByLocation).map(([location, data]) => ({
    location,
    utilization: data.totalPossibleDays > 0 
      ? Math.round((data.totalRentalDays / data.totalPossibleDays) * 100)
      : 0,
    vehicles: data.totalVehicles,
  }));

  if (isLoading) {
    return <div>Loading fleet status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.available || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.rented || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.maintenance || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.out_of_service || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={FLEET_STATUS_CONFIG}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={FLEET_STATUS_CONFIG[entry.name as keyof typeof FLEET_STATUS_CONFIG]?.color || VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length]} 
                        stroke="hsl(var(--background))" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value, name) => [formatNumber(Number(value)), name]} />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization by Location</CardTitle>
            <CardDescription>Fleet utilization percentage by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                utilization: { label: "Fleet Utilization", color: "hsl(220, 91%, 60%)" },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="location" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={percentageTooltipFormatter} />} 
                  />
                  <Bar 
                    dataKey="utilization" 
                    fill="hsl(220, 91%, 60%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status Details</CardTitle>
          <CardDescription>Complete list of vehicles with current status and location</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Daily Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </TableCell>
                  <TableCell className="font-mono">{vehicle.license_plate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(vehicle.status)}>
                      {vehicle.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.location || 'Not Set'}</TableCell>
                  <TableCell>{formatCurrency(vehicle.daily_rate || 0)}/day</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'hsl(var(--success))';
    case 'rented': return 'hsl(var(--primary))';
    case 'maintenance': return 'hsl(var(--warning))';
    case 'out_of_service': return 'hsl(var(--destructive))';
    default: return 'hsl(var(--muted))';
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'available': return 'default';
    case 'rented': return 'secondary';
    case 'maintenance': return 'outline';
    case 'out_of_service': return 'destructive';
    default: return 'outline';
  }
}

export default FleetStatusReport;