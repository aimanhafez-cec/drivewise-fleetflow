import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInMinutes } from 'date-fns';

interface LeadSLATimerProps {
  slaDeadline: string | null;
  slaBreached: boolean;
  status: string;
}

export const LeadSLATimer = ({ slaDeadline, slaBreached, status }: LeadSLATimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!slaDeadline || status === 'confirmed' || status === 'rejected') {
      return;
    }

    const updateTimer = () => {
      const deadline = new Date(slaDeadline);
      const now = new Date();
      const minutesLeft = differenceInMinutes(deadline, now);

      if (isPast(deadline)) {
        setTimeRemaining('Overdue');
        setIsUrgent(true);
      } else {
        setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: true }));
        setIsUrgent(minutesLeft <= 15); // Mark as urgent if less than 15 minutes remaining
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [slaDeadline, status]);

  if (!slaDeadline || status === 'confirmed' || status === 'rejected') {
    return null;
  }

  if (slaBreached || isPast(new Date(slaDeadline))) {
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        SLA Breached
      </Badge>
    );
  }

  if (isUrgent) {
    return (
      <Badge variant="destructive" className="gap-1 bg-orange-500 hover:bg-orange-600">
        <Clock className="h-3 w-3" />
        Urgent: {timeRemaining}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" />
      {timeRemaining}
    </Badge>
  );
};
