import { 
  Car, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Star,
  Calendar
} from 'lucide-react';
import { DashboardKPICard } from './DashboardKPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { AdminDashboardData } from '@/lib/api/admin-dashboard';

interface KPIGridProps {
  data: AdminDashboardData | null;
  isLoading: boolean;
}

import { useMemo, memo } from 'react';

export const KPIGrid = memo(function KPIGrid({ data, isLoading }: KPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 col-span-full text-center text-muted-foreground">
          <p>Unable to load dashboard data. Please try again.</p>
        </Card>
      </div>
    );
  }

  const { fleet, revenue, agreements, customers, maintenance, compliance } = data;

  // Memoize sparkline generation to prevent recalculation on every render
  const generateSparkline = useMemo(() => {
    return (baseValue: number, variation: number = 0.1) => {
      return Array.from({ length: 30 }, (_, i) => ({
        value: baseValue * (1 + (Math.random() - 0.5) * variation)
      }));
    };
  }, []);

  // Memoize KPI cards to prevent recreation on parent re-renders
  const kpiCards = useMemo(() => [
    {
      id: 'fleet-size',
      title: 'Total Fleet Size',
      value: fleet.totalFleetSize,
      icon: Car,
      colorScheme: 'primary' as const,
      subtitle: `${fleet.availableVehicles} available now`,
      chartData: generateSparkline(fleet.totalFleetSize, 0.05)
    },
    {
      id: 'utilization',
      title: 'Fleet Utilization Rate',
      value: `${fleet.utilizationRate.toFixed(1)}%`,
      icon: TrendingUp,
      colorScheme: fleet.utilizationRate >= 70 
        ? 'success' as const 
        : fleet.utilizationRate >= 50 
          ? 'warning' as const 
          : 'danger' as const,
      trend: {
        value: 5.2, // TODO: Calculate from historical data
        isPositive: true,
        label: 'vs last period'
      },
      subtitle: `${fleet.onRentVehicles} vehicles on rent`,
      chartData: generateSparkline(fleet.utilizationRate, 0.15)
    },
    {
      id: 'active-agreements',
      title: 'Active Agreements',
      value: agreements.activeAgreements,
      icon: FileText,
      colorScheme: 'info' as const,
      trend: {
        value: agreements.newAgreementsThisWeek,
        isPositive: agreements.newAgreementsThisWeek > 0,
        label: `${agreements.newAgreementsThisWeek} new this week`
      },
      chartData: generateSparkline(agreements.activeAgreements, 0.1)
    },
    {
      id: 'revenue-mtd',
      title: 'Monthly Revenue (MTD)',
      value: `AED ${revenue.totalRevenueMTD.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      colorScheme: 'success' as const,
      trend: {
        value: revenue.revenueGrowthRate,
        isPositive: revenue.revenueGrowthRate >= 0,
        label: 'vs last month'
      },
      subtitle: `Avg: AED ${revenue.averageTransactionValue.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`,
      chartData: data.trends.revenue.slice(-30).map(t => ({ value: t.value }))
    },
    {
      id: 'pending-returns',
      title: 'Pending Returns',
      value: agreements.pendingReturns,
      icon: Clock,
      colorScheme: agreements.overdueReturns > 0 ? 'danger' as const : 'warning' as const,
      alert: agreements.overdueReturns > 0 ? {
        count: agreements.overdueReturns,
        severity: 'critical' as const
      } : undefined,
      subtitle: agreements.overdueReturns > 0 
        ? `${agreements.overdueReturns} overdue` 
        : 'All on schedule'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Alerts',
      value: maintenance.openWorkOrders,
      icon: AlertTriangle,
      colorScheme: maintenance.criticalMaintenanceAlerts > 0 ? 'danger' as const : 'warning' as const,
      alert: maintenance.criticalMaintenanceAlerts > 0 ? {
        count: maintenance.criticalMaintenanceAlerts,
        severity: 'critical' as const
      } : undefined,
      subtitle: `${maintenance.scheduledThisWeek} scheduled this week`
    },
    {
      id: 'customer-satisfaction',
      title: 'Customer Satisfaction',
      value: customers.customerSatisfactionScore > 0 
        ? `${customers.customerSatisfactionScore.toFixed(1)}/5.0` 
        : 'N/A',
      icon: Star,
      colorScheme: customers.customerSatisfactionScore >= 4 
        ? 'success' as const 
        : customers.customerSatisfactionScore >= 3 
          ? 'warning' as const 
          : 'danger' as const,
      subtitle: `${customers.totalCustomers} total customers`,
      chartData: customers.customerSatisfactionScore > 0 
        ? generateSparkline(customers.customerSatisfactionScore, 0.1) 
        : undefined
    },
    {
      id: 'avg-duration',
      title: 'Avg Rental Duration',
      value: `${agreements.averageRentalDuration.toFixed(0)} days`,
      icon: Calendar,
      colorScheme: 'info' as const,
      subtitle: 'Per agreement',
      chartData: generateSparkline(agreements.averageRentalDuration, 0.2)
    }
  ], [fleet, revenue, agreements, customers, maintenance, data.trends.revenue, generateSparkline]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map(card => (
        <DashboardKPICard key={card.id} {...card} />
      ))}
    </div>
  );
});
