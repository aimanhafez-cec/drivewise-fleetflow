import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelperTooltipProps {
  content: string;
  variant?: 'info' | 'help';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const HelperTooltip: React.FC<HelperTooltipProps> = ({
  content,
  variant = 'help',
  side = 'top',
  className,
}) => {
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'hover:bg-muted transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              className
            )}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Help</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
