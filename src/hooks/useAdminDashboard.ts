import { useQuery } from '@tanstack/react-query';
import {
  fetchFleetKPIs,
  fetchRevenueKPIs,
  fetchAgreementKPIs,
  fetchCustomerKPIs,
  fetchMaintenanceKPIs,
  fetchComplianceKPIs,
  fetchRevenueTrend,
  fetchAlerts,
  type AdminDashboardData,
  type DateRangeFilter,
  type Alert
} from '@/lib/api/admin-dashboard';

export function useAdminDashboard(dateFilter: DateRangeFilter = { type: 'month' }) {
  // Fleet KPIs
  const {
    data: fleetData,
    isLoading: fleetLoading,
    error: fleetError
  } = useQuery({
    queryKey: ['admin-dashboard', 'fleet'],
    queryFn: fetchFleetKPIs,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000 // Auto-refresh every 2 minutes
  });

  // Revenue KPIs
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError
  } = useQuery({
    queryKey: ['admin-dashboard', 'revenue', dateFilter],
    queryFn: fetchRevenueKPIs,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Agreement KPIs
  const {
    data: agreementData,
    isLoading: agreementLoading,
    error: agreementError
  } = useQuery({
    queryKey: ['admin-dashboard', 'agreements', dateFilter],
    queryFn: fetchAgreementKPIs,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Customer KPIs
  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError
  } = useQuery({
    queryKey: ['admin-dashboard', 'customers', dateFilter],
    queryFn: fetchCustomerKPIs,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Maintenance KPIs
  const {
    data: maintenanceData,
    isLoading: maintenanceLoading,
    error: maintenanceError
  } = useQuery({
    queryKey: ['admin-dashboard', 'maintenance'],
    queryFn: fetchMaintenanceKPIs,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Compliance KPIs
  const {
    data: complianceData,
    isLoading: complianceLoading,
    error: complianceError
  } = useQuery({
    queryKey: ['admin-dashboard', 'compliance'],
    queryFn: fetchComplianceKPIs,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000
  });

  // Revenue trend (30 days)
  const {
    data: revenueTrend,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ['admin-dashboard', 'revenue-trend', 30],
    queryFn: () => fetchRevenueTrend(30),
    staleTime: 5 * 60 * 1000 // 5 minutes for trends
  });

  // Alerts
  const {
    data: alerts,
    isLoading: alertsLoading
  } = useQuery({
    queryKey: ['admin-dashboard', 'alerts'],
    queryFn: fetchAlerts,
    staleTime: 1 * 60 * 1000, // 1 minute for alerts
    refetchInterval: 1 * 60 * 1000 // More frequent refresh for alerts
  });

  // Aggregate loading state
  const isLoading = 
    fleetLoading || 
    revenueLoading || 
    agreementLoading || 
    customerLoading || 
    maintenanceLoading || 
    complianceLoading ||
    trendLoading ||
    alertsLoading;

  // Aggregate error state
  const error = 
    fleetError || 
    revenueError || 
    agreementError || 
    customerError || 
    maintenanceError || 
    complianceError;

  // Construct dashboard data
  const dashboardData: AdminDashboardData | null = 
    fleetData && revenueData && agreementData && customerData && maintenanceData && complianceData
      ? {
          fleet: fleetData,
          revenue: revenueData,
          agreements: agreementData,
          customers: customerData,
          maintenance: maintenanceData,
          compliance: complianceData,
          trends: {
            revenue: revenueTrend || [],
            agreements: [], // TODO: Implement
            utilization: [] // TODO: Implement
          }
        }
      : null;

  return {
    data: dashboardData,
    alerts: alerts || [],
    isLoading,
    error,
    // Individual data access for granular loading states
    fleet: fleetData,
    revenue: revenueData,
    agreements: agreementData,
    customers: customerData,
    maintenance: maintenanceData,
    compliance: complianceData,
    trends: {
      revenue: revenueTrend || []
    }
  };
}

// Separate hook for real-time alerts (can be used independently)
export function useAdminDashboardAlerts() {
  return useQuery({
    queryKey: ['admin-dashboard', 'alerts'],
    queryFn: fetchAlerts,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000 // Refresh every 30 seconds
  });
}

// Hook for specific KPI section (for lazy loading)
export function useFleetKPIs() {
  return useQuery({
    queryKey: ['admin-dashboard', 'fleet'],
    queryFn: fetchFleetKPIs,
    staleTime: 2 * 60 * 1000
  });
}

export function useRevenueKPIs() {
  return useQuery({
    queryKey: ['admin-dashboard', 'revenue'],
    queryFn: fetchRevenueKPIs,
    staleTime: 2 * 60 * 1000
  });
}
