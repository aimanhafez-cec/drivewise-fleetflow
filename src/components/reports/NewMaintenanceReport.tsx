import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimplePieChart, SimpleBarChart } from '@/components/charts/SimpleCharts';
import { DateRange } from 'react-day-picker';

interface NewMaintenanceReportProps {
  dateRange?: DateRange;
}

export const NewMaintenanceReport: React.FC<NewMaintenanceReportProps> = ({ dateRange }) => {
  // Fetch vehicles data for maintenance analysis
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['maintenance-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch damage records for maintenance needs
  const { data: damageRecords, isLoading: damageLoading } = useQuery({
    queryKey: ['damage-records', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('damage_records')
        .select('*, vehicles(make, model, year, license_plate)');

      if (dateRange?.from) {
        query = query.gte('recorded_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('recorded_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = vehiclesLoading || damageLoading;

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

  // Calculate maintenance metrics
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0;
  const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;
  const totalDamageRecords = damageRecords?.length || 0;
  const pendingRepairs = damageRecords?.filter(d => d.repair_status === 'pending').length || 0;

  // Vehicle status for pie chart
  const statusCounts = vehicles?.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    value: count
  }));

  // Damage severity distribution
  const severityCounts = damageRecords?.reduce((acc, record) => {
    const severity = record.severity || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const severityData = Object.entries(severityCounts).map(([severity, count]) => ({
    severity: severity.charAt(0).toUpperCase() + severity.slice(1),
    count
  }));

  // Repair costs by vehicle
  const vehicleRepairCosts = damageRecords?.reduce((acc, record) => {
    if (record.vehicles && record.repair_cost) {
      const vehicleKey = `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}`;
      acc[vehicleKey] = (acc[vehicleKey] || 0) + Number(record.repair_cost);
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const repairCostData = Object.entries(vehicleRepairCosts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([vehicle, cost]) => ({
      vehicle: vehicle.length > 25 ? vehicle.substring(0, 25) + '...' : vehicle,
      cost: Math.round(cost)
    }));

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'maintenance': return 'destructive';
      case 'rented': return 'secondary';
      default: return 'outline';
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{maintenanceVehicles}</div>
            <p className="text-xs text-white/70">Vehicles being serviced</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Available Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{availableVehicles}</div>
            <p className="text-xs text-white/70">Ready for service</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Damage Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalDamageRecords}</div>
            <p className="text-xs text-white/70">Reported incidents</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingRepairs}</div>
            <p className="text-xs text-white/70">Awaiting service</p>
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
            <SimplePieChart data={statusData} height={300} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Damage Severity Breakdown</CardTitle>
            <CardDescription className="text-white/70">
              Distribution of damage severity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={severityData}
              xAxisKey="severity"
              bars={[{ dataKey: 'count', name: 'Incidents' }]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Repair Costs */}
      {repairCostData.length > 0 && (
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Repair Costs by Vehicle</CardTitle>
            <CardDescription className="text-white/70">
              Top vehicles by repair expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={repairCostData}
              xAxisKey="vehicle"
              bars={[{ dataKey: 'cost', name: 'Repair Cost' }]}
              height={300}
              formatter={(value: number) => [formatCurrency(value), 'Cost']}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Damage Records */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Damage Reports</CardTitle>
          <CardDescription className="text-white/70">
            Latest damage incidents requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-white">Vehicle</th>
                  <th className="text-left p-2 text-white">Damage Type</th>
                  <th className="text-left p-2 text-white">Severity</th>
                  <th className="text-left p-2 text-white">Repair Status</th>
                  <th className="text-left p-2 text-white">Repair Cost</th>
                  <th className="text-left p-2 text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {damageRecords?.slice(0, 10).map((record) => (
                  <tr key={record.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-2 text-white">
                      {record.vehicles ? 
                        `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}` :
                        'Unknown Vehicle'
                      }
                    </td>
                    <td className="p-2 text-white">{record.damage_type}</td>
                    <td className="p-2">
                      <Badge variant={record.severity === 'high' ? 'destructive' : 
                                   record.severity === 'medium' ? 'secondary' : 'default'}>
                        {record.severity || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="p-2 text-white">{record.repair_status}</td>
                    <td className="p-2 text-white">
                      {record.repair_cost ? formatCurrency(Number(record.repair_cost)) : 'TBD'}
                    </td>
                    <td className="p-2 text-white">
                      {new Date(record.recorded_at).toLocaleDateString()}
                    </td>
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