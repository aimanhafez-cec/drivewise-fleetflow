import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'created' | 'payment' | 'status_change' | 'converted' | 'note';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'info';
  metadata?: any;
}

interface ReservationTimelineProps {
  events: TimelineEvent[];
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'created':
      return <Calendar className="h-4 w-4" />;
    case 'payment':
      return <CreditCard className="h-4 w-4" />;
    case 'status_change':
      return <Clock className="h-4 w-4" />;
    case 'converted':
      return <FileText className="h-4 w-4" />;
    case 'note':
      return <User className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

const getEventColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  }
};

export const ReservationTimeline: React.FC<ReservationTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={`z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background ${getEventColor(
                  event.status
                )}`}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                {/* Metadata */}
                {event.metadata && (
                  <div className="mt-2 p-2 bg-muted rounded-md text-xs space-y-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
