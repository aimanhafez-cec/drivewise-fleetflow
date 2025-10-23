import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Save, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWizardProgress } from '@/hooks/useWizardProgress';
import { validateStep } from '@/lib/wizard/validation';
import { SourceSelection } from './wizard/SourceSelection';
import { AgreementTermsStep } from './wizard/AgreementTermsStep';
import { VehicleInspectionStep } from './wizard/VehicleInspectionStep';
import { PricingConfigurationStep } from './wizard/PricingConfigurationStep';
import { AddonsSelectionStep } from './wizard/AddonsSelectionStep';
import { BillingPaymentStep } from './wizard/BillingPaymentStep';
import { DocumentsVerificationStep } from './wizard/DocumentsVerificationStep';
import { TermsSignatureStep } from './wizard/TermsSignatureStep';
import { FinalReviewStep } from './wizard/FinalReviewStep';
import type { EnhancedWizardData, AgreementSource } from '@/types/agreement-wizard';

const TOTAL_STEPS = 9; // 0-8

const STEP_CONFIG = [
  { id: 0, title: 'Source', description: 'Select source', icon: '📋' },
  { id: 1, title: 'Terms', description: 'Agreement details', icon: '📝' },
  { id: 2, title: 'Inspection', description: 'Vehicle condition', icon: '🔍' },
  { id: 3, title: 'Pricing', description: 'Rates & charges', icon: '💰' },
  { id: 4, title: 'Add-ons', description: 'Additional services', icon: '🛠️' },
  { id: 5, title: 'Billing', description: 'Payment details', icon: '💳' },
  { id: 6, title: 'Documents', description: 'Upload & verify', icon: '📄' },
  { id: 7, title: 'Signature', description: 'Terms & sign', icon: '✍️' },
  { id: 8, title: 'Review', description: 'Final check', icon: '✅' },
];

const INITIAL_WIZARD_DATA: EnhancedWizardData = {
  source: 'direct',
  sourceId: undefined,
  step1: {
    customerId: undefined,
    customerVerified: false,
    agreementType: 'daily',
    rentalPurpose: 'personal',
    pickupLocationId: '',
    pickupDateTime: '',
    dropoffLocationId: '',
    dropoffDateTime: '',
    mileagePackage: 'unlimited',
    includedKm: undefined,
    excessKmRate: undefined,
    crossBorderAllowed: false,
    crossBorderCountries: [],
    salikAccountNo: undefined,
    darbAccountNo: undefined,
    specialInstructions: undefined,
    internalNotes: undefined,
  },
  step2: {
    preHandoverChecklist: {
      vehicleCleaned: false,
      vehicleFueled: false,
      documentsReady: false,
      keysAvailable: false,
      warningLightsOk: false,
    },
    damageMarkers: [],
    inspectionChecklist: {},
    fuelLevel: 0,
    odometerReading: 0,
    odometerPhoto: undefined,
    fuelGaugePhoto: undefined,
    photos: {
      exterior: [],
      interior: [],
      documents: [],
      damages: [],
    },
  },
  step3: {
    baseRate: 0,
    rateOverride: undefined,
    insurancePackage: 'comprehensive',
    excessAmount: 1500,
    additionalCoverages: [],
    maintenanceIncluded: false,
    maintenanceCost: undefined,
    discountCode: undefined,
    discountAmount: undefined,
    discountReason: undefined,
    pricingBreakdown: {
      baseRate: 0,
      insurance: 0,
      maintenance: 0,
      addons: 0,
      subtotal: 0,
      discount: 0,
      taxableAmount: 0,
      vat: 0,
      total: 0,
    },
  },
  step4: {
    selectedAddons: [],
    recommendedAddons: [],
  },
  step5: {
    billingType: 'same',
    billingInfo: undefined,
    paymentMethod: '',
    paymentSchedule: 'upfront',
    advancePayment: {
      amount: 0,
      status: 'pending',
      transactionRef: undefined,
      receiptUrl: undefined,
    },
    securityDeposit: {
      method: 'card_hold',
      amount: 0,
      status: 'pending',
      authorizationRef: undefined,
      chequeDetails: undefined,
    },
    autoChargeAuthorized: false,
    cardToken: undefined,
  },
  step6: {
    documents: [],
    emiratesIdVerified: false,
    licenseVerified: false,
    blackPointsChecked: false,
    blackPointsCount: undefined,
    eligibilityStatus: 'eligible',
  },
  step7: {
    termsLanguage: 'en',
    termsAccepted: false,
    keyTermsAcknowledged: {
      fuelPolicy: false,
      insuranceCoverage: false,
      tollsFinesLiability: false,
      returnPolicy: false,
      damageLiability: false,
    },
    customerSignature: undefined,
    witnessSignature: undefined,
    customerDeclarations: {
      vehicleConditionConfirmed: false,
      keysDocumentsReceived: false,
      termsUnderstood: false,
    },
  },
  step8: {
    reviewCompleted: false,
    distributionMethods: {
      email: true,
      sms: false,
      whatsapp: false,
      print: false,
    },
    finalNotes: undefined,
  },
};

