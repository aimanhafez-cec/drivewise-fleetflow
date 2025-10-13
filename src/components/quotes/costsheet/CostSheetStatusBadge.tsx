import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

interface CostSheetStatusBadgeProps {
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  className?: string;
}

export const CostSheetStatusBadge: React.FC<CostSheetStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      variant: 'secondary' as const,
      icon: FileText,
      className: '',
    },
    pending_approval: {
      label: 'Pending Approval',
      variant: 'outline' as const,
      icon: Clock,
      className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
    },
    approved: {
      label: 'Approved',
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-500 text-white hover:bg-green-600',
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive' as const,
      icon: XCircle,
      className: '',
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};