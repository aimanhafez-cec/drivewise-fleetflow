import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { ProgressionStepItem } from './ProgressionStepItem';
import type { WizardStepGroup } from '@/lib/wizardLogic/conditionalSteps';
import type { StepStatus } from '@/types/agreement-wizard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProgressionSectionProps {
  group: WizardStepGroup;
  steps: Array<{ number: number; title: string; description: string }>;
  currentStep: number;
  completedSteps: number[];
  stepValidationStatus: Record<number, StepStatus>;
  onStepClick: (step: number) => void;
  isExpanded: boolean;
}

export const ProgressionSection: React.FC<ProgressionSectionProps> = ({
  group,
  steps,
  currentStep,
  completedSteps,
  stepValidationStatus,
  onStepClick,
  isExpanded: initialExpanded,
}) => {
  const [isOpen, setIsOpen] = useState(initialExpanded);
  const [prevStep, setPrevStep] = useState(currentStep);

  // Auto-expand only when navigating TO a step in this section (not continuously)
  useEffect(() => {
    const containsCurrentStep = group.steps.includes(currentStep);
    const containedPrevStep = group.steps.includes(prevStep);
    
    // Only auto-expand if we just navigated INTO this section
    if (containsCurrentStep && !containedPrevStep) {
      setIsOpen(true);
    }
    
    setPrevStep(currentStep);
  }, [currentStep, group.steps]);

  // Calculate section progress
  const totalStepsInGroup = group.steps.length;
  const completedInGroup = group.steps.filter(step => 
    completedSteps.includes(step)
  ).length;
  const progressPercentage = Math.round((completedInGroup / totalStepsInGroup) * 100);
  
  // Determine section status
  const hasCurrentStep = group.steps.includes(currentStep);
  const isComplete = completedInGroup === totalStepsInGroup;
  const hasErrors = group.steps.some(step => 
    stepValidationStatus[step] === 'has-errors'
  );
  const inProgress = hasCurrentStep || (completedInGroup > 0 && !isComplete);

  const getSectionBadge = () => {
    if (isComplete) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-medium">
          Complete
        </span>
      );
    }
    if (hasErrors) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
          Has Errors
        </span>
      );
    }
    if (inProgress) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
          In Progress
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
        Not Started
      </span>
    );
  };

  const getSectionBorderColor = () => {
    if (isComplete) return 'border-emerald-500/30';
    if (hasErrors) return 'border-destructive/30';
    if (inProgress) return 'border-primary/30';
    return 'border-border';
  };

  // Get status for each step
  const getStepStatus = (stepNumber: number): StepStatus => {
    if (completedSteps.includes(stepNumber)) return 'complete';
    if (stepValidationStatus[stepNumber]) return stepValidationStatus[stepNumber];
    if (stepNumber === currentStep) return 'incomplete';
    return 'not-visited';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        'rounded-lg border transition-all',
        getSectionBorderColor()
      )}>
        {/* Section Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
            {/* Icon */}
            <div className="text-2xl flex-shrink-0 mt-0.5">
              {group.icon}
            </div>

            {/* Section Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {group.title}
                </h4>
                {getSectionBadge()}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {group.description}
              </p>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {completedInGroup}/{totalStepsInGroup}
                </span>
              </div>
            </div>

            {/* Expand/Collapse Icon */}
            <div className="flex-shrink-0">
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Section Content - Steps */}
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-2">
            {steps
              .filter(step => group.steps.includes(step.number))
              .map(step => (
                <ProgressionStepItem
                  key={step.number}
                  stepNumber={step.number}
                  title={step.title}
                  description={step.description}
                  status={getStepStatus(step.number)}
                  isCurrentStep={currentStep === step.number}
                  onClick={() => onStepClick(step.number)}
                />
              ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
