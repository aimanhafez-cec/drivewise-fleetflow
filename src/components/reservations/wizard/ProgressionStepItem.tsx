import React from 'react';
import { Check, AlertCircle, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepStatus } from '@/types/agreement-wizard';

interface ProgressionStepItemProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  isCurrentStep: boolean;
  onClick: () => void;
}

export const ProgressionStepItem: React.FC<ProgressionStepItemProps> = ({
  stepNumber,
  title,
  description,
  status,
  isCurrentStep,
  onClick,
}) => {
  const getStatusIcon = () => {
    if (status === 'complete') {
      return <Check className="h-4 w-4 text-emerald-600" />;
    }
    if (status === 'has-errors') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (isCurrentStep) {
      return <Circle className="h-4 w-4 text-primary fill-primary" />;
    }
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    if (status === 'complete') return 'border-emerald-500 bg-emerald-50/50';
    if (status === 'has-errors') return 'border-destructive bg-destructive/5';
    if (isCurrentStep) return 'border-primary bg-primary/5';
    return 'border-border bg-background';
  };

  const getTextColor = () => {
    if (status === 'complete') return 'text-emerald-700';
    if (status === 'has-errors') return 'text-destructive';
    if (isCurrentStep) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
        'hover:shadow-sm hover:border-primary/50',
        getStatusColor()
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* Step Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium', getTextColor())}>
            Step {stepNumber}
          </span>
          {status === 'has-errors' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
              Error
            </span>
          )}
        </div>
        <p className={cn('text-sm font-medium truncate', getTextColor())}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {description}
        </p>
      </div>

      {/* Navigate Icon */}
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
};
