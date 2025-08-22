import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SimpleBarChart } from '@/components/charts';
import { Wrench, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useAllVehicles } from '@/hooks/useVehicles';

interface MaintenanceReportProps {
  dateRange: { from: Date; to: Date };
  filters: {
    branch: string;
    vehicleType: string;
    status: string;
  };
}

const MaintenanceReport: React.FC<MaintenanceReportProps> = ({ dateRange, filters }) => {
  const { data: vehicles = [], isLoading } = useAllVehicles();

  if (isLoading) {
    return <div className="text-center py-8">Loading maintenance data...</div>;
  }

  // Mock maintenance data
  const vehiclesDue7Days = 5;
  const vehiclesDue30Days = 12;
  const openRepairTickets = 8;
  const avgDowntime = 2.5;

  const maintenanceSchedule = [
    {
      vehicleId: 'V001',
      make: 'Toyota',
      model: 'Camry',
      lastService: '2024-01-15',
      nextServiceDue: '2024-02-15',
      openTickets: 1,
      downtimeDays: 3,
      status: 'overdue'
    },
    {
      vehicleId: 'V002',
      make: 'Honda',
      model: 'Civic',
      lastService: '2024-01-20',
      nextServiceDue: '2024-02-20',
      openTickets: 0,
      downtimeDays: 0,
      status: 'due_soon'
    },
    {
      vehicleId: 'V003',
      make: 'Nissan',
      model: 'Altima',
      lastService: '2024-01-10',
      nextServiceDue: '2024-02-25',
      openTickets: 2,
      downtimeDays: 5,
      status: 'in_service'
    }
  ];

  const serviceTypeData = [
    { type: 'Oil Change', count: 15, avgCost: 45 },
    { type: 'Tire Rotation', count: 8, avgCost: 25 },
    { type: 'Brake Service', count: 5, avgCost: 180 },
    { type: 'Engine Repair', count: 3, avgCost: 350 }
  ];

  const kpiCards = [
    {
      title: 'Due Next 7 Days',
      value: vehiclesDue7Days,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Due Next 30 Days',
      value: vehiclesDue30Days,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Open Repair Tickets',
      value: openRepairTickets,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Avg. Downtime (Days)',
      value: avgDowntime,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'destructive';
      case 'due_soon':
        return 'secondary';
      case 'in_service':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due_soon':
        return 'Due Soon';
      case 'in_service':
        return 'In Service';
      default:
        return 'Up to Date';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Maintenance & Service Schedule</h1>
        <p className="text-muted-foreground">Vehicle maintenance tracking and service scheduling</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Service Type Analysis */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Service Type Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={serviceTypeData}
            xAxisKey="type"
            bars={[
              { dataKey: 'count', name: 'Service Count', color: 'hsl(var(--chart-1))' },
              { dataKey: 'avgCost', name: 'Avg Cost ($)', color: 'hsl(var(--chart-2))' }
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Maintenance Schedule Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Maintenance Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Vehicle ID</TableHead>
                <TableHead className="text-muted-foreground">Vehicle</TableHead>
                <TableHead className="text-muted-foreground">Last Service</TableHead>
                <TableHead className="text-muted-foreground">Next Service Due</TableHead>
                <TableHead className="text-muted-foreground">Open Tickets</TableHead>
                <TableHead className="text-muted-foreground">Downtime Days</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceSchedule.map((item) => (
                <TableRow key={item.vehicleId} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-mono text-sm text-card-foreground">{item.vehicleId}</TableCell>
                  <TableCell className="text-card-foreground">{item.make} {item.model}</TableCell>
                  <TableCell className="text-muted-foreground">{item.lastService}</TableCell>
                  <TableCell className="text-muted-foreground">{item.nextServiceDue}</TableCell>
                  <TableCell className="text-center">
                    {item.openTickets > 0 ? (
                      <Badge variant="destructive">{item.openTickets}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-card-foreground">{item.downtimeDays}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceReport;