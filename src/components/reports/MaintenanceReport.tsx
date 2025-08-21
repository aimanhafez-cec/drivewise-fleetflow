import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Calendar, Clock, Wrench, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, isBefore, addDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';
import { MONTHLY_TRENDS_CONFIG, VEHICLE_CATEGORY_COLORS } from '@/lib/chartConfig';
import { formatNumber, currencyTooltipFormatter } from '@/lib/utils/chartUtils';

interface MaintenanceReportProps {
  dateRange?: DateRange;
}

const MaintenanceReport = ({ dateRange }: MaintenanceReportProps) => {
  // Fetch vehicles with maintenance-related data
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate, status, odometer, created_at, location')
        .order('make, model');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Mock maintenance data (in a real app, this would come from a maintenance table)
  const generateMaintenanceData = (vehicles: any[]) => {
    return vehicles.map((vehicle) => {
      // Simulate maintenance records
      const lastServiceDays = Math.floor(Math.random() * 180) + 30; // 30-210 days ago
      const nextServiceDays = Math.floor(Math.random() * 60) + 30; // 30-90 days from now
      const lastService = new Date();
      lastService.setDate(lastService.getDate() - lastServiceDays);
      
      const nextService = new Date();
      nextService.setDate(nextService.getDate() + nextServiceDays);
      
      const serviceInterval = 5000 + Math.floor(Math.random() * 5000); // 5k-10k miles
      const milesSinceService = Math.floor(Math.random() * serviceInterval);
      
      return {
        ...vehicle,
        lastService,
        nextService,
        milesSinceService,
        serviceInterval,
        isOverdue: isBefore(nextService, new Date()),
        isDueSoon: !isBefore(nextService, new Date()) && isBefore(nextService, addDays(new Date(), 30)),
        estimatedCost: 150 + Math.floor(Math.random() * 300),
        serviceType: ['Oil Change', 'Tire Rotation', 'Brake Inspection', 'General Service'][Math.floor(Math.random() * 4)],
        downtime: Math.floor(Math.random() * 3) + 1, // 1-3 days
      };
    });
  };

  const maintenanceData = generateMaintenanceData(vehicles);

  // Calculate statistics
  const overdueServices = maintenanceData.filter(v => v.isOverdue);
  const dueSoonServices = maintenanceData.filter(v => v.isDueSoon);
  const inMaintenance = vehicles.filter(v => v.status === 'maintenance');

  // Monthly maintenance trend (mock data)
  const monthlyTrend = [
    { month: 'Jan', services: 12, cost: 1800 },
    { month: 'Feb', services: 8, cost: 1200 },
    { month: 'Mar', services: 15, cost: 2250 },
    { month: 'Apr', services: 11, cost: 1650 },
    { month: 'May', services: 9, cost: 1350 },
    { month: 'Jun', services: 13, cost: 1950 },
  ];

  // Service type breakdown
  const serviceTypes = [
    { type: 'Oil Change', count: 28, avgCost: 75 },
    { type: 'Tire Rotation', count: 15, avgCost: 50 },
    { type: 'Brake Inspection', count: 12, avgCost: 200 },
    { type: 'General Service', count: 22, avgCost: 300 },
    { type: 'Emergency Repair', count: 8, avgCost: 450 },
  ];

  if (isLoading) {
    return <div>Loading maintenance report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Services</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueServices.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{dueSoonServices.length}</div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">Currently being serviced</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Downtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1 days</div>
            <p className="text-xs text-muted-foreground">Per service event</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Service Trend</CardTitle>
            <CardDescription>Number of services completed per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={MONTHLY_TRENDS_CONFIG}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value, name) => [
                      name === 'cost' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
                      name === 'services' ? 'Services' : 'Cost'
                    ]} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="services" 
                    stroke={MONTHLY_TRENDS_CONFIG.services.color}
                    strokeWidth={3}
                    dot={{ fill: MONTHLY_TRENDS_CONFIG.services.color, strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cost" 
                    stroke={MONTHLY_TRENDS_CONFIG.costs.color}
                    strokeWidth={3}
                    dot={{ fill: MONTHLY_TRENDS_CONFIG.costs.color, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Type Breakdown</CardTitle>
            <CardDescription>Most common maintenance services</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={serviceTypes.reduce((acc, service, index) => ({
                ...acc,
                [service.type.toLowerCase().replace(' ', '_')]: { 
                  label: service.type, 
                  color: VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length] 
                }
              }), {})}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceTypes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="type" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value, name) => [
                      formatNumber(Number(value)), 
                      name === 'count' ? 'Services' : name === 'avgCost' ? 'Avg Cost' : name
                    ]} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(220, 91%, 60%)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              {serviceTypes.map((service, index) => (
                <div key={service.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: VEHICLE_CATEGORY_COLORS[index % VEHICLE_CATEGORY_COLORS.length] }}
                    />
                    <span>{service.type}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(service.avgCost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Schedule</CardTitle>
          <CardDescription>Upcoming maintenance for all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceData
                .sort((a, b) => a.nextService.getTime() - b.nextService.getTime())
                .slice(0, 20)
                .map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </TableCell>
                  <TableCell className="font-mono">{vehicle.license_plate}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(vehicle.lastService, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(vehicle.nextService, { addSuffix: true })}
                  </TableCell>
                  <TableCell>{vehicle.serviceType}</TableCell>
                  <TableCell>
                    <Badge variant={
                      vehicle.isOverdue ? 'destructive' : 
                      vehicle.isDueSoon ? 'outline' : 'default'
                    }>
                      {vehicle.isOverdue ? 'Overdue' : 
                       vehicle.isDueSoon ? 'Due Soon' : 'Scheduled'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(vehicle.estimatedCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Current Maintenance Jobs */}
      {inMaintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Maintenance Jobs</CardTitle>
            <CardDescription>Vehicles currently being serviced</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inMaintenance.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </TableCell>
                    <TableCell>{vehicle.location || 'Main Garage'}</TableCell>
                    <TableCell>2 days ago</TableCell>
                    <TableCell>Tomorrow</TableCell>
                    <TableCell>
                      <Badge variant="outline">In Progress</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceReport;