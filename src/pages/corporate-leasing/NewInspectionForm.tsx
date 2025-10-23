import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { CorporateBasicInfo } from '@/components/inspection/corporate/CorporateBasicInfo';
import { CorporateVehicleSelection } from '@/components/inspection/corporate/CorporateVehicleSelection';
import { CorporateDamageMarking } from '@/components/inspection/corporate/CorporateDamageMarking';
import { CorporateChecklist } from '@/components/inspection/corporate/CorporateChecklist';
import { CorporateMetrics } from '@/components/inspection/corporate/CorporateMetrics';
import { CorporateNotesAttachments } from '@/components/inspection/corporate/CorporateNotesAttachments';
import { CorporateSignature } from '@/components/inspection/corporate/CorporateSignature';
import { useCreateInspection, useUpdateInspection, useCompleteInspection } from '@/hooks/useInspectionMaster';
import type { InspectionType, InspectionMaster } from '@/types/inspection';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Vehicle Selection' },
  { id: 3, title: 'Damage Marking' },
  { id: 4, title: 'Checklist' },
  { id: 5, title: 'Metrics' },
  { id: 6, title: 'Notes & Attachments' },
  { id: 7, title: 'Signature' }
];

export default function NewInspectionForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    inspection_type: '' as InspectionType | '',
    vehicle_id: '',
    vin: '',
    item_code: '',
    agreement_id: '',
    line_id: '',
    damage_marker_ids: [] as string[],
    checklist: {},
    metrics: {},
    media: [],
    attachments: [],
    notes: ''
  });

  const createMutation = useCreateInspection();
  const updateMutation = useUpdateInspection();
  const completeMutation = useCompleteInspection();

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedFromCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return !!formData.inspection_type;
      case 2: // Vehicle Selection
        return !!formData.vehicle_id;
      default: // Steps 3-7 are optional
        return true;
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.inspection_type || !formData.vehicle_id) {
      toast.error('Please select inspection type and vehicle first');
      return;
    }

    if (!inspectionId) {
      const result = await createMutation.mutateAsync({
        inspection_type: formData.inspection_type,
        vehicle_id: formData.vehicle_id,
        vin: formData.vin,
        item_code: formData.item_code,
        agreement_id: formData.agreement_id,
        line_id: formData.line_id
      });
      setInspectionId(result.id);
    } else {
      await updateMutation.mutateAsync({
        id: inspectionId,
        updates: {
          damage_marker_ids: formData.damage_marker_ids,
          checklist: formData.checklist,
          metrics: formData.metrics,
          media: formData.media,
          attachments: formData.attachments,
          notes: formData.notes,
          status: 'IN_PROGRESS'
        } as any
      });
    }
  };

  const handleNext = async () => {
    // Auto-save before moving to next step
    if (currentStep === 2 && !inspectionId) {
      await handleSaveDraft();
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (signature: any) => {
    if (!inspectionId) {
      toast.error('Please save the inspection first');
      return;
    }

    await completeMutation.mutateAsync({
      id: inspectionId,
      signature
    });

    navigate(`/corporate-leasing-operations/manage-inspections/${inspectionId}`);
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Inspection</h1>
          <p className="text-muted-foreground mt-1">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/corporate-leasing-operations/manage-inspections')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={!formData.inspection_type}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              {STEPS.map((step) => (
                <span
                  key={step.id}
                  className={`${
                    step.id === currentStep
                      ? 'text-primary'
                      : step.id < currentStep
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {step.id}
                </span>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <CorporateBasicInfo
                inspectionType={formData.inspection_type}
                entryDate={formData.entry_date}
                status="DRAFT"
                onUpdate={(field, value) => updateFormData({ [field]: value })}
              />
            )}
            {currentStep === 2 && (
              <CorporateVehicleSelection
                vehicleId={formData.vehicle_id || null}
                vin={formData.vin || null}
                onUpdate={(vehicleId, vin, itemCode) => updateFormData({
                  vehicle_id: vehicleId,
                  vin: vin,
                  item_code: itemCode
                })}
              />
            )}
            {currentStep === 3 && (
              <CorporateDamageMarking
                vehicleId={formData.vehicle_id}
                damageMarkerIds={formData.damage_marker_ids}
                onUpdate={(ids) => updateFormData({ damage_marker_ids: ids })}
              />
            )}
            {currentStep === 4 && (
              <CorporateChecklist
                checklist={formData.checklist as Record<string, 'OK' | 'DAMAGE'>}
                onChange={(checklist) => updateFormData({ checklist })}
              />
            )}
            {currentStep === 5 && (
              <CorporateMetrics
                metrics={formData.metrics}
                media={formData.media}
                onChange={(metrics, media) => updateFormData({ metrics, media })}
              />
            )}
            {currentStep === 6 && (
              <CorporateNotesAttachments
                notes={formData.notes}
                attachments={formData.attachments}
                onUpdate={(notes, attachments) => updateFormData({ notes, attachments })}
              />
            )}
            {currentStep === 7 && (
              <CorporateSignature
                signature={null}
                onUpdate={(signature) => signature && handleComplete(signature)}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep < STEPS.length && (
              <Button
                onClick={handleNext}
                disabled={!canProceedFromCurrentStep()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
