import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimplePieChart, SimpleBarChart } from '@/components/charts';
import { Car, Users, Wrench, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useAllVehicles } from '@/hooks/useVehicles';

interface FleetStatusReportProps {
  dateRange: { from: Date; to: Date };
  filters: {
    branch: string;
    vehicleType: string;
    status: string;
  };
}

const FleetStatusReport: React.FC<FleetStatusReportProps> = ({ dateRange, filters }) => {
  const { data: vehicles = [], isLoading } = useAllVehicles();

  if (isLoading) {
    return <div className="text-center py-8">Loading fleet data...</div>;
  }

  // Calculate KPIs
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const utilizationRate = totalVehicles > 0 ? Math.round((rentedVehicles / totalVehicles) * 100) : 0;
  const overdueReturns = 3; // Mock data

  // Chart data
  const statusData = [
    { name: 'Available', value: availableVehicles, fill: 'hsl(var(--chart-1))' },
    { name: 'Rented', value: rentedVehicles, fill: 'hsl(var(--chart-2))' },
    { name: 'Maintenance', value: maintenanceVehicles, fill: 'hsl(var(--chart-3))' }
  ];

  const utilizationData = [
    { location: 'Downtown', utilization: 85 },
    { location: 'Airport', utilization: 92 },
    { location: 'Mall', utilization: 67 },
    { location: 'North Branch', utilization: 74 }
  ];

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Available',
      value: availableVehicles,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Rented',
      value: rentedVehicles,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'In Maintenance',
      value: maintenanceVehicles,
      icon: Wrench,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Utilization %',
      value: `${utilizationRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Overdue Returns',
      value: overdueReturns,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fleet Status & Utilization</h1>
        <p className="text-muted-foreground">Overview of vehicle availability and utilization metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-lg font-bold text-card-foreground">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Fleet Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={statusData} height={300} />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Utilization by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={utilizationData}
              xAxisKey="location"
              bars={[{ dataKey: 'utilization', name: 'Utilization %', color: 'hsl(var(--chart-2))' }]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Vehicle ID</TableHead>
                <TableHead className="text-muted-foreground">Make & Model</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Location</TableHead>
                <TableHead className="text-muted-foreground">License Plate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.slice(0, 10).map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-mono text-sm text-card-foreground">{vehicle.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-card-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">Downtown</TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">{vehicle.license_plate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetStatusReport;