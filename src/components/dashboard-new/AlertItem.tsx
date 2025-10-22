import { AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface AlertItemProps {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
}

export function AlertItem({ type, title, message, timestamp, actionUrl }: AlertItemProps) {
  const navigate = useNavigate();

  const typeConfig = {
    critical: {
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-l-red-500',
      iconColor: 'text-red-600',
      dotColor: 'bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-l-amber-500',
      iconColor: 'text-amber-600',
      dotColor: 'bg-amber-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-600',
      dotColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleClick = () => {
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  return (
    <div
      className={cn(
        "p-4 border-l-4 rounded-r-lg transition-all duration-200",
        config.bgColor,
        config.borderColor,
        actionUrl && "cursor-pointer hover:shadow-md"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-1.5 rounded-lg", config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground">
              {title}
            </h4>
            {actionUrl && (
              <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {message}
          </p>

          <div className="flex items-center gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
