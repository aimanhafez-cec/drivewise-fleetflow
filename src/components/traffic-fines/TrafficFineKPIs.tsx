import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, MapPin } from 'lucide-react';
import { useTrafficFinesCorporateStatistics } from '@/hooks/useTrafficFinesCorporate';
import type { TrafficFineFilters } from '@/lib/api/trafficFinesCorporate';
import { Skeleton } from '@/components/ui/skeleton';

interface TrafficFineKPIsProps {
  filters?: TrafficFineFilters;
}

export function TrafficFineKPIs({ filters }: TrafficFineKPIsProps) {
  const { data: stats, isLoading } = useTrafficFinesCorporateStatistics(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-24" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const kpiData = [
    {
      title: 'Total Unpaid',
      value: `AED ${stats.unpaid_amount.toLocaleString()}`,
      subtitle: `${stats.unpaid_count} fines`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Fines Count',
      value: stats.total_count.toString(),
      subtitle: `${stats.paid_count} paid, ${stats.disputed_count} disputed`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Most Fines Emirate',
      value: stats.by_emirate[0]?.emirate || 'N/A',
      subtitle: stats.by_emirate[0] 
        ? `${stats.by_emirate[0].count} fines (${Math.round((stats.by_emirate[0].count / stats.total_count) * 100)}%)`
        : 'No data',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
