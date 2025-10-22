import { useState } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardHeader } from '@/components/dashboard-new/DashboardHeader';
import { KPIGrid } from '@/components/dashboard-new/KPIGrid';
import { QuickActionsGrid } from '@/components/dashboard-new/QuickActionsGrid';
import { AlertsPanel } from '@/components/dashboard-new/AlertsPanel';
import { RevenueOverview } from '@/components/dashboard-new/RevenueOverview';
import { PaymentStatusCard } from '@/components/dashboard-new/PaymentStatusCard';
import { FleetStatusBoard } from '@/components/dashboard-new/FleetStatusBoard';
import { FleetHealthIndicators } from '@/components/dashboard-new/FleetHealthIndicators';
import { AgreementsSummary } from '@/components/dashboard-new/AgreementsSummary';
import { CustomerInsights } from '@/components/dashboard-new/CustomerInsights';
import { ActivityFeed } from '@/components/dashboard-new/ActivityFeed';
import { ComplianceOverview } from '@/components/dashboard-new/ComplianceOverview';
import { CustodyStatus } from '@/components/dashboard-new/CustodyStatus';
import { MaintenanceOverview } from '@/components/dashboard-new/MaintenanceOverview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { DateRangeFilter } from '@/lib/api/admin-dashboard';

export default function DashboardNew() {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ type: 'month' });
  
  const {
    data: dashboardData,
    alerts,
    isLoading,
    error,
    fleet,
    revenue,
    agreements,
    customers,
    maintenance,
    trends
  } = useAdminDashboard(dateFilter);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Error State
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <DashboardHeader
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
      />

      {/* KPI Cards Grid */}
      <section>
        <KPIGrid data={dashboardData} isLoading={isLoading} />
      </section>

      {/* Quick Actions + Alerts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActionsGrid 
            pendingReturns={agreements?.pendingReturns}
            openWorkOrders={maintenance?.openWorkOrders}
          />
        </div>
        <div>
          <AlertsPanel 
            alerts={alerts} 
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </section>

      {/* Revenue + Payment Status Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueOverview 
            revenueData={revenue}
            trendData={trends.revenue}
            isLoading={isLoading}
          />
        </div>
        <div>
          <PaymentStatusCard />
        </div>
      </section>

      {/* Fleet Status + Fleet Health Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FleetStatusBoard 
          fleetData={fleet}
          isLoading={isLoading}
        />
        <FleetHealthIndicators 
          maintenanceData={maintenance}
          isLoading={isLoading}
        />
      </section>

      {/* Agreements + Compliance Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgreementsSummary 
          agreementData={agreements}
          isLoading={isLoading}
        />
        <ComplianceOverview />
      </section>

      {/* Custody + Maintenance Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustodyStatus />
        <MaintenanceOverview 
          maintenanceData={maintenance}
          isLoading={isLoading}
        />
      </section>

      {/* Activity Feed + Customer Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <CustomerInsights 
            customerData={customers}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-6" />
    </div>
  );
}
