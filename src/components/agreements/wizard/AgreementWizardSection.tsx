import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { AgreementStepGroup } from '@/lib/wizardLogic/agreementStepGroups';
import type { StepStatus } from '@/types/agreement-wizard';

interface AgreementWizardSectionProps {
  group: AgreementStepGroup;
  steps: Array<{ number: number; title: string; description: string }>;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  stepValidationStatus: Record<number, StepStatus>;
  onStepClick: (step: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  children: React.ReactNode;
}

export const AgreementWizardSection: React.FC<AgreementWizardSectionProps> = ({
  group,
  steps,
  currentStep,
  completedSteps,
  skippedSteps,
  stepValidationStatus,
  onStepClick,
  isExpanded,
  onToggleExpand,
  children,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isCurrentGroupActive = group.steps.includes(currentStep);
  
  const completionPercentage = Math.round(
    (completedSteps.filter((s) => group.steps.includes(s)).length /
      group.steps.length) *
      100
  );
  const isGroupComplete = completionPercentage === 100;

  // Auto-scroll to section when it becomes active
  useEffect(() => {
    if (isCurrentGroupActive && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
        });
      }, 100);
    }
  }, [isCurrentGroupActive]);

  return (
    <Card
      ref={sectionRef}
      data-step={group.steps[0]}
      className={cn(
        'border-2 transition-all',
        isCurrentGroupActive
          ? 'border-primary shadow-lg'
          : isGroupComplete
          ? 'border-emerald-500/50'
          : 'border-border/50'
      )}
    >
      <CardHeader
        className={cn(
          'cursor-pointer hover:bg-accent/50 transition-colors',
          isCurrentGroupActive && 'bg-primary/5 sticky top-0 z-10 backdrop-blur-sm'
        )}
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Icon */}
            <div
              className={cn(
                'text-2xl p-3 rounded-lg bg-gradient-to-br',
                group.color || 'from-gray-500 to-gray-600'
              )}
            >
              {group.icon}
            </div>

            {/* Title & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{group.title}</h3>
                {isGroupComplete && (
                  <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-300">
                    <Check className="h-3 w-3" />
                    Complete
                  </Badge>
                )}
                {isCurrentGroupActive && !isGroupComplete && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    In Progress
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {group.description}
              </p>
              <div className="flex items-center gap-2">
                <Progress value={completionPercentage} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      {/* Collapsible Content */}
      {isExpanded && (
        <CardContent className="pt-4">
          {/* Step Navigation */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            {steps
              .filter((step) => group.steps.includes(step.number))
              .map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = completedSteps.includes(step.number);
                const isSkipped = skippedSteps.includes(step.number);
                const status = stepValidationStatus[step.number];
                const hasErrors = status === 'has-errors';

                return (
                  <Button
                    key={step.number}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'justify-start h-auto py-3 px-4',
                      isCompleted && !isActive && 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100',
                      hasErrors && 'border-destructive/50 bg-destructive/5',
                      isSkipped && 'opacity-50 bg-muted'
                    )}
                    onClick={() => onStepClick(step.number)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Step Number */}
                      <div
                        className={cn(
                          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm',
                          isActive
                            ? 'bg-background text-primary'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : hasErrors
                            ? 'bg-destructive/10 text-destructive'
                            : isSkipped
                            ? 'bg-muted-foreground/20 text-muted-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted && !isActive ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          step.number
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 text-left">
                        <div className={cn(
                          'font-semibold text-sm',
                          isSkipped && 'line-through'
                        )}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isSkipped && (
                        <Badge variant="outline" className="text-xs bg-muted">
                          Skipped
                        </Badge>
                      )}
                      {hasErrors && !isSkipped && (
                        <Badge variant="destructive" className="text-xs">
                          Errors
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
          </div>

          {/* Current Step Content */}
          {isCurrentGroupActive && (
            <div className="border-t pt-4 mt-4" data-step={currentStep}>
              {children}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
