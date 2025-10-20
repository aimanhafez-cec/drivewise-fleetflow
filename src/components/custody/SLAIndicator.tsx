import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { differenceInMinutes, format } from 'date-fns';

interface SLAIndicatorProps {
  targetTime?: string;
  label: string;
  breached?: boolean;
  className?: string;
}

export function SLAIndicator({
  targetTime,
  label,
  breached = false,
  className = '',
}: SLAIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [status, setStatus] = useState<'safe' | 'warning' | 'danger' | 'breached'>('safe');

  useEffect(() => {
    if (!targetTime) {
      setTimeRemaining('Not set');
      setStatus('safe');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetTime);
      const minutesRemaining = differenceInMinutes(target, now);

      if (breached || minutesRemaining < 0) {
        setStatus('breached');
        setTimeRemaining(`Breached ${Math.abs(minutesRemaining)}m ago`);
      } else if (minutesRemaining < 60) {
        // Less than 1 hour
        setStatus('danger');
        setTimeRemaining(`${minutesRemaining}m`);
      } else if (minutesRemaining < 120) {
        // Less than 2 hours
        setStatus('warning');
        const hours = Math.floor(minutesRemaining / 60);
        const mins = minutesRemaining % 60;
        setTimeRemaining(`${hours}h ${mins}m`);
      } else {
        setStatus('safe');
        const hours = Math.floor(minutesRemaining / 60);
        const mins = minutesRemaining % 60;
        setTimeRemaining(`${hours}h ${mins}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetTime, breached]);

  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'danger':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'breached':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getIcon = () => {
    if (status === 'breached' || status === 'danger') {
      return <AlertCircle className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  if (!targetTime) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">Not scheduled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${status === 'breached' ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${getStatusColor()}`}>{getIcon()}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
              {status === 'breached'
                ? 'SLA breached'
                : `Due: ${format(new Date(targetTime), 'MMM dd, HH:mm')}`}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor()} font-mono text-base`}>
              {timeRemaining}
            </Badge>
            {status === 'breached' && (
              <p className="mt-1 text-xs text-red-600">Action required</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {status !== 'breached' && targetTime && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  status === 'danger'
                    ? 'bg-orange-500'
                    : status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.max(
                    10,
                    Math.min(
                      100,
                      (differenceInMinutes(new Date(targetTime), new Date()) / 240) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
