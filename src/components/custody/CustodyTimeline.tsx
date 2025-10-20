import { format, differenceInDays } from 'date-fns';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CustodyTransaction } from '@/lib/api/custody';

interface CustodyTimelineProps {
  custody: CustodyTransaction;
  className?: string;
}

interface TimelineEvent {
  date: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export function CustodyTimeline({ custody, className = '' }: CustodyTimelineProps) {
  const events: TimelineEvent[] = [
    {
      date: custody.created_at,
      label: 'Created',
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-muted-foreground',
    },
  ];

  if (custody.approved_at) {
    events.push({
      date: custody.approved_at,
      label: 'Approved',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600',
    });
  }

  events.push({
    date: custody.effective_from,
    label: custody.status === 'active' ? 'Handover' : 'Scheduled Handover',
    icon: <Clock className="h-4 w-4" />,
    color: custody.status === 'active' ? 'text-blue-600' : 'text-muted-foreground',
  });

  if (custody.expected_return_date) {
    events.push({
      date: custody.expected_return_date,
      label: 'Expected Return',
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-orange-600',
    });
  }

  if (custody.actual_return_date) {
    events.push({
      date: custody.actual_return_date,
      label: 'Returned',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600',
    });
  }

  if (custody.closed_at) {
    events.push({
      date: custody.closed_at,
      label: custody.status === 'voided' ? 'Voided' : 'Closed',
      icon: custody.status === 'voided' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />,
      color: custody.status === 'voided' ? 'text-red-600' : 'text-gray-600',
    });
  }

  // Calculate duration
  const startDate = new Date(custody.effective_from);
  const endDate = custody.actual_return_date 
    ? new Date(custody.actual_return_date)
    : custody.expected_return_date
    ? new Date(custody.expected_return_date)
    : new Date();
  
  const durationDays = differenceInDays(endDate, startDate);

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Custody Timeline</h3>
          <span className="text-sm text-muted-foreground">
            Duration: {durationDays} {durationDays === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Timeline Bar */}
        <div className="relative mb-8">
          <div className="h-2 w-full rounded-full bg-muted">
            {/* Active portion */}
            {custody.status === 'active' && (
              <div 
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: '60%' }}
              />
            )}
            {custody.status === 'closed' && (
              <div className="h-full rounded-full bg-gray-400" />
            )}
          </div>

          {/* SLA Breach Indicator */}
          {custody.sla_breached && (
            <div className="absolute right-0 top-0 -mt-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </div>

        {/* Timeline Events */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 ${event.color}`}>
                {event.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.date), 'PPp')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SLA Warning */}
        {custody.sla_breached && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            ⚠️ SLA targets breached
          </div>
        )}
      </CardContent>
    </Card>
  );
}
