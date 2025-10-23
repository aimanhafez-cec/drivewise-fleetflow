import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, ClipboardList, Calendar, Eye } from 'lucide-react';
import type { DashboardStats } from '@/lib/api/inspectionMaster';

interface InspectionDashboardCardsProps {
  stats: DashboardStats;
  onCardClick?: (type: string) => void;
}

export function InspectionDashboardCards({ stats, onCardClick }: InspectionDashboardCardsProps) {
  const cards = [
    {
      title: 'Upcoming Check-outs',
      value: stats.upcomingCheckouts,
      icon: ClipboardCheck,
      gradient: 'from-blue-500/10 to-cyan-500/10',
      iconColor: 'text-blue-600',
      filterType: 'RENTAL_CHECKOUT'
    },
    {
      title: 'Upcoming Check-ins',
      value: stats.upcomingCheckins,
      icon: ClipboardList,
      gradient: 'from-green-500/10 to-emerald-500/10',
      iconColor: 'text-green-600',
      filterType: 'RENTAL_CHECKIN'
    },
    {
      title: 'Periodic Inspections',
      value: stats.periodicInspections,
      icon: Calendar,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600',
      filterType: 'PERIODIC'
    },
    {
      title: 'Random Inspections',
      value: stats.randomInspections,
      icon: Eye,
      gradient: 'from-orange-500/10 to-red-500/10',
      iconColor: 'text-orange-600',
      filterType: 'RANDOM'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br ${card.gradient}`}
          onClick={() => onCardClick?.(card.filterType)}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
            </div>
            <card.icon className={`h-10 w-10 ${card.iconColor}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
