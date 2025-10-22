import { useState, useCallback, useMemo, memo } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { ErrorBoundary } from '@/components/ui/error-boundary';
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

function DashboardNew() {
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

  // Enable real-time subscriptions with automatic data refresh
  const { invalidateAllDashboardData } = useDashboardRealtime({
    enabled: true
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleRefresh = useCallback(() => {
    invalidateAllDashboardData();
  }, [invalidateAllDashboardData]);

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
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen animate-fade-in">
      {/* Header */}
      <ErrorBoundary>
        <DashboardHeader
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onRefresh={handleRefresh}
          isRefreshing={isLoading}
        />
      </ErrorBoundary>

      {/* KPI Cards Grid */}
      <ErrorBoundary>
        <section className="animate-fade-in">
          <KPIGrid data={dashboardData} isLoading={isLoading} />
        </section>
      </ErrorBoundary>

      {/* Quick Actions + Alerts Row */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
      </ErrorBoundary>

      {/* Revenue + Payment Status Row */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
      </ErrorBoundary>

      {/* Fleet Status + Fleet Health Row */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <FleetStatusBoard 
            fleetData={fleet}
            isLoading={isLoading}
          />
          <FleetHealthIndicators 
            maintenanceData={maintenance}
            isLoading={isLoading}
          />
        </section>
      </ErrorBoundary>

      {/* Agreements + Compliance Row */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <AgreementsSummary 
            agreementData={agreements}
            isLoading={isLoading}
          />
          <ComplianceOverview />
        </section>
      </ErrorBoundary>

      {/* Custody + Maintenance Row */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CustodyStatus />
          <MaintenanceOverview 
            maintenanceData={maintenance}
            isLoading={isLoading}
          />
        </section>
      </ErrorBoundary>

      {/* Activity Feed + Customer Insights */}
      <ErrorBoundary>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
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
      </ErrorBoundary>

      {/* Footer Spacing */}
      <div className="h-6" />
    </div>
  );
}

// Export default memoized component to prevent unnecessary re-renders
export default memo(DashboardNew);
