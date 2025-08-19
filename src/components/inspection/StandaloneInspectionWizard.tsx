import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StandaloneVehicleAssignment } from './steps/StandaloneVehicleAssignment';
import { InspectionChecklist } from './steps/InspectionChecklist';
import { InspectionMetrics } from './steps/InspectionMetrics';
import { StandaloneInspectionSummary } from './steps/StandaloneInspectionSummary';
import { X, Save, CheckCircle } from 'lucide-react';

const CHECKLIST_SECTIONS = [
  {
    name: 'Exterior',
    items: [
      { id: 'exterior', name: 'Exterior Panels', description: 'Check for dents, scratches, paint damage', testId: 'chk-exterior' }
    ]
  },
  {
    name: 'Glass',
    items: [
      { id: 'glass', name: 'Windshield & Windows', description: 'Check for cracks, chips, or damage', testId: 'chk-glass' }
    ]
  },
  {
    name: 'Tires & Rims',
    items: [
      { id: 'tires', name: 'Tires & Rims', description: 'Check tread, sidewalls, rim condition', testId: 'chk-tires' }
    ]
  },
  {
    name: 'Interior',
    items: [
      { id: 'interior', name: 'Dashboard & Seats', description: 'Check seats, dashboard, controls', testId: 'chk-interior' }
    ]
  },
  {
    name: 'Accessories',
    items: [
      { id: 'accessories', name: 'Spare Tire & Equipment', description: 'Check spare tire, jack, GPS, child seats', testId: 'chk-accessories' }
    ]
  }
];

interface ChecklistData {
  status: Record<string, 'OK' | 'DAMAGE'>;
  photos: Record<string, Array<{id: string; file: File; preview: string}>>;
  extraDamages: Record<string, Array<{id: string; description: string; photos: Array<{id: string; file: File; preview: string}>}>>;
}

interface StandaloneInspectionData {
  vehicleId?: string;
  checklist: ChecklistData;
  metrics: {
    odometer?: number;
    fuelLevel?: 'E' | 'Q1' | 'H' | 'Q3' | 'F';
    extras?: Array<{code: string; qty: number}>;
  };
  signature?: { imageUrl: string; name: string; signedAt: string };
  notes?: string;
}

type WizardStep = 'vehicle' | 'checklist' | 'metrics' | 'summary';

const STEPS: { key: WizardStep; title: string; id: string }[] = [
  { key: 'vehicle', title: 'Select Vehicle', id: 'step-vehicle' },
  { key: 'checklist', title: 'Walk-Around Checklist', id: 'step-checklist' },
  { key: 'metrics', title: 'Vehicle Metrics', id: 'step-metrics' },
  { key: 'summary', title: 'Summary & Signature', id: 'step-summary' },
];

interface StandaloneInspectionWizardProps {
  onClose?: () => void;
}

export const StandaloneInspectionWizard: React.FC<StandaloneInspectionWizardProps> = ({
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('vehicle');
  const [inspectionData, setInspectionData] = useState<StandaloneInspectionData>({
    checklist: { status: {}, photos: {}, extraDamages: {} },
    metrics: {},
  });
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Save inspection mutation
  const saveInspectionMutation = useMutation({
    mutationFn: async (finalData: StandaloneInspectionData & { status: 'passed' | 'failed' | 'needs_attention' }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const performed_by = userRes?.user?.id || null;
      
      const payload = {
        vehicle_id: finalData.vehicleId,
        reservation_id: null,
        odometer: finalData.metrics.odometer || null,
        fuel_level: finalData.metrics.fuelLevel === 'F' ? 100 : 
                   finalData.metrics.fuelLevel === 'Q3' ? 75 :
                   finalData.metrics.fuelLevel === 'H' ? 50 :
                   finalData.metrics.fuelLevel === 'Q1' ? 25 : 0,
        notes: finalData.notes || null,
        performed_by,
        status: finalData.status,
        checklist: finalData.checklist.status,
        photos: []
      };

      const { error } = await supabase.from("inspections").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Inspection Saved',
        description: 'Your inspection was recorded successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      if (onClose) {
        onClose();
      } else {
        navigate("/inspections");
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save inspection',
        variant: 'destructive'
      });
    }
  });

  const getCurrentStepIndex = () => STEPS.findIndex(step => step.key === currentStep);
  const getProgressPercentage = () => ((getCurrentStepIndex() + 1) / STEPS.length) * 100;

  const handleStepData = (stepKey: WizardStep, data: any) => {
    const updatedData = { ...inspectionData };
    
    switch (stepKey) {
      case 'vehicle':
        updatedData.vehicleId = data.vehicleId;
        break;
      case 'checklist':
        updatedData.checklist = { ...updatedData.checklist, ...data };
        break;
      case 'metrics':
        updatedData.metrics = { ...updatedData.metrics, ...data };
        break;
      case 'summary':
        if (data.signature) updatedData.signature = data.signature;
        if (data.notes) updatedData.notes = data.notes;
        break;
    }
    
    setInspectionData(updatedData);
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1].key;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  const handleComplete = (status: 'passed' | 'failed' | 'needs_attention') => {
    saveInspectionMutation.mutate({ ...inspectionData, status });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'vehicle':
        return !!inspectionData.vehicleId;
      case 'checklist':
        // Check if all checklist items are completed
        const totalItems = CHECKLIST_SECTIONS.flatMap(s => s.items).length;
        const completedItems = Object.keys(inspectionData.checklist.status).length;
        return completedItems === totalItems;
      default:
        return true;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'vehicle':
        return (
          <StandaloneVehicleAssignment
            selectedVehicleId={inspectionData.vehicleId}
            onVehicleSelect={(vehicleId) => handleStepData('vehicle', { vehicleId })}
          />
        );
      case 'checklist':
        return (
          <InspectionChecklist
            data={inspectionData.checklist}
            onUpdate={(data) => handleStepData('checklist', data)}
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
          <StandaloneInspectionSummary
            inspectionData={inspectionData}
            onSignature={(signature) => handleStepData('summary', { signature })}
            onNotesChange={(notes) => handleStepData('summary', { notes })}
            onComplete={handleComplete}
            isSubmitting={saveInspectionMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/inspections");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Vehicle Inspection</h1>
          <p className="text-muted-foreground">Complete comprehensive vehicle inspection with damage mapping and photos</p>
        </div>
        <Button variant="outline" onClick={handleClose}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {getCurrentStepIndex() + 1} of {STEPS.length}</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-between">
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
        </CardHeader>

        <CardContent className="space-y-6">
          {renderCurrentStep()}
        </CardContent>

        {/* Footer - only show if not on summary step */}
        {currentStep !== 'summary' && (
          <div className="border-t p-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={getCurrentStepIndex() === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};