export const EnhancedAgreementWizard = () => {
  const navigate = useNavigate();
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });

  const {
    wizardData,
    progress,
    updateWizardData,
    setCurrentStep,
    markStepComplete,
    markStepIncomplete,
    updateStepStatus,
    getStepStatus,
    setCanProceed,
    clearProgress,
    getProgressPercentage,
  } = useWizardProgress({
    storageKey: 'enhanced-agreement-wizard',
    initialData: INITIAL_WIZARD_DATA,
    totalSteps: TOTAL_STEPS,
  });

  // Validate current step whenever data changes
  useEffect(() => {
    const result = validateStep(progress.currentStep, wizardData);
    setValidationResult(result);
    setCanProceed(result.isValid);
  }, [wizardData, progress.currentStep, setCanProceed]);

  const handleNext = () => {
    const result = validateStep(progress.currentStep, wizardData);
    
    if (!result.isValid) {
      markStepIncomplete(progress.currentStep);
      updateStepStatus(progress.currentStep, 'has-errors');
      toast.error('Please fix errors before marking complete');
      return;
    }

    // Mark current step complete
    markStepComplete(progress.currentStep);
    
    if (progress.currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(progress.currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    // Validate current step before leaving
    const result = validateStep(progress.currentStep, wizardData);
    if (!result.isValid) {
      markStepIncomplete(progress.currentStep);
      updateStepStatus(progress.currentStep, 'has-errors');
    }
    
    if (progress.currentStep > 0) {
      setCurrentStep(progress.currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved successfully');
  };

  const handleSubmit = async () => {
    // Validate ALL steps are complete
    const invalidSteps = [];
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const status = getStepStatus(i);
      if (status !== 'complete') {
        invalidSteps.push(i);
      }
    }

    if (invalidSteps.length > 0) {
      const stepNames = invalidSteps.map(i => STEP_CONFIG[i].title).join(', ');
      toast.error(`Please complete all steps before submitting. Incomplete: ${stepNames}`);
      
      // Optionally navigate to first incomplete step
      if (invalidSteps[0] !== progress.currentStep) {
        setCurrentStep(invalidSteps[0]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // All steps complete - proceed with submission
    console.log('[EnhancedWizard] Submitting agreement:', wizardData);
    
    // Simulate submission
    toast.success('Agreement created successfully!');
    clearProgress();
    navigate('/agreements');
  };

  const handleStepClick = (step: number) => {
    // Validate current step before leaving
    const result = validateStep(progress.currentStep, wizardData);
    if (!result.isValid) {
      markStepIncomplete(progress.currentStep);
      updateStepStatus(progress.currentStep, 'has-errors');
    } else {
      markStepComplete(progress.currentStep);
    }
    
    // Allow navigation to ANY step
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepDataChange = (stepKey: keyof EnhancedWizardData, field: string, value: any) => {
    const currentStepData = wizardData[stepKey] as any;
    const updatedStepData = {
      ...currentStepData,
      [field]: value,
    };
    updateWizardData(stepKey, updatedStepData as any);
  };

  const calculateTotalAmount = (): number => {
    const pricing = wizardData.step3?.pricingBreakdown;
    return pricing?.total || 0;
  };

  const renderStepContent = () => {
    switch (progress.currentStep) {
      case 0:
        return (
          <SourceSelection
            selectedSource={wizardData.source}
            selectedSourceId={wizardData.sourceId}
            onSelect={(source: AgreementSource, sourceId?: string) => {
              updateWizardData('source', source as any);
              updateWizardData('sourceId', sourceId as any);
            }}
          />
        );
      case 1:
        return (
          <AgreementTermsStep
            data={wizardData.step1}
            onChange={(field, value) => handleStepDataChange('step1', field, value)}
            errors={validationResult.errors}
          />
        );
      case 2:
        return (
          <VehicleInspectionStep
            data={wizardData.step2}
            onChange={(field, value) => handleStepDataChange('step2', field, value)}
            errors={validationResult.errors}
          />
        );
      case 3:
        return (
          <PricingConfigurationStep
            data={wizardData.step3}
            onChange={(field, value) => handleStepDataChange('step3', field, value)}
            errors={validationResult.errors}
          />
        );
      case 4:
        return (
          <AddonsSelectionStep
            data={wizardData.step4}
            onChange={(field, value) => handleStepDataChange('step4', field, value)}
            errors={validationResult.errors}
          />
        );
      case 5:
        return (
          <BillingPaymentStep
            data={wizardData.step5}
            totalAmount={calculateTotalAmount()}
            onChange={(field, value) => handleStepDataChange('step5', field, value)}
            errors={validationResult.errors}
          />
        );
      case 6:
        return (
          <DocumentsVerificationStep
            data={wizardData.step6}
            onChange={(field, value) => handleStepDataChange('step6', field, value)}
            errors={validationResult.errors}
          />
        );
      case 7:
        return (
          <TermsSignatureStep
            data={wizardData.step7}
            onChange={(field, value) => handleStepDataChange('step7', field, value)}
            errors={validationResult.errors}
          />
        );
      case 8:
        return (
          <FinalReviewStep
            wizardData={wizardData}
            onChange={(field, value) => handleStepDataChange('step8', field, value)}
            errors={validationResult.errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = getProgressPercentage();
  const currentStepConfig = STEP_CONFIG[progress.currentStep];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Create Agreement</CardTitle>
              <p className="text-muted-foreground mt-1">
                Enhanced wizard with source selection and comprehensive validation
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" onClick={() => navigate('/agreements')}>
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {currentStepConfig.icon} Step {progress.currentStep + 1} of {TOTAL_STEPS}:{' '}
                {currentStepConfig.title}
              </span>
              <span className="text-muted-foreground">{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {STEP_CONFIG.map((step) => {
                const status = getStepStatus(step.id);
                const isCurrent = progress.currentStep === step.id;
                
                // Determine styling based on status
                let buttonStyles = '';
                let StatusIcon = null;
                
                if (status === 'complete') {
                  buttonStyles = 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400';
                  StatusIcon = CheckCircle2;
                } else if (isCurrent) {
                  buttonStyles = 'bg-primary text-primary-foreground';
                } else if (status === 'has-errors') {
                  buttonStyles = 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
                  StatusIcon = AlertCircle;
                } else {
                  // incomplete or not-visited -> amber
                  buttonStyles = 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400';
                }

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${buttonStyles}`}
                  >
                    {StatusIcon ? (
                      <StatusIcon className="h-4 w-4" />
                    ) : (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-current/20 text-xs">
                        {step.id + 1}
                      </span>
                    )}
                    <span>{step.icon}</span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {validationResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationResult.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Warnings:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={progress.currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {progress.lastSaved && `Last saved: ${new Date(progress.lastSaved).toLocaleTimeString()}`}
            </div>

            {progress.currentStep === TOTAL_STEPS - 1 ? (
              <Button 
                onClick={handleSubmit} 
                size="lg"
                className="min-w-[180px]"
              >
                Issue Agreement
              </Button>
            ) : (
              <Button
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
