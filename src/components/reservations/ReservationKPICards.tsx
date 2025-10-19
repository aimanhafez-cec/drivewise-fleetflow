import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPIData {
  totalReservations: number;
  pendingPayments: number;
  todayPickups: number;
  weekRevenue: number;
}

interface ReservationKPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

export const ReservationKPICards: React.FC<ReservationKPICardsProps> = ({
  data,
  isLoading,
}) => {
  const kpis = [
    {
      title: 'Open Reservations',
      value: data.totalReservations.toString(),
      subtitle: 'Active bookings',
      icon: Calendar,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(data.pendingPayments),
      subtitle: 'Awaiting collection',
      icon: DollarSign,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
    {
      title: "Today's Pickups",
      value: data.todayPickups.toString(),
      subtitle: 'Ready for handover',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: "This Week's Revenue",
      value: formatCurrency(data.weekRevenue),
      subtitle: 'From reservations',
      icon: Clock,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="border-border/50 hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : kpi.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
