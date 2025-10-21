import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";

interface ExceptionAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  exceptionNo?: string;
  onView?: () => void;
  onResolve?: () => void;
  className?: string;
}

const severityConfig = {
  low: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    badgeClassName: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  medium: {
    icon: AlertCircle,
    className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-950/20',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    badgeClassName: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  high: {
    icon: AlertTriangle,
    className: 'border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20',
    iconClassName: 'text-orange-600 dark:text-orange-400',
    badgeClassName: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  critical: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20',
    iconClassName: 'text-red-600 dark:text-red-400',
    badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export function ExceptionAlert({
  severity,
  title,
  description,
  exceptionNo,
  onView,
  onResolve,
  className = '',
}: ExceptionAlertProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} ${className}`}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTitle className="mb-0">{title}</AlertTitle>
            <Badge variant="outline" className={config.badgeClassName}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
            {exceptionNo && (
              <Badge variant="outline" className="font-mono text-xs">
                {exceptionNo}
              </Badge>
            )}
          </div>
          <AlertDescription>{description}</AlertDescription>
        </div>
        
        {(onView || onResolve) && (
          <div className="flex gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onView}
                className="h-8"
              >
                View
              </Button>
            )}
            {onResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={onResolve}
                className="h-8"
              >
                Resolve
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
}

interface ExceptionInlineIndicatorProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  count?: number;
  onClick?: () => void;
}

export function ExceptionInlineIndicator({
  severity,
  count = 1,
  onClick,
}: ExceptionInlineIndicatorProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium
        ${config.badgeClassName}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        transition-opacity
      `}
    >
      <Icon className="h-3 w-3" />
      <span>{count} Exception{count !== 1 ? 's' : ''}</span>
    </button>
  );
}
