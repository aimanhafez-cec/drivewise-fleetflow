import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Ban,
  DollarSign,
  LucideIcon 
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'toll-fine' | 'exception' | 'billing';
  showIcon?: boolean;
  className?: string;
}

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: LucideIcon;
  className: string;
}

// Toll/Fine status configurations
const tollFineStatusConfig: Record<string, StatusConfig> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  acknowledged: {
    label: 'Acknowledged',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  paid: {
    label: 'Paid',
    variant: 'default',
    icon: DollarSign,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  disputed: {
    label: 'Disputed',
    variant: 'destructive',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  closed: {
    label: 'Closed',
    variant: 'secondary',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  },
};

// Exception status configurations
const exceptionStatusConfig: Record<string, StatusConfig> = {
  open: {
    label: 'Open',
    variant: 'destructive',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  resolved: {
    label: 'Resolved',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  dismissed: {
    label: 'Dismissed',
    variant: 'secondary',
    icon: Ban,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  },
};

// Billing cycle status configurations
const billingStatusConfig: Record<string, StatusConfig> = {
  open: {
    label: 'Open',
    variant: 'outline',
    icon: FileText,
    className: 'bg-muted/50 text-muted-foreground border-muted',
  },
  preview: {
    label: 'Preview',
    variant: 'secondary',
    icon: Clock,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  finalized: {
    label: 'Finalized',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  invoiced: {
    label: 'Invoiced',
    variant: 'default',
    icon: DollarSign,
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  },
};

export function StatusBadge({ 
  status, 
  type = 'toll-fine', 
  showIcon = true, 
  className = '' 
}: StatusBadgeProps) {
  const configMap = 
    type === 'exception' ? exceptionStatusConfig :
    type === 'billing' ? billingStatusConfig :
    tollFineStatusConfig;

  const config = configMap[status] || {
    label: status,
    variant: 'outline' as const,
    icon: FileText,
    className: 'bg-muted/50 text-muted-foreground',
  };

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
