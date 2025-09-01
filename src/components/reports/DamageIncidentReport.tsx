import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SimpleLineChart } from '@/components/charts';
import { AlertTriangle, DollarSign, Car, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DamageIncidentReportProps {
  dateRange: { from: Date; to: Date };
  filters: {
    branch: string;
    vehicleType: string;
    status: string;
  };
}

export const DamageIncidentReport: React.FC<DamageIncidentReportProps> = ({ dateRange, filters }) => {
  const { data: damageRecords = [], isLoading } = useQuery({
    queryKey: ['damage-records', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('damage_records')
        .select('*')
        .gte('recorded_at', dateRange.from.toISOString())
        .lte('recorded_at', dateRange.to.toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading damage data...</div>;
  }

  // Calculate KPIs
  const totalIncidents = damageRecords.length;
  const totalRepairCost = damageRecords.reduce((sum, record) => sum + (record.repair_cost || 0), 0);
  const activeVehiclesDamaged = damageRecords.filter(r => r.repair_status === 'pending').length;
  const activeDamagePercentage = 15; // Mock percentage

  // Mock trend data
  const damageTypeData = [
    { month: 'Jan', scratch: 5, dent: 3, mechanical: 2, accident: 1 },
    { month: 'Feb', scratch: 8, dent: 4, mechanical: 3, accident: 2 },
    { month: 'Mar', scratch: 6, dent: 5, mechanical: 1, accident: 1 },
    { month: 'Apr', scratch: 7, dent: 2, mechanical: 4, accident: 3 }
  ];

  const damageIncidents = [
    {
      vehicleId: 'V001',
      damageType: 'Scratch',
      cost: 350,
      repairStatus: 'completed',
      notes: 'Minor scratch on rear door',
      photo: '/placeholder-damage.jpg',
      date: '2024-02-10'
    },
    {
      vehicleId: 'V002',
      damageType: 'Dent',
      cost: 180,
      repairStatus: 'pending',
      notes: 'Small dent on front bumper',
      photo: '/placeholder-damage.jpg',
      date: '2024-02-12'
    },
    {
      vehicleId: 'V003',
      damageType: 'Mechanical',
      cost: 850,
      repairStatus: 'in_progress',
      notes: 'Engine diagnostic required',
      photo: '/placeholder-damage.jpg',
      date: '2024-02-14'
    }
  ];

  const kpiCards = [
    {
      title: 'Total Incidents',
      value: totalIncidents,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Repair Cost',
      value: `$${totalRepairCost.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Vehicles with Damage',
      value: activeVehiclesDamaged,
      icon: Car,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '% Fleet Damaged',
      value: `${activeDamagePercentage}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-card-foreground">Vehicle Damage & Incident Report</h1>
        <p className="text-muted-foreground">Track vehicle damage, repair costs, and incident trends</p>
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

      {/* Damage Trend Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Damage Type Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleLineChart
            data={damageTypeData}
            xAxisKey="month"
            lines={[
              { dataKey: 'scratch', name: 'Scratches', color: 'hsl(var(--chart-1))' },
              { dataKey: 'dent', name: 'Dents', color: 'hsl(var(--chart-2))' },
              { dataKey: 'mechanical', name: 'Mechanical', color: 'hsl(var(--chart-3))' },
              { dataKey: 'accident', name: 'Accidents', color: 'hsl(var(--chart-4))' }
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Damage Incidents Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Photo</TableHead>
                <TableHead className="text-muted-foreground">Vehicle ID</TableHead>
                <TableHead className="text-muted-foreground">Damage Type</TableHead>
                <TableHead className="text-muted-foreground">Cost</TableHead>
                <TableHead className="text-muted-foreground">Repair Status</TableHead>
                <TableHead className="text-muted-foreground">Notes</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {damageIncidents.map((incident, index) => (
                <TableRow key={index} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={incident.photo} alt="Damage photo" />
                      <AvatarFallback>
                        <AlertTriangle className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground">{incident.vehicleId}</TableCell>
                  <TableCell className="text-card-foreground">{incident.damageType}</TableCell>
                  <TableCell className="text-card-foreground">${incident.cost}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(incident.repairStatus)}>
                      {getStatusLabel(incident.repairStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{incident.notes}</TableCell>
                  <TableCell className="text-muted-foreground">{incident.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DamageIncidentReport;