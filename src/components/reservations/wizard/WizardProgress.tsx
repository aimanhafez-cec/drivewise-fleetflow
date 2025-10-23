import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepStatus } from './ReservationWizardContext';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
  completedSteps: number[];
  stepValidationStatus: Record<number, StepStatus>;
  onStepClick: (stepNumber: number) => void;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  steps,
  completedSteps,
  stepValidationStatus,
  onStepClick,
}) => {
  const getStepIcon = (step: number, status: StepStatus, isCurrent: boolean) => {
    if (status === 'complete') {
      return <Check className="h-5 w-5" />;
    }
    if (status === 'has-errors' || status === 'incomplete') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <span className="font-semibold">{step}</span>;
  };

  const getStepStyles = (stepNumber: number, status: StepStatus, isCurrent: boolean) => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isClickable = stepNumber <= currentStep || isCompleted || stepNumber === currentStep + 1;

    // Completed step
    if (isCompleted || status === 'complete') {
      return {
        circle: 'bg-green-500 border-green-500 text-white cursor-pointer hover:bg-green-600 transition-all',
        text: 'text-foreground',
        clickable: true,
      };
    }

    // Current step
    if (isCurrent) {
      return {
        circle: 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 cursor-pointer',
        text: 'text-foreground',
        clickable: true,
      };
    }

    // Has errors / Incomplete / Not visited - all amber until completed
    return {
      circle: 'border-amber-500 bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100 transition-all',
      text: 'text-foreground',
      clickable: true,
    };
  };

  const completedCount = completedSteps.length;
  const incompleteCount = Object.values(stepValidationStatus || {}).filter(
    (status) => status === 'has-errors' || status === 'incomplete'
  ).length;

  return (
    <div className="w-full px-4 py-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount} of {totalSteps} steps completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
          
          {/* Completion Status Summary */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span>{completedCount} completed</span>
              </div>
              {incompleteCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>{incompleteCount} need attention</span>
                </div>
              )}
            </div>
            <span className="text-muted-foreground/70">
              Click any step to navigate
            </span>
          </div>
        </div>

        {/* Steps - Scrollable Horizontal */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className="flex items-center min-w-max px-4">
              {steps.map((step, index) => {
                const isCurrent = currentStep === step.number;
                const status = (stepValidationStatus?.[step.number]) ?? 'not-visited';
                const styles = getStepStyles(step.number, status, isCurrent);

                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center w-32 flex-shrink-0">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                          styles.circle
                        )}
                        onClick={() => styles.clickable && onStepClick(step.number)}
                        role={styles.clickable ? 'button' : undefined}
                        tabIndex={styles.clickable ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (styles.clickable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onStepClick(step.number);
                          }
                        }}
                      >
                        {getStepIcon(step.number + 1, status, isCurrent)}
                      </div>
                      <div className="mt-2 text-center w-full px-1">
                        <p
                          className={cn(
                            'text-xs font-medium transition-colors line-clamp-2',
                            styles.text
                          )}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center h-10 mb-auto flex-shrink-0">
                        <div
                          className={cn(
                            'w-16 h-0.5 transition-colors',
                            completedSteps.includes(step.number) ? 'bg-primary' : 'bg-muted-foreground/20'
                          )}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Current Step Only */}
        <div className="lg:hidden">
          <div className="text-center">
            {steps.find(s => s.number === currentStep) && (
              <>
                <h3 className="text-lg font-bold text-foreground">
                  {steps.find(s => s.number === currentStep)?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps.find(s => s.number === currentStep)?.description}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
