import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Receipt, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useCostComplianceDashboard } from '@/hooks/useCostCompliance';
import { useTollsFinesStatistics } from '@/hooks/useTollsFines';
import { useExceptionStatistics } from '@/hooks/useComplianceExceptions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface DashboardKPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const DashboardKPICard: React.FC<DashboardKPICardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  onClick,
}) => {
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CostComplianceDashboardProps {
  onTabChange: (tab: string) => void;
}

export const CostComplianceDashboard: React.FC<CostComplianceDashboardProps> = ({ onTabChange }) => {
  const { data: dashboardStats, isLoading: dashboardLoading } = useCostComplianceDashboard();
  const { data: tollsFinesStats, isLoading: tollsLoading } = useTollsFinesStatistics();
  const { data: exceptionStats, isLoading: exceptionsLoading } = useExceptionStatistics();

  const isLoading = dashboardLoading || tollsLoading || exceptionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Expenses',
      value: dashboardStats?.total_expenses_count || 0,
      description: 'Tracked expenses',
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => onTabChange('expenses'),
    },
    {
      title: 'Pending Tolls & Fines',
      value: formatCurrency(dashboardStats?.pending_tolls_fines || 0, 'AED'),
      description: `${dashboardStats?.total_tolls_fines_count || 0} total records`,
      icon: <DollarSign className="h-4 w-4" />,
      onClick: () => onTabChange('tolls'),
    },
    {
      title: 'Open Exceptions',
      value: dashboardStats?.open_exceptions || 0,
      description: `${exceptionStats?.by_severity?.find(s => s.severity === 'critical')?.count || 0} critical`,
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: () => onTabChange('exceptions'),
    },
    {
      title: 'Awaiting Approval',
      value: dashboardStats?.awaiting_approval || 0,
      description: 'Pending actions',
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <DashboardKPICard key={index} {...card} />
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Tolls & Fines Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tolls & Fines Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Paid</span>
              </div>
              <span className="font-medium">
                {tollsFinesStats?.paid_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>Pending</span>
              </div>
              <span className="font-medium">
                {tollsFinesStats?.pending_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Disputed</span>
              </div>
              <span className="font-medium">
                {tollsFinesStats?.disputed_count || 0}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => onTabChange('tolls')}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        {/* Exceptions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Exceptions by Severity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Critical</span>
              </div>
              <span className="font-medium">
                {exceptionStats?.by_severity?.find(s => s.severity === 'critical')?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>High</span>
              </div>
              <span className="font-medium">
                {exceptionStats?.by_severity?.find(s => s.severity === 'high')?.count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>Medium</span>
              </div>
              <span className="font-medium">
                {exceptionStats?.by_severity?.find(s => s.severity === 'medium')?.count || 0}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={() => onTabChange('exceptions')}
            >
              View All
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => onTabChange('expenses')}
            >
              <Receipt className="h-4 w-4 mr-2" />
              New Expense
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => onTabChange('tolls')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Toll/Fine
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => onTabChange('billing')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Billing
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
          <CardDescription>Access all Cost & Compliance features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => onTabChange('expenses')}
            >
              <Receipt className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Expenses</div>
                <div className="text-xs text-muted-foreground">Track vehicle expenses</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => onTabChange('tolls')}
            >
              <DollarSign className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Tolls & Fines</div>
                <div className="text-xs text-muted-foreground">Manage toll charges and violations</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => onTabChange('exceptions')}
            >
              <AlertTriangle className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Exceptions</div>
                <div className="text-xs text-muted-foreground">Review compliance issues</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 hover:bg-accent"
              onClick={() => onTabChange('billing')}
            >
              <FileText className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Billing Cycles</div>
                <div className="text-xs text-muted-foreground">Contract billing management</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
