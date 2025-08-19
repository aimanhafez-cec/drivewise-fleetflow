import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { inspectionApi, InspectionData, CreateInspectionRequest, InspectionType } from '@/lib/api/inspection';
import { InspectionVehicleAssignment } from './steps/InspectionVehicleAssignment';
import { InspectionChecklist } from './steps/InspectionChecklist';
import { InspectionDamage } from './steps/InspectionDamage';
import { InspectionMetrics } from './steps/InspectionMetrics';
import { InspectionSummary } from './steps/InspectionSummary';
import { X, Save, Lock } from 'lucide-react';

interface InspectionWizardProps {
  agreementId: string;
  lineId: string;
  onClose: () => void;
  isOpen: boolean;
  inspectionType?: InspectionType;
}

type WizardStep = 'assign' | 'checklist' | 'damage' | 'metrics' | 'summary';

const STEPS: { key: WizardStep; title: string; id: string }[] = [
  { key: 'assign', title: 'Assign Vehicle', id: 'step-assign' },
  { key: 'checklist', title: 'Walk-Around Checklist', id: 'step-checklist' },
  { key: 'damage', title: 'Damage Marking', id: 'step-damage' },
  { key: 'metrics', title: 'Vehicle Metrics', id: 'step-metrics' },
  { key: 'summary', title: 'Summary & Signature', id: 'step-summary' },
];

