import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, subDays, subMonths } from 'date-fns';

// ============================================
// TypeScript Interfaces
// ============================================

export interface DateRangeFilter {
  type: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface FleetKPIs {
  totalFleetSize: number;
  availableVehicles: number;
  onRentVehicles: number;
  maintenanceVehicles: number;
  outOfServiceVehicles: number;
  utilizationRate: number; // Percentage
  availabilityRate: number; // Percentage
}

export interface RevenueKPIs {
  totalRevenueMTD: number;
  totalRevenueYTD: number;
  revenueLastMonth: number;
  revenueGrowthRate: number; // Percentage
  averageTransactionValue: number;
  outstandingReceivables: number;
}

export interface AgreementKPIs {
  activeAgreements: number;
  pendingReturns: number;
  overdueReturns: number;
  newAgreementsThisWeek: number;
  averageRentalDuration: number; // Days
  agreementTypeDistribution: {
    daily: number;
    weekly: number;
    monthly: number;
    longTerm: number;
  };
}

export interface CustomerKPIs {
  totalCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomerRate: number; // Percentage
  customerSatisfactionScore: number; // Out of 5
  topCustomersByRevenue: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

export interface MaintenanceKPIs {
  vehiclesDueForService: number;
  openWorkOrders: number;
  criticalMaintenanceAlerts: number;
  averageRepairTime: number; // Days
  scheduledThisWeek: number;
}

export interface ComplianceKPIs {
  pendingTollsAmount: number;
  pendingFinesAmount: number;
  openExceptions: number;
  activeCustodyTransactions: number;
  slaComplianceRate: number; // Percentage
}

export interface TrendData {
  date: string;
  value: number;
}

export interface AdminDashboardData {
  fleet: FleetKPIs;
  revenue: RevenueKPIs;
  agreements: AgreementKPIs;
  customers: CustomerKPIs;
  maintenance: MaintenanceKPIs;
  compliance: ComplianceKPIs;
  trends: {
    revenue: TrendData[];
    agreements: TrendData[];
    utilization: TrendData[];
  };
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
}

// ============================================
// Helper Functions
// ============================================

export function getDateRangeFromFilter(filter: DateRangeFilter): { start: Date; end: Date } {
  const now = new Date();
  
  switch (filter.type) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
    case 'month':
      return { start: startOfMonth(now), end: now };
    case 'quarter':
      return { start: startOfQuarter(now), end: now };
    case 'year':
      return { start: startOfYear(now), end: now };
    case 'custom':
      return {
        start: filter.startDate || startOfMonth(now),
        end: filter.endDate || now
      };
    default:
      return { start: startOfMonth(now), end: now };
  }
}

// ============================================
// API Functions
// ============================================

export async function fetchFleetKPIs(): Promise<FleetKPIs> {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, status');

  if (error) throw error;

  const totalFleetSize = vehicles?.length || 0;
  const statusCounts = vehicles?.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const availableVehicles = statusCounts['available'] || 0;
  const onRentVehicles = statusCounts['rented'] || 0;
  const maintenanceVehicles = statusCounts['maintenance'] || 0;
  const outOfServiceVehicles = statusCounts['out_of_service'] || 0;

  const utilizationRate = totalFleetSize > 0 ? (onRentVehicles / totalFleetSize) * 100 : 0;
  const availabilityRate = totalFleetSize > 0 ? (availableVehicles / totalFleetSize) * 100 : 0;

  return {
    totalFleetSize,
    availableVehicles,
    onRentVehicles,
    maintenanceVehicles,
    outOfServiceVehicles,
    utilizationRate,
    availabilityRate
  };
}

export async function fetchRevenueKPIs(): Promise<RevenueKPIs> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfDay(subDays(monthStart, 1));

