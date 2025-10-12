import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface TrainStopStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
}

export const TrainStopStepper: React.FC<TrainStopStepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal Layout */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          {/* Gray background line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-border z-0" />
          
          {/* Green progress overlay */}
          {completedSteps.length > 0 && (
            <div 
              className="absolute top-6 left-0 h-0.5 bg-green-600 z-[1] transition-all duration-500"
              style={{ 
                width: `${(completedSteps.length / (steps.length - 1)) * 100}%` 
              }}
            />
          )}
          
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;
            const isClickable = step.id <= currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-20 flex-1">
                {/* Circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "rounded-full transition-all duration-300 flex items-center justify-center font-semibold",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isCompleted && "w-12 h-12 bg-green-600 hover:bg-green-700 cursor-pointer shadow-sm",
                    isCurrent && "w-12 h-12 bg-primary hover:bg-primary/90 cursor-pointer shadow-sm",
                    isUpcoming && "w-12 h-12 border-2 border-muted-foreground/30 bg-background cursor-not-allowed"
                  )}
                  aria-label={`${step.title} - ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className={cn(
                      "text-sm",
                      isCurrent ? "text-white" : "text-muted-foreground"
                    )}>
                      {step.id}
                    </span>
                  )}
                </button>
                
                {/* Label */}
                <span className={cn(
                  "mt-3 text-sm text-center px-2 transition-all duration-200",
                  isCurrent && "font-bold text-primary",
                  isCompleted && "font-medium text-green-600",
                  isUpcoming && "text-muted-foreground"
                )}>
                  {step.title}
                </span>
                
                {/* Description (only for current step on desktop) */}
                {isCurrent && (
                  <span className="mt-1 text-xs text-muted-foreground text-center px-2">
                    {step.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="relative">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-start gap-4 w-full text-left p-3 rounded-lg transition-all duration-200",
                  isClickable && "hover:bg-accent/50",
                  isCurrent && "bg-accent"
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all duration-300",
                    isCompleted && "w-10 h-10 bg-green-600 shadow-sm",
                    isCurrent && "w-10 h-10 bg-primary shadow-sm",
                    isUpcoming && "w-10 h-10 border-2 border-muted-foreground/30 bg-background"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className={cn(
                      "text-sm",
                      isCurrent ? "text-white" : "text-muted-foreground"
                    )}>
                      {step.id}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium transition-all duration-200",
                    isCurrent && "text-primary font-bold",
                    isCompleted && "text-green-600",
                    isUpcoming && "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </div>
                </div>
              </button>

              {/* Vertical connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[29px] top-[52px] w-0.5 h-8">
                  <div className="w-full h-full bg-border" />
                  {isCompleted && (
                    <div className="absolute top-0 left-0 w-full h-full bg-green-600 transition-all duration-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress percentage indicator */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        {Math.round((completedSteps.length / steps.length) * 100)}% Complete
      </div>
    </div>
  );
};
