import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ValidationErrorBanner } from '@/components/ui/validation-error-banner';
import { agreementsApi } from '@/lib/api/agreements';
import { AgreementWizardStep1 } from './wizard/AgreementWizardStep1';
import { AgreementWizardStep2 } from './wizard/AgreementWizardStep2';
import { AgreementWizardStep3 } from './wizard/AgreementWizardStep3';
import { AgreementWizardStep4 } from './wizard/AgreementWizardStep4';
import { AgreementWizardStep5 } from './wizard/AgreementWizardStep5';
import { AgreementWizardStep6 } from './wizard/AgreementWizardStep6';

interface AgreementWizardProps {
  reservationId: string;
  reservation: any;
}

export interface WizardData {
  step1: {
    contractStart?: string;
    contractEnd?: string;
    referenceNumber?: string;
    poNumber?: string;
    notes?: string;
  };
  step2: {
    vehicles: Array<{
      vehicleId?: string;
      fuelLevel: string;
      odometerOut: number;
      existingDamage?: {
        photos: string[];
        notes: string;
      };
    }>;
  };
  step3: {
    rateAdjustments?: any[];
    chargeAdjustments?: any[];
  };
  step4: {
    selectedAddOns: string[];
    addOnCharges: Array<{
      id: string;
      name: string;
      amount: number;
      taxable: boolean;
    }>;
  };
  step5: {
    billingType: 'same' | 'other';
    billingInfo?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    paymentMethod: string;
    advanceAmount: number;
    securityDeposit: number;
    applyDepositAsCredit: boolean;
  };
  step6: {
    termsAccepted: boolean;
    signature?: {
      data: string;
      signerName: string;
      timestamp: string;
    };
  };
}

