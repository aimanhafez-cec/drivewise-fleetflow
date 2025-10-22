import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Wrench,
  Calendar,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MaintenanceKPIs } from '@/lib/api/admin-dashboard';

interface MaintenanceOverviewProps {
  maintenanceData: MaintenanceKPIs | undefined;
  isLoading: boolean;
}

export function MaintenanceOverview({ maintenanceData, isLoading }: MaintenanceOverviewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  if (!maintenanceData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load maintenance data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Maintenance Overview</h3>
            <p className="text-sm text-muted-foreground">Service & repairs</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/maintenance')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">Open</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {maintenanceData.openWorkOrders}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Work Orders</p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {maintenanceData.scheduledThisWeek}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This Week</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {maintenanceData.criticalMaintenanceAlerts > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Critical Alerts</h4>
                <p className="text-xs text-muted-foreground">Requires immediate attention</p>
              </div>
            </div>
            <Badge variant="destructive">
              {maintenanceData.criticalMaintenanceAlerts}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => navigate('/maintenance?priority=critical')}
          >
            View Critical Items
          </Button>
        </div>
      )}

      {/* Maintenance Metrics */}
      <div className="space-y-4 mb-6">
        {/* Vehicles Due for Service */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Due for Service</h4>
                <p className="text-xs text-muted-foreground">Scheduled maintenance</p>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {maintenanceData.vehiclesDueForService}
            </span>
            <span className="text-sm text-muted-foreground">vehicles</span>
          </div>
        </div>

        {/* Average Repair Time */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Avg Repair Time</h4>
                <p className="text-xs text-muted-foreground">Service efficiency</p>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {maintenanceData.averageRepairTime.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <div className="mt-2">
            <Badge 
              variant={maintenanceData.averageRepairTime <= 3 ? "default" : "secondary"}
              className={maintenanceData.averageRepairTime <= 3 ? "bg-green-500" : ""}
            >
              {maintenanceData.averageRepairTime <= 3 ? "Excellent" : "Standard"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        {maintenanceData.openWorkOrders > 0 && (
          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate('/maintenance/work-orders')}
          >
            <span>View Open Work Orders</span>
            <Badge variant="secondary">{maintenanceData.openWorkOrders}</Badge>
          </Button>
        )}
        {maintenanceData.scheduledThisWeek > 0 && (
          <Button 
            className="w-full justify-between"
            variant="outline"
            onClick={() => navigate('/maintenance/schedule')}
          >
            <span>This Week's Schedule</span>
            <Badge variant="secondary">{maintenanceData.scheduledThisWeek}</Badge>
          </Button>
        )}
        <Button 
          className="w-full"
          onClick={() => navigate('/maintenance/work-orders/new')}
        >
          Create Work Order
        </Button>
      </div>
    </Card>
  );
}
