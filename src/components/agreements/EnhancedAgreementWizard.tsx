import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Save, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/currency';
import { useWizardProgress } from '@/hooks/useWizardProgress';
import { useWizardKeyboardShortcuts } from '@/hooks/useWizardKeyboardShortcuts';
import { useAgreementSmartDefaults, useApplyAgreementSmartDefaults } from '@/hooks/useAgreementSmartDefaults';
import { useTouchGestures, useIsTouchDevice } from '@/hooks/useTouchGestures';
import { useAgreementDataConsistency } from '@/hooks/useAgreementDataConsistency';
import { validateStep } from '@/lib/validation/agreementSchema';
import type { ValidationResult } from '@/lib/validation/agreementSchema';
import { getAgreementStepGroups } from '@/lib/wizardLogic/agreementStepGroups';
import { getNextAgreementRequiredStep, getPreviousAgreementRequiredStep } from '@/lib/wizardLogic/agreementConditionalSteps';
import { AgreementWizardSection } from './wizard/AgreementWizardSection';
import { AgreementLivePriceWidget } from './wizard/AgreementLivePriceWidget';
import { ProgressDebugPanel } from './wizard/ProgressDebugPanel';
import { ValidationErrorBanner } from './wizard/ValidationErrorBanner';
import { WizardProgress } from '@/components/reservations/wizard/WizardProgress';
import { AgreementProgressionCard } from './wizard/AgreementProgressionCard';
import { SourceSelection } from './wizard/SourceSelection';
import { AgreementTermsStep } from './wizard/AgreementTermsStep';
import { VehicleInspectionStep } from './wizard/VehicleInspectionStep';
import { PricingConfigurationStep } from './wizard/PricingConfigurationStep';
import { AddonsSelectionStep } from './wizard/AddonsSelectionStep';
import { BillingPaymentStep } from './wizard/BillingPaymentStep';
import { DocumentsVerificationStep } from './wizard/DocumentsVerificationStep';
import { TermsSignatureStep } from './wizard/TermsSignatureStep';
import { FinalReviewStep } from './wizard/FinalReviewStep';
import { DraftManagementBanner } from './wizard/DraftManagementBanner';
import type { EnhancedWizardData, AgreementSource } from '@/types/agreement-wizard';

const TOTAL_STEPS = 9; // 0-8

const STEP_CONFIG = [
  { id: 0, number: 0, title: 'Source', description: 'Select source', icon: '📋' },
  { id: 1, number: 1, title: 'Terms', description: 'Agreement details', icon: '📝' },
  { id: 2, number: 2, title: 'Inspection', description: 'Vehicle condition', icon: '🔍' },
  { id: 3, number: 3, title: 'Pricing', description: 'Rates & charges', icon: '💰' },
  { id: 4, number: 4, title: 'Add-ons', description: 'Additional services', icon: '🛠️' },
  { id: 5, number: 5, title: 'Billing', description: 'Payment details', icon: '💳' },
  { id: 6, number: 6, title: 'Documents', description: 'Upload & verify', icon: '📄' },
  { id: 7, number: 7, title: 'Signature', description: 'Terms & sign', icon: '✍️' },
  { id: 8, number: 8, title: 'Review', description: 'Final check', icon: '✅' },
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
  // Phase 10: Optional business configuration fields
  businessConfig: undefined,
  enhancedPricing: undefined,
  enhancedBilling: undefined,
};

