import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Code2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardProgress, StepStatus } from '@/types/agreement-wizard';

interface ProgressDebugPanelProps {
  progress: WizardProgress;
  progressSummary: {
    completed: number;
    visited: number;
    skipped: number;
    total: number;
    hasErrors: boolean;
    percentage: number;
    isComplete: boolean;
  };
  allStepsStatus: Record<number, StepStatus>;
  onClearProgress: () => void;
  onResetStep: (step: number) => void;
}

export const ProgressDebugPanel: React.FC<ProgressDebugPanelProps> = ({
  progress,
  progressSummary,
  allStepsStatus,
  onClearProgress,
  onResetStep,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'has-errors':
        return 'bg-red-500/10 text-red-700 border-red-300';
      case 'incomplete':
        return 'bg-amber-500/10 text-amber-700 border-amber-300';
      case 'not-visited':
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="fixed top-20 right-4 z-50"
      >
        <Code2 className="h-4 w-4 mr-2" />
        Debug Panel
      </Button>
    );
  }

  return (
    <Card className="fixed top-20 right-4 z-50 w-[400px] shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Progress Debug Panel
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Completed:</span>{' '}
              <Badge variant="outline" className="ml-1">
                {progressSummary.completed}/{progressSummary.total}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Visited:</span>{' '}
              <Badge variant="outline" className="ml-1">
                {progressSummary.visited}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Skipped:</span>{' '}
              <Badge variant="outline" className="ml-1">
                {progressSummary.skipped}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Progress:</span>{' '}
              <Badge variant="outline" className="ml-1">
                {progressSummary.percentage}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Current State */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Current State</h4>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-muted-foreground">Step:</span>{' '}
              <Badge>{progress.currentStep}</Badge>
            </div>
            {progress.lastModifiedStep !== undefined && (
              <div>
                <span className="text-muted-foreground">Last Modified:</span>{' '}
                <Badge variant="secondary">{progress.lastModifiedStep}</Badge>
              </div>
            )}
            {progress.lastModifiedAt && (
              <div>
                <span className="text-muted-foreground">Modified At:</span>{' '}
                <span className="text-xs">
                  {new Date(progress.lastModifiedAt).toLocaleTimeString()}
                </span>
              </div>
            )}
            {progress.lastSaved && (
              <div>
                <span className="text-muted-foreground">Last Saved:</span>{' '}
                <span className="text-xs">
                  {new Date(progress.lastSaved).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">Step Status</h4>
          <div className="space-y-1">
            {Object.entries(allStepsStatus).map(([step, status]) => (
              <div key={step} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">
                    {step}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStatusColor(status))}
                  >
                    {status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResetStep(parseInt(step))}
                  className="h-6 px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearProgress}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
