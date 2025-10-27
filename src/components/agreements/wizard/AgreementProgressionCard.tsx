import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getAgreementStepGroups } from '@/lib/wizardLogic/agreementStepGroups';
import { ProgressionSection } from '@/components/reservations/wizard/ProgressionSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const agreementSteps = [
  { number: 0, title: 'Source', description: 'Select source' },
  { number: 1, title: 'Terms', description: 'Agreement details' },
  { number: 2, title: 'Inspection', description: 'Vehicle condition' },
  { number: 3, title: 'Pricing', description: 'Rates & charges' },
  { number: 4, title: 'Add-ons', description: 'Additional services' },
  { number: 5, title: 'Billing', description: 'Payment details' },
  { number: 6, title: 'Documents', description: 'Upload & verify' },
  { number: 7, title: 'Signature', description: 'Terms & sign' },
  { number: 8, title: 'Review', description: 'Final check' },
];

interface AgreementProgressionCardProps {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  stepValidationStatus: Record<number, any>;
  onStepClick: (step: number) => void;
  onStepSkip: (step: number) => void;
}

export const AgreementProgressionCard: React.FC<AgreementProgressionCardProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  stepValidationStatus,
  onStepClick,
  onStepSkip,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stepGroups = getAgreementStepGroups();
  const totalSteps = agreementSteps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        'fixed bottom-4 right-4 z-50 transition-all',
        'w-[380px] max-w-[calc(100vw-2rem)]',
        'md:w-[400px]'
      )}>
        <Card className="shadow-lg border-2">
          {/* Header - Always Visible */}
          <CardHeader className="p-4 pb-3">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>

                {/* Title and Progress */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Agreement Progress
                  </h3>
                  <div className="flex items-center gap-2">
                    <Progress value={progressPercentage} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse Icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            </CollapsibleTrigger>

            {/* Collapsed Status */}
            {!isExpanded && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {completedCount} of {totalSteps} steps complete
                </span>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Step {currentStep}
                </span>
              </div>
            )}
          </CardHeader>

          {/* Expandable Content */}
          <CollapsibleContent>
            <CardContent className="p-4 pt-0 max-h-[60vh] overflow-y-auto space-y-3">
              {stepGroups.map(group => (
                <ProgressionSection
                  key={group.id}
                  group={group}
                  steps={agreementSteps}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  skippedSteps={skippedSteps}
                  stepValidationStatus={stepValidationStatus}
                  onStepClick={onStepClick}
                  onStepSkip={onStepSkip}
                  isExpanded={group.steps.includes(currentStep)}
                />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </div>
    </Collapsible>
  );
};
