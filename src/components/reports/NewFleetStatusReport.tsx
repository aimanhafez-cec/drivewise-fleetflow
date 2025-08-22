import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimplePieChart, SimpleBarChart } from '@/components/charts/SimpleCharts';
import { DateRange } from 'react-day-picker';

interface NewFleetStatusReportProps {
  dateRange?: DateRange;
}

export const NewFleetStatusReport: React.FC<NewFleetStatusReportProps> = ({ dateRange }) => {
  // Fetch vehicles data
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch reservations for utilization calculation
  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('*')
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
  });

  const isLoading = vehiclesLoading || reservationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/20">
              <CardContent className="p-6">
                <div className="h-6 bg-white/20 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-white/20 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate status counts
  const statusCounts = vehicles?.reduce((acc, vehicle) => {
    const status = vehicle.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Prepare pie chart data
  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count
  }));

  // Calculate utilization by location
  const locationUtilization = vehicles?.reduce((acc, vehicle) => {
    const location = vehicle.location || 'Unknown';
    if (!acc[location]) {
      acc[location] = { total: 0, rented: 0 };
    }
    acc[location].total += 1;
    if (vehicle.status === 'rented') {
      acc[location].rented += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; rented: number }>) || {};

  const barChartData = Object.entries(locationUtilization).map(([location, data]) => ({
    location: location,
    utilization: Math.round((data.rented / data.total) * 100),
    total: data.total,
    rented: data.rented
  }));

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'rented': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const formatPercentage = (value: number, name: string): [string, string] => [`${value}%`, name];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{vehicles?.length || 0}</div>
            <p className="text-xs text-white/70">Fleet size</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.available || 0}</div>
            <p className="text-xs text-white/70">Ready for rental</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Currently Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.rented || 0}</div>
            <p className="text-xs text-white/70">Out on rental</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{statusCounts.maintenance || 0}</div>
            <p className="text-xs text-white/70">Service required</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Fleet Status Distribution</CardTitle>
            <CardDescription className="text-white/70">
              Current status of all vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={pieChartData} height={300} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Utilization by Location</CardTitle>
            <CardDescription className="text-white/70">
              Vehicle utilization percentage by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={barChartData}
              xAxisKey="location"
              bars={[{ dataKey: 'utilization', name: 'Utilization %' }]}
              height={300}
              formatter={formatPercentage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Vehicle Details</CardTitle>
          <CardDescription className="text-white/70">
            Complete list of fleet vehicles with current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-white">Vehicle</th>
                  <th className="text-left p-2 text-white">License Plate</th>
                  <th className="text-left p-2 text-white">Location</th>
                  <th className="text-left p-2 text-white">Status</th>
                  <th className="text-left p-2 text-white">Odometer</th>
                  <th className="text-left p-2 text-white">Fuel Level</th>
                </tr>
              </thead>
              <tbody>
                {vehicles?.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2 text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </td>
                    <td className="p-2 text-white">{vehicle.license_plate}</td>
                    <td className="p-2 text-white">{vehicle.location || 'N/A'}</td>
                    <td className="p-2">
                      <Badge variant={getStatusVariant(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-white">{vehicle.odometer?.toLocaleString() || 'N/A'} mi</td>
                    <td className="p-2 text-white">{vehicle.fuel_level || 'N/A'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};