export const AgreementWizard: React.FC<AgreementWizardProps> = ({
  reservationId,
  reservation,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    step1: {},
    step2: { vehicles: [{ fuelLevel: '', odometerOut: 0 }] },
    step3: {},
    step4: { selectedAddOns: [], addOnCharges: [] },
    step5: {
      billingType: 'same',
      paymentMethod: 'credit_card',
      advanceAmount: 0,
      securityDeposit: 0,
      applyDepositAsCredit: false,
    },
    step6: { termsAccepted: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: 'Details', description: 'Agreement details' },
    { id: 2, title: 'Handover', description: 'Vehicle condition' },
    { id: 3, title: 'Rates', description: 'Review charges' },
    { id: 4, title: 'Add-ons', description: 'Additional services' },
    { id: 5, title: 'Billing', description: 'Payment information' },
    { id: 6, title: 'Sign', description: 'Terms & signature' },
  ];

  // Save draft on data changes
  useEffect(() => {
    const draftKey = `agreementDraft-${reservationId}`;
    localStorage.setItem(draftKey, JSON.stringify({ currentStep, wizardData }));
  }, [wizardData, currentStep, reservationId]);

  // Load saved draft on mount
  useEffect(() => {
    const draftKey = `agreementDraft-${reservationId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const { currentStep: savedStep, wizardData: savedData } = JSON.parse(savedDraft);
        setCurrentStep(savedStep);
        setWizardData(savedData);
      } catch (error) {
        console.warn('Failed to load saved draft:', error);
      }
    }
  }, [reservationId]);

  const updateWizardData = (step: keyof WizardData, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data },
    }));
    setValidationErrors({});
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        // Step 1 validations - all fields are optional for now
        break;
      
      case 2:
        // Step 2 validations - fuel and odometer required
        wizardData.step2.vehicles.forEach((vehicle, index) => {
          if (!vehicle.fuelLevel) {
            errors[`vehicle_${index}_fuel`] = 'Fuel level is required';
          }
          if (!vehicle.odometerOut || vehicle.odometerOut < 0) {
            errors[`vehicle_${index}_odometer`] = 'Valid odometer reading is required';
          }
        });
        break;
      
      case 3:
        // Step 3 validations - review step, no specific requirements
        break;
      
      case 4:
        // Step 4 validations - optional add-ons
        break;
      
      case 5:
        // Step 5 validations - billing information
        if (wizardData.step5.billingType === 'other') {
          const billing = wizardData.step5.billingInfo;
          if (!billing?.name) errors.billing_name = 'Name is required';
          if (!billing?.email) errors.billing_email = 'Email is required';
          if (!billing?.phone) errors.billing_phone = 'Phone is required';
          if (!billing?.address) errors.billing_address = 'Address is required';
        }
        if (!wizardData.step5.paymentMethod) {
          errors.payment_method = 'Payment method is required';
        }
        break;
      
      case 6:
        // Step 6 validations - terms and signature
        if (!wizardData.step6.termsAccepted) {
          errors.terms = 'You must accept the terms and conditions';
        }
        if (!wizardData.step6.signature) {
          errors.signature = 'Signature is required';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `agreement-${reservationId}-${Date.now()}`;
      
      const convertData = {
        issueDate: wizardData.step1.contractStart || new Date().toISOString().split('T')[0],
        notes: wizardData.step1.notes,
        handover: wizardData.step2,
        billing: wizardData.step5,
        signature: wizardData.step6.signature,
        addOns: wizardData.step4.addOnCharges,
      };

      const result = await agreementsApi.convertReservation(
        reservationId,
        convertData,
        idempotencyKey
      );

      // Clear saved draft
      localStorage.removeItem(`agreementDraft-${reservationId}`);

      toast({
        title: "Agreement Created",
        description: `Agreement ${result.agreementNo} has been successfully created.`,
      });

      navigate(`/agreements/${result.agreementId}?fromReservation=${reservationId}`);
    } catch (error) {
      console.error('Failed to create agreement:', error);
      toast({
        title: "Error",
        description: "Failed to create agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AgreementWizardStep1
            data={wizardData.step1}
            reservation={reservation}
            onChange={(data) => updateWizardData('step1', data)}
            errors={validationErrors}
          />
        );
      case 2:
        return (
          <AgreementWizardStep2
            data={wizardData.step2}
            reservation={reservation}
            onChange={(data) => updateWizardData('step2', data)}
            errors={validationErrors}
          />
        );
      case 3:
        return (
          <AgreementWizardStep3
            data={wizardData.step3}
            reservation={reservation}
            wizardData={wizardData}
            onChange={(data) => updateWizardData('step3', data)}
            errors={validationErrors}
          />
        );
      case 4:
        return (
          <AgreementWizardStep4
            data={wizardData.step4}
            reservation={reservation}
            onChange={(data) => updateWizardData('step4', data)}
            errors={validationErrors}
          />
        );
      case 5:
        return (
          <AgreementWizardStep5
            data={wizardData.step5}
            reservation={reservation}
            onChange={(data) => updateWizardData('step5', data)}
            errors={validationErrors}
          />
        );
      case 6:
        return (
          <AgreementWizardStep6
            data={wizardData.step6}
            reservation={reservation}
            wizardData={wizardData}
            onChange={(data) => updateWizardData('step6', data)}
            errors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Create Agreement</CardTitle>
              <p className="text-muted-foreground">
                Converting reservation RES-{reservationId.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/reservations')}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center text-xs ${
                    step.id === currentStep
                      ? 'text-primary font-medium'
                      : step.id < currentStep
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      step.id === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id < currentStep
                        ? 'bg-green-100 text-green-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Error Banner */}
      {Object.keys(validationErrors).length > 0 && (
        <ValidationErrorBanner
          errors={validationErrors}
          onDismiss={() => setValidationErrors({})}
          onFieldFocus={(field) => {
            // Focus on the field - scroll to step if needed
            const element = document.getElementById(field);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      )}

      {/* Current Step Content */}
      <div id={`wiz-step-${steps[currentStep - 1]?.title.toLowerCase()}`}>
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button
                id="btn-issue-agreement"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[160px]"
              >
                {isSubmitting ? 'Creating Agreement...' : 'Issue Agreement'}
              </Button>
            ) : (
              <Button
                id="btn-wiz-next"
                onClick={handleNext}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};