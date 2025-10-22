import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Calendar,
  AlertTriangle,
  Gauge,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MaintenanceKPIs } from '@/lib/api/admin-dashboard';

interface FleetHealthIndicatorsProps {
  maintenanceData: MaintenanceKPIs | undefined;
  isLoading: boolean;
}

interface VehicleHealthMetrics {
  avgFleetAge: number;
  highMileageCount: number;
  inspectionsPending: number;
  totalVehicles: number;
}

export function FleetHealthIndicators({ maintenanceData, isLoading }: FleetHealthIndicatorsProps) {
  const navigate = useNavigate();

  // Fetch additional health metrics
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['fleet-health-metrics'],
    queryFn: async (): Promise<VehicleHealthMetrics> => {
      const currentYear = new Date().getFullYear();

      // Get vehicle data for calculations
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, year');

      // Calculate average fleet age (using available year data)
      const vehiclesWithYear = vehicles?.filter(v => v.year) || [];
      const avgFleetAge = vehiclesWithYear.length 
        ? vehiclesWithYear.reduce((sum, v) => sum + (currentYear - v.year), 0) / vehiclesWithYear.length
        : 0;

      // High mileage count - placeholder (requires odometer data)
      const highMileageCount = 0; // TODO: Implement when odometer column available

      // Get pending inspections count
      const { count: inspectionsPending } = await supabase
        .from('inspection_out')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'DRAFT');

      return {
        avgFleetAge,
        highMileageCount,
        inspectionsPending: inspectionsPending || 0,
        totalVehicles: vehicles?.length || 0
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading || metricsLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  if (!maintenanceData || !healthMetrics) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load fleet health data</p>
        </div>
      </Card>
    );
  }

  const healthScore = Math.max(0, 100 - (
    (maintenanceData.criticalMaintenanceAlerts * 10) +
    (maintenanceData.openWorkOrders * 2) +
    (healthMetrics.highMileageCount * 3)
  ));

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Fleet Health</h3>
            <p className="text-sm text-muted-foreground">Maintenance & status</p>
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

      {/* Overall Health Score */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Health Score</span>
          <span className="text-2xl font-bold text-foreground">{healthScore}%</span>
        </div>
        <Progress 
          value={healthScore} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {healthScore >= 80 ? 'Excellent condition' : 
           healthScore >= 60 ? 'Good condition' : 
           healthScore >= 40 ? 'Needs attention' : 'Critical attention required'}
        </p>
      </div>

      {/* Health Indicators */}
      <div className="space-y-4">
        {/* Maintenance Schedule */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Maintenance Schedule</h4>
                <p className="text-xs text-muted-foreground">Upcoming services</p>
              </div>
            </div>
            {maintenanceData.scheduledThisWeek > 0 && (
              <Badge variant="secondary">
                {maintenanceData.scheduledThisWeek} this week
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Due for service</span>
            <span className="text-lg font-bold text-foreground">
              {maintenanceData.vehiclesDueForService}
            </span>
          </div>
        </div>

        {/* Open Work Orders */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Open Work Orders</h4>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
            {maintenanceData.criticalMaintenanceAlerts > 0 && (
              <Badge variant="destructive">
                {maintenanceData.criticalMaintenanceAlerts} critical
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active work orders</span>
            <span className="text-lg font-bold text-amber-600">
              {maintenanceData.openWorkOrders}
            </span>
          </div>
        </div>

        {/* Pending Inspections */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Pending Inspections</h4>
                <p className="text-xs text-muted-foreground">Awaiting completion</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Draft inspections</span>
            <span className="text-lg font-bold text-foreground">
              {healthMetrics.inspectionsPending}
            </span>
          </div>
        </div>

        {/* Fleet Age & Mileage */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Fleet Metrics</h4>
                <p className="text-xs text-muted-foreground">Age & mileage</p>
              </div>
            </div>
            {healthMetrics.highMileageCount > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {healthMetrics.highMileageCount} high km
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg fleet age</span>
              <span className="text-lg font-bold text-foreground">
                {healthMetrics.avgFleetAge.toFixed(1)} years
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High mileage vehicles</span>
              <span className="text-lg font-bold text-purple-600">
                {healthMetrics.highMileageCount}
              </span>
            </div>
          </div>
        </div>

        {/* Average Repair Time */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Avg Repair Time</h4>
                <p className="text-xs text-muted-foreground">Service efficiency</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Days to complete</span>
            <span className="text-lg font-bold text-foreground">
              {maintenanceData.averageRepairTime.toFixed(1)} days
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