export const InspectionWizard: React.FC<InspectionWizardProps> = ({
  agreementId,
  lineId,
  onClose,
  isOpen,
  inspectionType = 'OUT'
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('assign');
  const [inspectionData, setInspectionData] = useState<Partial<InspectionData>>({});
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch existing inspection if any
  const { data: existingInspection } = useQuery({
    queryKey: ['inspection', agreementId, lineId, inspectionType],
    queryFn: async () => {
      return await inspectionApi.getInspectionByAgreement(agreementId, inspectionType);
    },
    enabled: isOpen,
  });

  // Load existing inspection data
  useEffect(() => {
    if (existingInspection) {
      setInspectionData(existingInspection);
      setIsDraft(existingInspection.status === 'DRAFT');
    }
  }, [existingInspection]);

  // Start inspection mutation
  const startInspectionMutation = useMutation({
    mutationFn: async (data: CreateInspectionRequest) => {
      return await inspectionApi.startInspection(data, `inspection-${Date.now()}`);
    },
    onSuccess: (data) => {
      setInspectionData(data);
      setIsDraft(true);
      toast({
        title: 'Inspection Started',
        description: 'Pre-rental inspection has been started successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to start inspection.',
        variant: 'destructive'
      });
    }
  });

  // Update inspection mutation
  const updateInspectionMutation = useMutation({
    mutationFn: async (updateData: any) => {
      if (!inspectionData.id) return;
      return await inspectionApi.updateInspection(inspectionData.id, updateData, inspectionType);
    },
    onSuccess: (data) => {
      if (data) {
        setInspectionData(data);
        toast({
          title: 'Draft Saved',
          description: 'Inspection progress has been saved.'
        });
      }
    },
  });

  // Lock inspection mutation
  const lockInspectionMutation = useMutation({
    mutationFn: async () => {
      if (!inspectionData.id) throw new Error('No inspection ID');
      return await inspectionApi.lockAndAttach(inspectionData.id, inspectionType);
    },
    onSuccess: () => {
      toast({
        title: 'Inspection Locked',
        description: `${inspectionType === 'OUT' ? 'Pre-rental' : 'Return'} inspection has been completed and locked to the agreement.`
      });
      queryClient.invalidateQueries({ queryKey: ['inspection'] });
      queryClient.invalidateQueries({ queryKey: ['agreement'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to lock inspection.',
        variant: 'destructive'
      });
    }
  });

  // Initialize inspection if not exists
  useEffect(() => {
    if (isOpen && !existingInspection && !inspectionData.id) {
      startInspectionMutation.mutate({
        agreementId,
        lineId,
        type: inspectionType
      });
    }
  }, [isOpen, existingInspection, inspectionData.id]);

  // Listen for proceed to next step event
  useEffect(() => {
    const handleProceedNext = () => {
      handleNext();
    };
    
    window.addEventListener('proceedToNextStep', handleProceedNext);
    return () => window.removeEventListener('proceedToNextStep', handleProceedNext);
  }, [currentStep, inspectionData]);

  const getCurrentStepIndex = () => STEPS.findIndex(step => step.key === currentStep);
  const getProgressPercentage = () => ((getCurrentStepIndex() + 1) / STEPS.length) * 100;

  const handleStepData = (stepKey: WizardStep, data: any) => {
    const updatedData = { ...inspectionData };
    
    switch (stepKey) {
      case 'checklist':
        updatedData.checklist = { ...updatedData.checklist, ...data };
        break;
      case 'damage':
        updatedData.damageMarkerIds = data.damageMarkerIds || [];
        break;
      case 'metrics':
        updatedData.metrics = { ...updatedData.metrics, ...data };
        break;
      case 'summary':
        updatedData.signature = data.signature;
        break;
    }
    
    setInspectionData(updatedData);
  };

  const handleSaveDraft = () => {
    if (!inspectionData.id) return;
    
    updateInspectionMutation.mutate({
      checklist: inspectionData.checklist,
      metrics: inspectionData.metrics,
      damageMarkerIds: inspectionData.damageMarkerIds,
      signature: inspectionData.signature,
    });
  };

  const handleNext = () => {
    console.log('handleNext called - currentStep:', currentStep);
    console.log('inspectionData:', inspectionData);
    
    const currentIndex = getCurrentStepIndex();
    console.log('Current index:', currentIndex, 'Total steps:', STEPS.length);
    
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1].key;
      console.log('Moving to next step:', nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  const handleLockAndAttach = () => {
    lockInspectionMutation.mutate();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'assign':
        return (
          <InspectionVehicleAssignment
            agreementId={agreementId}
            lineId={lineId}
            onComplete={(data) => {
              handleStepData('assign', data);
              handleNext();
            }}
          />
        );
      case 'checklist':
        // Convert old format to new format if needed
        let checklistData;
        if (inspectionData.checklist && typeof inspectionData.checklist === 'object' && !('status' in inspectionData.checklist)) {
          // Old format: Record<string, 'OK' | 'DAMAGE'>
          checklistData = {
            status: inspectionData.checklist as Record<string, 'OK' | 'DAMAGE'>,
            photos: {},
            extraDamages: {}
          };
        } else {
          // New format or empty
          checklistData = inspectionData.checklist || { status: {}, photos: {}, extraDamages: {} };
        }
        
        return (
          <InspectionChecklist
            data={checklistData}
            onUpdate={(data) => handleStepData('checklist', data)}
          />
        );
      case 'damage':
        return (
          <InspectionDamage
            agreementId={agreementId}
            lineId={lineId}
            existingMarkerIds={inspectionData.damageMarkerIds || []}
            onUpdate={(data) => handleStepData('damage', data)}
          />
        );
      case 'metrics':
        return (
          <InspectionMetrics
            data={inspectionData.metrics || {}}
            onUpdate={(data) => handleStepData('metrics', data)}
          />
        );
      case 'summary':
        return (
          <InspectionSummary
            inspectionData={inspectionData}
            onSignature={(signature) => handleStepData('summary', { signature })}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{inspectionType === 'OUT' ? 'Pre-Rental' : 'Return'} Inspection</h2>
              <p className="text-muted-foreground">Complete the vehicle inspection {inspectionType === 'OUT' ? 'before check-out' : 'after return'}</p>
            </div>
            <div className="flex items-center gap-2">
              {isDraft && (
                <Badge variant="secondary">
                  <Save className="mr-1 h-3 w-3" />
                  Draft
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {getCurrentStepIndex() + 1} of {STEPS.length}</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => (
              <div 
                key={step.key}
                id={step.id}
                className={`flex flex-col items-center text-xs ${
                  index <= getCurrentStepIndex() ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  index <= getCurrentStepIndex() ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index + 1}
                </div>
                <span className="text-center max-w-16">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={getCurrentStepIndex() === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!inspectionData.id || updateInspectionMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep === 'summary' ? (
              <Button
                id="btn-lock-attach"
                onClick={handleLockAndAttach}
                disabled={lockInspectionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock & Attach to Agreement
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={false}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};