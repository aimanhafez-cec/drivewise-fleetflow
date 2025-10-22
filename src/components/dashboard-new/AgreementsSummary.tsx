import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import type { AgreementKPIs } from '@/lib/api/admin-dashboard';

interface AgreementsSummaryProps {
  agreementData: AgreementKPIs | undefined;
  isLoading: boolean;
}

export function AgreementsSummary({ agreementData, isLoading }: AgreementsSummaryProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </Card>
    );
  }

  if (!agreementData) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Unable to load agreement data</p>
        </div>
      </Card>
    );
  }

  const totalAgreements = 
    agreementData.agreementTypeDistribution.daily +
    agreementData.agreementTypeDistribution.weekly +
    agreementData.agreementTypeDistribution.monthly +
    agreementData.agreementTypeDistribution.longTerm;

  const getPercentage = (value: number) => {
    return totalAgreements > 0 ? ((value / totalAgreements) * 100).toFixed(1) : '0.0';
  };

  const agreementTypes = [
    { 
      name: 'Daily Rentals', 
      count: agreementData.agreementTypeDistribution.daily,
      color: 'bg-blue-500',
      icon: Calendar
    },
    { 
      name: 'Weekly Rentals', 
      count: agreementData.agreementTypeDistribution.weekly,
      color: 'bg-green-500',
      icon: Calendar
    },
    { 
      name: 'Monthly Contracts', 
      count: agreementData.agreementTypeDistribution.monthly,
      color: 'bg-amber-500',
      icon: FileText
    },
    { 
      name: 'Long-Term Leasing', 
      count: agreementData.agreementTypeDistribution.longTerm,
      color: 'bg-purple-500',
      icon: TrendingUp
    }
  ];

  // Mock upcoming events (next 7 days)
  const upcomingEvents = [
    { 
      date: new Date(), 
      type: 'checkout', 
      count: Math.floor(Math.random() * 5) + 1 
    },
    { 
      date: addDays(new Date(), 1), 
      type: 'return', 
      count: Math.floor(Math.random() * 3) + 1 
    },
    { 
      date: addDays(new Date(), 2), 
      type: 'checkout', 
      count: Math.floor(Math.random() * 4) + 1 
    }
  ];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Active Agreements</h3>
            <p className="text-sm text-muted-foreground">Current contracts</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/agreements')}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-foreground">
            {agreementData.activeAgreements}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Active</p>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-2xl font-bold text-green-600">
            {agreementData.newAgreementsThisWeek}
          </p>
          <p className="text-xs text-muted-foreground mt-1">New This Week</p>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {agreementData.averageRentalDuration.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Days</p>
        </div>
      </div>

      {/* Agreement Types Distribution */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-foreground">By Agreement Type</h4>
        {agreementTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{type.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {type.count}
                  </span>
                  <span className="text-xs text-muted-foreground min-w-[45px] text-right">
                    {getPercentage(type.count)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${type.color} transition-all duration-500`}
                  style={{ width: `${getPercentage(type.count)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h4>
        <div className="space-y-2">
          {upcomingEvents.map((event, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(event.date, 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.type === 'checkout' ? 'Scheduled Checkouts' : 'Expected Returns'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold">
                {event.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Returns Alert */}
      {agreementData.pendingReturns > 0 && (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Pending Returns
              </h4>
              <p className="text-xs text-muted-foreground">
                {agreementData.pendingReturns} vehicle{agreementData.pendingReturns !== 1 ? 's' : ''} due back
              </p>
            </div>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate('/agreements?status=pending_return')}
            >
              Review
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
