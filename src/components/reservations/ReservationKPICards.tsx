import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Clock, DollarSign, XCircle, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

export interface ReservationMetrics {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
  avgDaysToConfirm: number;
}

interface ReservationKPICardsProps {
  metrics: ReservationMetrics;
  isLoading?: boolean;
}

export const ReservationKPICards: React.FC<ReservationKPICardsProps> = ({ 
  metrics, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Reservations',
      value: metrics.totalReservations,
      icon: Calendar,
      description: 'All bookings',
    },
    {
      title: 'Confirmed',
      value: metrics.confirmedReservations,
      icon: CheckCircle,
      description: 'Ready to proceed',
      trend: metrics.totalReservations > 0 
        ? `${((metrics.confirmedReservations / metrics.totalReservations) * 100).toFixed(1)}%`
        : '0%'
    },
    {
      title: 'Pending',
      value: metrics.pendingReservations,
      icon: Clock,
      description: 'Awaiting confirmation',
      trend: metrics.totalReservations > 0 
        ? `${((metrics.pendingReservations / metrics.totalReservations) * 100).toFixed(1)}%`
        : '0%'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      description: 'From all reservations',
    },
    {
      title: 'Average Booking Value',
      value: formatCurrency(metrics.averageBookingValue),
      icon: TrendingUp,
      description: 'Per reservation',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: Package,
      description: 'Confirmed / Total',
    },
    {
      title: 'Completed',
      value: metrics.completedReservations,
      icon: CheckCircle,
      description: 'Successfully finished',
    },
    {
      title: 'Cancelled',
      value: metrics.cancelledReservations,
      icon: XCircle,
      description: 'Cancelled bookings',
      trend: metrics.totalReservations > 0 
        ? `${((metrics.cancelledReservations / metrics.totalReservations) * 100).toFixed(1)}%`
        : '0%'
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
              {kpi.trend && <span className="ml-2 text-primary">({kpi.trend})</span>}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
