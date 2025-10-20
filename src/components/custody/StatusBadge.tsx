import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  Ban,
  LucideIcon 
} from 'lucide-react';
import { CustodyStatus } from '@/lib/api/custody';

interface StatusBadgeProps {
  status: CustodyStatus;
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: LucideIcon;
  className: string;
}

const statusConfig: Record<CustodyStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    variant: 'outline',
    icon: FileText,
    className: 'bg-muted text-muted-foreground border-muted',
  },
  pending_approval: {
    label: 'Pending Approval',
    variant: 'secondary',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  active: {
    label: 'Active',
    variant: 'default',
    icon: PlayCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  closed: {
    label: 'Closed',
    variant: 'secondary',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
  voided: {
    label: 'Voided',
    variant: 'destructive',
    icon: Ban,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
};

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1.5 w-fit`}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
}
