import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useReservationWizard } from './ReservationWizardContext';
import { getStepGroups } from '@/lib/wizardLogic/conditionalSteps';
import { ProgressionSection } from './ProgressionSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReservationTypeSelector from '@/components/instant-booking/wizard/ReservationTypeSelector';
import CustomerIdentification from '@/components/instant-booking/wizard/CustomerIdentification';
import DatesLocations from '@/components/instant-booking/wizard/DatesLocations';
import { Step1_5BusinessConfig } from './Step1_5BusinessConfig';
import { Step2_5PriceList } from './Step2_5PriceList';
import { Step4MultiLineBuilder } from './Step4MultiLineBuilder';
import { Step5ServicesAddOns } from './Step5ServicesAddOns';
import { Step5_5AirportInfo } from './Step5_5AirportInfo';
import { Step5_6Insurance } from './Step5_6Insurance';
import { Step5_7BillingConfig } from './Step5_7BillingConfig';
import { Step6PricingSummary } from './Step6PricingSummary';
import { Step7DownPayment } from './Step7DownPayment';
import { Step7_5ReferralNotes } from './Step7_5ReferralNotes';
import { Step8Confirmation } from './Step8Confirmation';

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
    stepValidationStatus, 
    goToStep,
    wizardData,
    updateWizardData,
  } = useReservationWizard();

  const stepGroups = getStepGroups();
  const totalSteps = wizardSteps.length;
  const completedCount = completedSteps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const handleStepClick = (step: number) => {
    goToStep(step);
  };

  // Render form content for each step
  const renderStepContent = (stepNumber: number): React.ReactNode => {
    switch (stepNumber) {
      case 1:
        return (
          <ReservationTypeSelector
            selectedType={wizardData.reservationType}
            onTypeSelect={(type) => updateWizardData({ reservationType: type })}
          />
        );
      case 2:
        return <Step1_5BusinessConfig />;
      case 3:
        return (
          <CustomerIdentification
            selectedCustomerId={wizardData.customerId || ''}
            onCustomerSelect={(customer) => 
              updateWizardData({ 
                customerId: customer.id, 
                customerData: customer 
              })
            }
          />
        );
      case 4:
        return (
          <DatesLocations
            data={{
              pickupDate: wizardData.pickupDate || '',
              pickupTime: wizardData.pickupTime || '',
              returnDate: wizardData.returnDate || '',
              returnTime: wizardData.returnTime || '',
              pickupLocation: wizardData.pickupLocation || '',
              returnLocation: wizardData.returnLocation || '',
            }}
            onUpdate={(updates) => updateWizardData(updates)}
          />
        );
      case 5:
        return <Step4MultiLineBuilder />;
      case 6:
        return <Step2_5PriceList />;
      case 7:
        return <Step6PricingSummary />;
      case 8:
        return <Step5ServicesAddOns />;
      case 9:
        return <Step5_5AirportInfo />;
      case 10:
        return <Step5_6Insurance />;
      case 11:
        return <Step5_7BillingConfig />;
      case 12:
        return <Step7DownPayment />;
      case 13:
        return <Step7_5ReferralNotes />;
      case 14:
        return <Step8Confirmation />;
      default:
        return null;
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
            <CardContent className="p-4 pt-0 max-h-[75vh] overflow-y-auto space-y-3">
              {stepGroups.map(group => (
                <ProgressionSection
                  key={group.id}
                  group={group}
                  steps={wizardSteps}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  stepValidationStatus={stepValidationStatus}
                  onStepClick={handleStepClick}
                  isExpanded={group.steps.includes(currentStep)}
                  renderStepContent={renderStepContent}
                />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </div>
    </Collapsible>
  );
};
