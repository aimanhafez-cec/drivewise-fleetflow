import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, AlertCircle, DollarSign, FileText, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Agreement {
  id: string;
  status: string;
  total_amount: number;
  checkout_datetime: string | null;
  return_datetime: string | null;
  agreement_date: string;
}

interface AgreementKPIDashboardProps {
  agreements: Agreement[];
}

export const AgreementKPIDashboard: React.FC<AgreementKPIDashboardProps> = ({ agreements }) => {
  // Calculate KPIs
  const activeAgreements = agreements.filter(a => a.status === 'active');
  const activeRevenue = activeAgreements.reduce((sum, a) => sum + (a.total_amount || 0), 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingReturnsToday = agreements.filter(a => 
    a.status === 'active' && 
    a.return_datetime && 
    new Date(a.return_datetime).toDateString() === today.toDateString()
  );
  
  const overdueReturns = agreements.filter(a => 
    a.status === 'active' && 
    a.return_datetime && 
    new Date(a.return_datetime) < today
  );
  
  const outstandingBalance = agreements.reduce((sum, a) => {
    if (a.status === 'active' || a.status === 'pending_return') {
      return sum + (a.total_amount || 0);
    }
    return sum;
  }, 0);
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const revenueThisMonth = agreements
    .filter(a => {
      const date = new Date(a.agreement_date || a.checkout_datetime);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    })
    .reduce((sum, a) => sum + (a.total_amount || 0), 0);
  
  const avgAgreementValue = agreements.length > 0 
    ? agreements.reduce((sum, a) => sum + (a.total_amount || 0), 0) / agreements.length 
    : 0;

  const kpis = [
    {
      title: 'Active Agreements',
      value: activeAgreements.length,
      subtitle: formatCurrency(activeRevenue),
      icon: FileText,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Pending Returns Today',
      value: pendingReturnsToday.length,
      subtitle: overdueReturns.length > 0 ? `${overdueReturns.length} overdue` : 'On track',
      icon: Clock,
      trend: overdueReturns.length > 0 ? 'Needs attention' : 'Good',
      trendUp: overdueReturns.length === 0,
    },
    {
      title: 'Overdue Returns',
      value: overdueReturns.length,
      subtitle: overdueReturns.length > 0 ? 'Action required' : 'All on time',
      icon: AlertCircle,
      variant: overdueReturns.length > 0 ? 'destructive' : 'default',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(outstandingBalance),
      subtitle: `${activeAgreements.length + pendingReturnsToday.length} open agreements`,
      icon: DollarSign,
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(revenueThisMonth),
      subtitle: `${agreements.filter(a => {
        const date = new Date(a.agreement_date || a.checkout_datetime);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      }).length} agreements`,
      icon: TrendingUp,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Average Agreement Value',
      value: formatCurrency(avgAgreementValue),
      subtitle: `From ${agreements.length} total`,
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.subtitle}
              </p>
              {kpi.trend && (
                <div className={`flex items-center text-xs mt-1 ${
                  kpi.trendUp ? 'text-green-600' : 'text-muted-foreground'
                }`}>
                  {kpi.trend}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