export const EnhancedAgreementWizard = () => {
  const navigate = useNavigate();
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [] 
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Toggle with Ctrl+Shift+D
  const [showResumePrompt, setShowResumePrompt] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data consistency hook
  const { 
    checkDataConsistency, 
    validateBeforeSubmission, 
    ensureDataIntegrity,
    validateStepData 
  } = useAgreementDataConsistency();

  // Helper to get step data
  const getStepData = (step: number) => {
    if (step === 0) return { source: wizardData.source, sourceId: wizardData.sourceId };
    return wizardData[`step${step}` as keyof EnhancedWizardData];
  };

  const {
    wizardData,
    progress,
    updateWizardData,
    setCurrentStep,
    markStepComplete,
    markStepIncomplete,
    updateStepStatus,
    getStepStatus,
    getAllStepsStatus,
    getProgressSummary,
    validateAllSteps,
    clearStepData,
    resetStepStatus,
    setCanProceed,
    clearProgress,
    getProgressPercentage,
    skipStep,
    unskipStep,
  } = useWizardProgress({
    storageKey: 'enhanced-agreement-wizard',
    initialData: INITIAL_WIZARD_DATA,
    totalSteps: TOTAL_STEPS,
  });

  // Smart defaults for customer history
  const customerId = wizardData.step1?.customerId;
  const { smartDefaults, hasHistory, isLoading: loadingDefaults } = useAgreementSmartDefaults(customerId);
  const { applyDefaults } = useApplyAgreementSmartDefaults();

  // Get step groups for sectioned layout
  const stepGroups = getAgreementStepGroups();

  // Touch device detection
  const isTouchDevice = useIsTouchDevice();

  // Initialize expanded sections based on current step
  useEffect(() => {
    const currentGroup = stepGroups.find(group => group.steps.includes(progress.currentStep));
    if (currentGroup) {
      setExpandedSections(prev => ({
        ...prev,
        [currentGroup.id]: true,
      }));
    }
  }, [progress.currentStep, stepGroups]);

  // Debug panel toggle (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply smart defaults when customer is selected
  useEffect(() => {
    if (customerId && smartDefaults && !loadingDefaults) {
      const updates = applyDefaults(wizardData, smartDefaults, {
        overwriteExisting: false, // Don't overwrite user-entered data
      });
      
      if (Object.keys(updates).length > 0) {
        console.log('[AgreementSmartDefaults] Applying smart defaults:', updates);
        
        // Apply updates to wizard data
        Object.keys(updates).forEach(key => {
          updateWizardData(key as keyof EnhancedWizardData, updates[key]);
        });
        
        if (smartDefaults.hasHistory) {
          toast.success('Smart Defaults Applied', {
            description: 'Pre-filled with customer\'s preferences from previous agreements',
          });
        }
      }
    }
  }, [customerId, smartDefaults, loadingDefaults]);

  // Validate current step whenever data changes
  useEffect(() => {
    const stepData = getStepData(progress.currentStep);
    const result = validateStepData(progress.currentStep, stepData);
    setValidationResult(result);
    setCanProceed(result.isValid);
    
    // Update step status based on validation
    if (result.errors.length > 0) {
      updateStepStatus(progress.currentStep, 'has-errors');
    } else if (result.isValid) {
      updateStepStatus(progress.currentStep, 'complete');
    }
  }, [wizardData, progress.currentStep, setCanProceed, validateStepData, updateStepStatus]);

  // Handler for "Apply Smart Defaults" quick action
  const handleApplySmartDefaults = () => {
    if (!smartDefaults) return;
    
    const updates = applyDefaults(wizardData, smartDefaults, {
      overwriteExisting: true, // Force overwrite for manual apply
    });
    
    if (Object.keys(updates).length > 0) {
      console.log('[AgreementSmartDefaults] Manually applying smart defaults:', updates);
      
      // Apply updates to wizard data
      Object.keys(updates).forEach(key => {
        updateWizardData(key as keyof EnhancedWizardData, updates[key]);
      });
      
      toast.success('Smart Defaults Applied', {
        description: `Applied preferences from ${smartDefaults.appliedFrom === 'history' ? 'customer history' : 'system defaults'}`,
      });
    } else {
      toast.info('No defaults to apply', {
        description: 'All fields are already filled',
      });
    }
  };

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
    
    // Use conditional navigation to skip non-required steps
    const nextStep = getNextAgreementRequiredStep(progress.currentStep, wizardData, TOTAL_STEPS);
    
    if (nextStep !== progress.currentStep) {
      setCurrentStep(nextStep);
      
      // Auto-scroll to next step with delay for rendering
      setTimeout(() => {
        const stepElement = document.querySelector(`[data-step="${nextStep}"]`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 200);
    }
  };

  const handlePrevious = () => {
    // Validate current step before leaving
    const stepData = getStepData(progress.currentStep);
    const result = validateStepData(progress.currentStep, stepData);
    if (!result.isValid) {
      markStepIncomplete(progress.currentStep);
      updateStepStatus(progress.currentStep, 'has-errors');
    }
    
    // Use conditional navigation to skip non-required steps
    const prevStep = getPreviousAgreementRequiredStep(progress.currentStep, wizardData);
    
    if (prevStep !== progress.currentStep) {
      setCurrentStep(prevStep);
      
      // Auto-scroll to previous step with delay for rendering
      setTimeout(() => {
        const stepElement = document.querySelector(`[data-step="${prevStep}"]`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 200);
    }
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    // The useWizardProgress hook already handles auto-saving with debouncing
    // This manual save is instant
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Draft saved successfully', {
        description: 'Your progress has been saved and can be resumed later',
      });
    }, 500);
  };

  const handleResumeDraft = () => {
    setShowResumePrompt(false);
    toast.success('Resuming from draft', {
      description: 'Your previous progress has been loaded',
    });
  };

  const handleDiscardDraft = () => {
    if (window.confirm('Are you sure you want to discard your draft? This cannot be undone.')) {
      clearProgress();
      setShowResumePrompt(false);
      toast.success('Draft discarded', {
        description: 'Starting with a fresh agreement',
      });
    }
  };

  // Check if we have a draft on mount
  const hasDraft = progress.lastSaved !== undefined && progress.visitedSteps.length > 1;

  const handleSubmit = async () => {
    // Ensure data integrity before validation
    const sanitizedData = ensureDataIntegrity(wizardData);
    
    // Use comprehensive validation
    const validationResult = validateBeforeSubmission(sanitizedData);

    if (!validationResult.isValid) {
      setValidationResult(validationResult);
      toast.error(`Please fix ${validationResult.errors.length} error(s) before submitting`);
      
      // Navigate to first step with errors
      const firstErrorPath = validationResult.errors[0]?.path || '';
      const stepMatch = firstErrorPath.match(/step(\d+)/);
      if (stepMatch) {
        const stepNum = parseInt(stepMatch[1]);
        if (stepNum !== progress.currentStep) {
          setCurrentStep(stepNum);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      return;
    }

    // All steps complete - proceed with submission
    console.log('[EnhancedWizard] Submitting agreement:', wizardData);
    
    // Get progress summary for logging
    const summary = getProgressSummary();
    console.log('[EnhancedWizard] Progress summary:', summary);
    
    // Simulate submission
    toast.success('Agreement created successfully!');
    clearProgress();
    navigate('/agreements');
  };

  // Keyboard shortcuts - ENTER to advance, ESC to go back
  useWizardKeyboardShortcuts({
    handleNext,
    handlePrevious,
    currentStep: progress.currentStep,
    isLoading: false,
    onSubmit: progress.currentStep === TOTAL_STEPS - 1 ? handleSubmit : undefined,
  });

  // Touch gesture handlers for mobile navigation
  const handleSwipeLeft = () => {
    // Swipe left = Next step
    if (progress.currentStep < TOTAL_STEPS - 1) {
      handleNext();
      toast.info('Swipe detected', {
        description: 'Moving to next step',
        duration: 1500,
      });
    }
  };

  const handleSwipeRight = () => {
    // Swipe right = Previous step
    if (progress.currentStep > 0) {
      handlePrevious();
      toast.info('Swipe detected', {
        description: 'Returning to previous step',
        duration: 1500,
      });
    }
  };

  // Touch gestures hook (only active on touch devices)
  const { ref: swipeRef, isSwiping } = useTouchGestures({
    onSwipeLeft: isTouchDevice ? handleSwipeLeft : undefined,
    onSwipeRight: isTouchDevice ? handleSwipeRight : undefined,
    threshold: 75, // Require 75px minimum swipe
    velocityThreshold: 0.3,
  });

  const handleStepClick = (step: number) => {
    // Validate current step before leaving
    const stepData = getStepData(progress.currentStep);
    const result = validateStepData(progress.currentStep, stepData);
    if (!result.isValid) {
      markStepIncomplete(progress.currentStep);
      updateStepStatus(progress.currentStep, 'has-errors');
    } else {
      markStepComplete(progress.currentStep);
    }
    
    // Allow navigation to ANY step
    setCurrentStep(step);
    
    // Expand the section containing the target step
    const targetGroup = stepGroups.find(group => group.steps.includes(step));
    if (targetGroup) {
      setExpandedSections(prev => ({
        ...prev,
        [targetGroup.id]: true,
      }));
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSectionExpand = (groupId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleStepSkip = (step: number) => {
    const isSkipped = progress.skippedSteps?.includes(step);
    if (isSkipped) {
      unskipStep(step);
      toast.info('Step Unskipped', {
        description: `Step ${step} has been unskipped`,
      });
    } else {
      skipStep(step);
      toast.success('Step Skipped', {
        description: `Step ${step} has been skipped`,
      });
    }
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

  const total = calculateTotalAmount();

  const renderStepContent = () => {
    // Convert errors to string[] for step components
    const errorMessages = validationResult.errors.map(e => e.message);
    
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
            errors={errorMessages}
          />
        );
      case 2:
        return (
          <VehicleInspectionStep
            data={wizardData.step2}
            onChange={(field, value) => handleStepDataChange('step2', field, value)}
            errors={errorMessages}
          />
        );
      case 3:
        return (
          <PricingConfigurationStep
            data={wizardData.step3}
            onChange={(field, value) => handleStepDataChange('step3', field, value)}
            errors={errorMessages}
          />
        );
      case 4:
        return (
          <AddonsSelectionStep
            data={wizardData.step4}
            onChange={(field, value) => handleStepDataChange('step4', field, value)}
            errors={errorMessages}
          />
        );
      case 5:
        return (
          <BillingPaymentStep
            data={wizardData.step5}
            totalAmount={calculateTotalAmount()}
            onChange={(field, value) => handleStepDataChange('step5', field, value)}
            errors={errorMessages}
          />
        );
      case 6:
        return (
          <DocumentsVerificationStep
            data={wizardData.step6}
            onChange={(field, value) => handleStepDataChange('step6', field, value)}
            errors={errorMessages}
          />
        );
      case 7:
        return (
          <TermsSignatureStep
            data={wizardData.step7}
            onChange={(field, value) => handleStepDataChange('step7', field, value)}
            errors={errorMessages}
          />
        );
      case 8:
        return (
          <FinalReviewStep
            wizardData={wizardData}
            onChange={(field, value) => handleStepDataChange('step8', field, value)}
            errors={errorMessages}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="min-h-screen bg-background" ref={swipeRef}>
      {/* Touch Swipe Indicator */}
      {isTouchDevice && isSwiping && (
        <div className="fixed inset-0 bg-primary/5 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-primary">
            <p className="text-sm font-medium text-primary">
              Swipe to navigate
            </p>
          </div>
        </div>
      )}

      {/* Wizard Progress Header */}
      <WizardProgress
        currentStep={progress.currentStep}
        totalSteps={TOTAL_STEPS}
        steps={STEP_CONFIG.map(s => ({ number: s.number, title: s.title, description: s.description }))}
        completedSteps={progress.completedSteps}
        stepValidationStatus={progress.stepValidationStatus}
        onStepClick={handleStepClick}
      />

      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Grid Layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
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
                    {customerId && hasHistory && smartDefaults && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleApplySmartDefaults}
                        disabled={loadingDefaults}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply Smart Defaults
                      </Button>
                    )}
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

            {/* Draft Management Banner */}
            {showResumePrompt && hasDraft && (
              <DraftManagementBanner
                lastSaved={progress.lastSaved}
                hasDraft={hasDraft}
                showResumePrompt={true}
                onResumeDraft={handleResumeDraft}
                onDiscardDraft={handleDiscardDraft}
              />
            )}

            {/* Validation Banner */}
            {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
              <ValidationErrorBanner
                validationResult={validationResult}
                onDismiss={() => setValidationResult({ isValid: true, errors: [], warnings: [] })}
                onNavigateToError={(path) => {
                  // Extract step number from path (e.g., "step1.customerId" -> 1)
                  const stepMatch = path.match(/step(\d+)/);
                  if (stepMatch) {
                    const stepNum = parseInt(stepMatch[1]);
                    setCurrentStep(stepNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
            )}

            {/* Step Content with Sectioned Layout */}
            <div className="space-y-6">
              {stepGroups.map(group => (
                <AgreementWizardSection
                  key={group.id}
                  group={group}
                  steps={STEP_CONFIG}
                  currentStep={progress.currentStep}
                  completedSteps={progress.completedSteps}
                  skippedSteps={progress.skippedSteps || []}
                  stepValidationStatus={progress.stepValidationStatus}
                  onStepClick={handleStepClick}
                  isExpanded={expandedSections[group.id] ?? group.steps.includes(progress.currentStep)}
                  onToggleExpand={() => toggleSectionExpand(group.id)}
                >
                  {renderStepContent()}
                </AgreementWizardSection>
              ))}
            </div>

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

                  <div className="flex-1 px-4">
                    <DraftManagementBanner
                      lastSaved={progress.lastSaved}
                      isSaving={isSaving}
                      hasDraft={hasDraft}
                      onSaveDraft={handleSaveDraft}
                      showResumePrompt={false}
                    />
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

          {/* Live Price Widget - Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <AgreementLivePriceWidget wizardData={wizardData} />
          </div>
        </div>

        {/* Mobile Price Summary - Bottom Fixed */}
        {isTouchDevice && total > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 lg:hidden z-40 animate-slide-in-bottom">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(total)}
                </p>
              </div>
              {progress.currentStep === TOTAL_STEPS - 1 ? (
                <Button onClick={handleSubmit} size="lg">
                  Issue Agreement
                </Button>
              ) : (
                <Button onClick={handleNext} size="lg">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Swipe Hint */}
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                💡 Swipe left or right to navigate steps
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Progress Panel */}
      <AgreementProgressionCard
        currentStep={progress.currentStep}
        completedSteps={progress.completedSteps}
        skippedSteps={progress.skippedSteps || []}
        stepValidationStatus={progress.stepValidationStatus}
        onStepClick={handleStepClick}
        onStepSkip={handleStepSkip}
      />

      {/* Debug Panel (Development Only) */}
      {showDebugPanel && (
        <ProgressDebugPanel
          progress={progress}
          progressSummary={getProgressSummary()}
          allStepsStatus={getAllStepsStatus()}
          onClearProgress={clearProgress}
          onResetStep={resetStepStatus}
        />
      )}
    </div>
  );
};