  // Current month revenue
  const { data: currentMonthInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .gte('created_at', monthStart.toISOString())
    .lte('created_at', now.toISOString());

  // Year-to-date revenue
  const { data: ytdInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .gte('created_at', yearStart.toISOString())
    .lte('created_at', now.toISOString());

  // Last month revenue
  const { data: lastMonthInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .gte('created_at', lastMonthStart.toISOString())
    .lte('created_at', lastMonthEnd.toISOString());

  // Outstanding receivables
  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .in('status', ['pending', 'overdue']);

  const totalRevenueMTD = currentMonthInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
  const totalRevenueYTD = ytdInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
  const revenueLastMonth = lastMonthInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
  const outstandingReceivables = unpaidInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

  const revenueGrowthRate = revenueLastMonth > 0 
    ? ((totalRevenueMTD - revenueLastMonth) / revenueLastMonth) * 100 
    : 0;

  const invoiceCount = currentMonthInvoices?.length || 1;
  const averageTransactionValue = totalRevenueMTD / invoiceCount;

  return {
    totalRevenueMTD,
    totalRevenueYTD,
    revenueLastMonth,
    revenueGrowthRate,
    averageTransactionValue,
    outstandingReceivables
  };
}

export async function fetchAgreementKPIs(): Promise<AgreementKPIs> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  // Active agreements
  const { data: activeAgreements } = await supabase
    .from('agreements')
    .select('id, status, agreement_type, checkout_datetime, return_datetime')
    .in('status', ['active', 'pending_return']);

  // Pending and overdue returns
  const pendingReturns = activeAgreements?.filter(a => a.status === 'pending_return').length || 0;
  const overdueReturns = activeAgreements?.filter(a => {
    if (a.return_datetime && a.status === 'pending_return') {
      return new Date(a.return_datetime) < now;
    }
    return false;
  }).length || 0;

  // New agreements this week
  const { data: newAgreements } = await supabase
    .from('agreements')
    .select('id')
    .gte('created_at', weekStart.toISOString());

  // Agreement type distribution
  const typeDistribution = activeAgreements?.reduce((acc, a) => {
    const type = a.agreement_type || 'daily';
    acc[type as keyof typeof acc] = (acc[type as keyof typeof acc] || 0) + 1;
    return acc;
  }, { daily: 0, weekly: 0, monthly: 0, longTerm: 0 }) || { daily: 0, weekly: 0, monthly: 0, longTerm: 0 };

  // Average rental duration
  const durations = activeAgreements
    ?.filter(a => a.checkout_datetime && a.return_datetime)
    .map(a => {
      const checkout = new Date(a.checkout_datetime!);
      const returnDate = new Date(a.return_datetime!);
      return (returnDate.getTime() - checkout.getTime()) / (1000 * 60 * 60 * 24);
    }) || [];

  const averageRentalDuration = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;

  return {
    activeAgreements: activeAgreements?.length || 0,
    pendingReturns,
    overdueReturns,
    newAgreementsThisWeek: newAgreements?.length || 0,
    averageRentalDuration,
    agreementTypeDistribution: typeDistribution
  };
}

export async function fetchCustomerKPIs(): Promise<CustomerKPIs> {
  const now = new Date();
  const monthStart = startOfMonth(now);

  // Total customers
  const { data: customers, count: totalCustomers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' });

  // New customers this month
  const { count: newCustomersThisMonth } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .gte('created_at', monthStart.toISOString());

  // Top customers by revenue
  const { data: topCustomers } = await supabase
    .from('invoices')
    .select(`
      customer_id,
      total_amount,
      profiles!customer_id (
        id,
        full_name
      )
    `)
    .order('total_amount', { ascending: false })
    .limit(5);

  const topCustomersByRevenue = topCustomers?.reduce((acc, inv) => {
    const customerId = inv.customer_id;
    const existing = acc.find(c => c.id === customerId);
    const customerName = (inv.profiles as any)?.full_name || 'Unknown';
    
    if (existing) {
      existing.revenue += Number(inv.total_amount);
    } else {
      acc.push({
        id: customerId,
        name: customerName,
        revenue: Number(inv.total_amount)
      });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; revenue: number; }>)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) || [];

  // Customer satisfaction (based on resolved support tickets)
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('status')
    .eq('status', 'resolved');

  const customerSatisfactionScore = tickets?.length ? 4.2 : 0; // Placeholder calculation

  const repeatCustomerRate = 0; // TODO: Implement repeat customer logic

  return {
    totalCustomers: totalCustomers || 0,
    newCustomersThisMonth: newCustomersThisMonth || 0,
    repeatCustomerRate,
    customerSatisfactionScore,
    topCustomersByRevenue
  };
}

export async function fetchMaintenanceKPIs(): Promise<MaintenanceKPIs> {
  const now = new Date();
  const weekEnd = endOfDay(subDays(startOfWeek(now, { weekStartsOn: 1 }), -7));

  // Open work orders
  const { data: openWorkOrders } = await supabase
    .from('work_orders')
    .select('id, status, created_at, completed_at')
    .in('status', ['open', 'in_progress', 'waiting_parts']);

  // Scheduled this week
  const { data: scheduledWorkOrders } = await supabase
    .from('work_orders')
    .select('id')
    .gte('created_at', startOfWeek(now, { weekStartsOn: 1 }).toISOString())
    .lte('created_at', weekEnd.toISOString());

  // Calculate average repair time
  const { data: completedWorkOrders } = await supabase
    .from('work_orders')
    .select('created_at, completed_at')
    .eq('status', 'closed')
    .not('completed_at', 'is', null)
    .limit(100);

  const repairTimes = completedWorkOrders
    ?.filter(wo => wo.completed_at)
    .map(wo => {
      const created = new Date(wo.created_at);
      const completed = new Date(wo.completed_at!);
      return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }) || [];

  const averageRepairTime = repairTimes.length > 0
    ? repairTimes.reduce((sum, t) => sum + t, 0) / repairTimes.length
    : 0;

  return {
    vehiclesDueForService: 0, // TODO: Implement based on mileage/date logic
    openWorkOrders: openWorkOrders?.length || 0,
    criticalMaintenanceAlerts: 0, // TODO: Implement based on maintenance rules
    averageRepairTime,
    scheduledThisWeek: scheduledWorkOrders?.length || 0
  };
}

export async function fetchComplianceKPIs(): Promise<ComplianceKPIs> {
  // Active custody transactions
  const { data: custodyTransactions } = await supabase
    .from('custody_transactions')
    .select('id, status')
    .in('status', ['pending_approval', 'approved', 'active']);

  return {
    pendingTollsAmount: 0, // TODO: Implement when tolls table available
    pendingFinesAmount: 0, // TODO: Implement when fines table available
    openExceptions: 0, // TODO: Implement when exceptions table available
    activeCustodyTransactions: custodyTransactions?.length || 0,
    slaComplianceRate: 95 // Placeholder
  };
}

export async function fetchRevenueTrend(days: number = 30): Promise<TrendData[]> {
  const startDate = subDays(new Date(), days);
  
  const { data: invoices } = await supabase
    .from('invoices')
    .select('created_at, total_amount')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Group by date
  const trendMap = new Map<string, number>();
  invoices?.forEach(inv => {
    const date = new Date(inv.created_at).toISOString().split('T')[0];
    trendMap.set(date, (trendMap.get(date) || 0) + Number(inv.total_amount));
  });

  return Array.from(trendMap.entries()).map(([date, value]) => ({
    date,
    value
  }));
}

export async function fetchAlerts(): Promise<Alert[]> {
  const now = new Date();
  const alerts: Alert[] = [];

  // Overdue returns
  const { data: overdueAgreements } = await supabase
    .from('agreements')
    .select('id, agreement_no, return_datetime')
    .eq('status', 'pending_return')
    .lt('return_datetime', now.toISOString())
    .limit(5);

  overdueAgreements?.forEach(agreement => {
    alerts.push({
      id: `overdue-${agreement.id}`,
      type: 'critical',
      title: 'Overdue Return',
      message: `Agreement ${agreement.agreement_no || agreement.id} is overdue`,
      timestamp: new Date(agreement.return_datetime!),
      actionUrl: `/agreements/${agreement.id}`
    });
  });

  // Pending work orders
  const { data: pendingWorkOrders } = await supabase
    .from('work_orders')
    .select('id, created_at')
    .eq('status', 'open')
    .limit(3);

  pendingWorkOrders?.forEach(wo => {
    alerts.push({
      id: `work-order-${wo.id}`,
      type: 'warning',
      title: 'Pending Work Order',
      message: `Work order ${wo.id} needs attention`,
      timestamp: new Date(wo.created_at),
      actionUrl: `/maintenance/work-orders/${wo.id}`
    });
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
