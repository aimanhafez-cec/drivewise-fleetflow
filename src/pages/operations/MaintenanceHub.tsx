import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useMaintenanceStats } from '@/hooks/useWorkOrders';
import WorkOrdersList from './components/WorkOrdersList';

const MaintenanceHub: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useMaintenanceStats();

  const kpiCards = [
    {
      title: 'Open',
      value: stats?.open || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress || 0,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Urgent',
      value: stats?.byPriority?.urgent || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Closed (30d)',
      value: stats?.closed || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Manage vehicle maintenance, repairs, and service schedules
          </p>
        </div>
        <Button onClick={() => navigate('/operations/maintenance/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Work Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
          <CardDescription>
            View and manage all maintenance work orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkOrdersList />
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceHub;
