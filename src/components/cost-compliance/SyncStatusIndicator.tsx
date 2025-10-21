import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncStatusIndicatorProps {
  status: 'synced' | 'pending' | 'failed' | 'manual';
  lastSyncAt?: string;
  onSync?: () => void;
  isSyncing?: boolean;
  showTrigger?: boolean;
  className?: string;
}

const statusConfig = {
  synced: {
    icon: CheckCircle,
    label: 'Synced',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  pending: {
    icon: Clock,
    label: 'Pending Sync',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  failed: {
    icon: XCircle,
    label: 'Sync Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  manual: {
    icon: WifiOff,
    label: 'Manual Entry',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  },
};

export function SyncStatusIndicator({
  status,
  lastSyncAt,
  onSync,
  isSyncing = false,
  showTrigger = true,
  className = '',
}: SyncStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const tooltipContent = lastSyncAt
    ? `Last synced ${formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}`
    : config.label;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${config.className} flex items-center gap-1.5`}>
              <Icon className="h-3 w-3" />
              <span className="font-medium">{config.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showTrigger && onSync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
          className="h-7 w-7 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}

interface GlobalSyncStatusProps {
  autoSync: boolean;
  onToggleAutoSync: () => void;
  lastSyncAt?: string;
  onManualSync: () => void;
  isSyncing?: boolean;
  className?: string;
}

export function GlobalSyncStatus({
  autoSync,
  onToggleAutoSync,
  lastSyncAt,
  onManualSync,
  isSyncing = false,
  className = '',
}: GlobalSyncStatusProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border bg-card p-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Wifi className={`h-4 w-4 ${autoSync ? 'text-green-600' : 'text-muted-foreground'}`} />
        <div className="text-sm">
          <div className="font-medium">
            Auto-Sync: {autoSync ? 'On' : 'Off'}
          </div>
          {lastSyncAt && (
            <div className="text-xs text-muted-foreground">
              Last synced {formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAutoSync}
          className="h-8"
        >
          {autoSync ? 'Disable' : 'Enable'}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={onManualSync}
          disabled={isSyncing}
          className="h-8"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      </div>
    </div>
  );
}
