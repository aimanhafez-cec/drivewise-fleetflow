// Dashboard Components - Optimized for Performance
// All exports are memoized for optimal rendering

// Core Dashboard
export { default as DashboardNew } from '@/pages/DashboardNew';

// Layout Components
export { DashboardHeader } from './DashboardHeader';
export { DashboardSection } from './DashboardSection';

// KPI Components
export { KPIGrid } from './KPIGrid';
export { DashboardKPICard } from './DashboardKPICard';

// Action & Alert Components
export { QuickActionsGrid } from './QuickActionsGrid';
export { AlertsPanel } from './AlertsPanel';
export { AlertItem } from './AlertItem';

// Financial Components
export { RevenueOverview } from './RevenueOverview';
export { PaymentStatusCard } from './PaymentStatusCard';

// Fleet Components
export { FleetStatusBoard } from './FleetStatusBoard';
export { FleetHealthIndicators } from './FleetHealthIndicators';

// Operations Components
export { AgreementsSummary } from './AgreementsSummary';
export { ComplianceOverview } from './ComplianceOverview';
export { CustodyStatus } from './CustodyStatus';
export { MaintenanceOverview } from './MaintenanceOverview';

// Activity & Customer Components
export { ActivityFeed } from './ActivityFeed';
export { CustomerInsights } from './CustomerInsights';

// Loading Components
export { KPICardSkeleton, ChartCardSkeleton, ListCardSkeleton } from './LoadingSkeleton';
