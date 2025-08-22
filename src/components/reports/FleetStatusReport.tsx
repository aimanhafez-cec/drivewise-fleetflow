import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StandardPieChart, StandardBarChart } from '@/components/charts';
import { FLEET_STATUS_CONFIG } from '@/lib/chartConfig';
import { formatCurrency } from '@/lib/utils/currency';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface FleetStatusReportProps {
  dateRange?: DateRange;
}

export default function FleetStatusReport({ dateRange }: FleetStatusReportProps) {
  console.log('FleetStatusReport component rendered with dateRange:', dateRange);
  
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      console.log('Fetching vehicles for FleetStatusReport...');
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, status, location, daily_rate');
      
      if (error) throw error;
      console.log('FleetStatusReport vehicles data:', data);
      return data || [];
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('vehicle_id, pickup_location')
        .eq('status', 'confirmed');

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
    enabled: !isLoading,
  });

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  // Calculate status counts
  const statusCounts = vehicles.reduce((acc: Record<string, number>, vehicle) => {
    const status = vehicle.status || 'available';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for pie chart
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    status: status // Include status for color mapping
  }));

  console.log('FleetStatusReport pieData:', pieData);
  console.log('FleetStatusReport FLEET_STATUS_CONFIG:', FLEET_STATUS_CONFIG);

  // Calculate utilization by location
  const utilizationData = vehicles.reduce((acc: Record<string, { total: number; rented: number }>, vehicle) => {
    const location = vehicle.location || 'Unknown';
    if (!acc[location]) {
      acc[location] = { total: 0, rented: 0 };
    }
    acc[location].total += 1;
    if (vehicle.status === 'rented') {
      acc[location].rented += 1;
    }
    return acc;
  }, {});

  const utilizationChartData = Object.entries(utilizationData).map(([location, data]) => ({
    location,
    utilization: data.total > 0 ? Math.round((data.rented / data.total) * 100) : 0,
    total: data.total,
    rented: data.rented
  }));

  const utilizationConfig = {
    utilization: {
      label: "Utilization %",
      color: "hsl(var(--chart-1))",
    },
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'available': return 'default';
      case 'rented': return 'secondary';
      case 'maintenance': return 'outline';
      case 'damaged': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.available || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.rented || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.maintenance || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Out of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts['out of service'] || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Fleet Status Distribution</CardTitle>
            <CardDescription className="text-gray-300">
              Breakdown of vehicle status across the fleet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <StandardPieChart 
                data={pieData}
                config={FLEET_STATUS_CONFIG}
                height={300}
                showLegend={true}
              />
            ) : (
              <div className="text-white p-8 text-center">
                No chart data available. pieData length: {pieData.length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Utilization by Location</CardTitle>
            <CardDescription className="text-gray-300">
              Vehicle utilization percentage by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {utilizationChartData.length > 0 ? (
              <StandardBarChart
                data={utilizationChartData}
                config={utilizationConfig}
                height={300}
                xAxisKey="location"
                bars={[{ dataKey: "utilization", name: "Utilization %" }]}
                showLegend={false}
              />
            ) : (
              <div className="text-white p-8 text-center">
                No utilization data available. Data length: {utilizationChartData.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">All Vehicles</CardTitle>
          <CardDescription className="text-gray-300">
            Complete list of vehicles with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Vehicle</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Daily Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="text-white">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{vehicle.location || 'N/A'}</TableCell>
                  <TableCell className="text-white">{formatCurrency(vehicle.daily_rate || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}