import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  return (
    <div className="w-full px-4 py-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps - Scrollable Horizontal */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className="flex items-center min-w-max px-4">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isUpcoming = currentStep < step.number;

                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center w-32 flex-shrink-0">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                          isCompleted &&
                            'bg-primary border-primary text-primary-foreground',
                          isCurrent &&
                            'border-primary bg-primary/10 text-primary ring-2 ring-primary/20',
                          isUpcoming && 'border-muted-foreground/30 text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span className="font-semibold">{step.number}</span>
                        )}
                      </div>
                      <div className="mt-2 text-center w-full px-1">
                        <p
                          className={cn(
                            'text-xs font-medium transition-colors line-clamp-2',
                            (isCurrent || isCompleted) ? 'text-foreground' : 'text-muted-foreground'
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
                            isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
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
            <h3 className="text-lg font-bold text-foreground">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
