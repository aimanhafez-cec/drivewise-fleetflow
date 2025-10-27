import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useReservationWizard } from './ReservationWizardContext';
import { getStepGroups } from '@/lib/wizardLogic/conditionalSteps';
import { ProgressionSection } from './ProgressionSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const wizardSteps = [
  { number: 1, title: 'Reservation Type', description: 'Select booking type' },
  { number: 2, title: 'Business Config', description: 'Setup business rules' },
  { number: 3, title: 'Customer', description: 'Identify customer' },
  { number: 4, title: 'Dates & Locations', description: 'Set schedule' },
  { number: 5, title: 'Vehicle Lines', description: 'Build reservation' },
  { number: 6, title: 'Price List', description: 'Select rates' },
  { number: 7, title: 'Pricing Summary', description: 'Review costs' },
  { number: 8, title: 'Services & Add-ons', description: 'Select extras' },
  { number: 9, title: 'Airport Info', description: 'Flight details' },
  { number: 10, title: 'Insurance', description: 'Coverage options' },
  { number: 11, title: 'Billing', description: 'Setup billing' },
  { number: 12, title: 'Payment', description: 'Collect deposit' },
  { number: 13, title: 'Referral & Notes', description: 'Additional info' },
  { number: 14, title: 'Confirmation', description: 'Complete booking' },
];

export const ReservationProgressionCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    currentStep, 
    completedSteps,
    skippedSteps,
    stepValidationStatus, 
    goToStep,
    skipStep,
    unskipStep,
  } = useReservationWizard();

  const stepGroups = getStepGroups();
  const totalSteps = wizardSteps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const handleStepClick = (step: number) => {
    goToStep(step);
  };

  const handleStepSkip = (step: number) => {
    if (skippedSteps.includes(step)) {
      unskipStep(step);
    } else {
      skipStep(step);
    }
  };

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
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                {/* Title and Progress */}
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Reservation Progress
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
                  steps={wizardSteps}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  skippedSteps={skippedSteps}
                  stepValidationStatus={stepValidationStatus}
                  onStepClick={handleStepClick}
                  onStepSkip={handleStepSkip}
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
