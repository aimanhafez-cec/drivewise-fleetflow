import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { InspectionBasicInfo } from '@/components/inspection/steps/InspectionBasicInfo';
import { InspectionVehicleSelection } from '@/components/inspection/steps/InspectionVehicleSelection';
import { InspectionDamageMarking } from '@/components/inspection/steps/InspectionDamageMarking';
import { InspectionChecklist } from '@/components/inspection/steps/InspectionChecklist';
import { InspectionMetrics } from '@/components/inspection/steps/InspectionMetrics';
import { InspectionNotesAttachments } from '@/components/inspection/steps/InspectionNotesAttachments';
import { InspectionSignature } from '@/components/inspection/steps/InspectionSignature';
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={!formData.inspection_type || !formData.vehicle_id}>
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
              <InspectionBasicInfo
                data={formData}
                inspectionNo={inspectionId ? 'Auto-generated' : 'Will be generated after save'}
                onChange={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <InspectionVehicleSelection
                inspectionType={formData.inspection_type}
                selectedVehicle={formData.vehicle_id ? {
                  vehicleId: formData.vehicle_id,
                  vin: formData.vin,
                  itemCode: formData.item_code,
                  description: '',
                  agreementId: formData.agreement_id,
                  lineId: formData.line_id
                } : null}
                onSelect={(vehicle) => updateFormData({
                  vehicle_id: vehicle.vehicleId,
                  vin: vehicle.vin,
                  item_code: vehicle.itemCode,
                  agreement_id: vehicle.agreementId,
                  line_id: vehicle.lineId
                })}
              />
            )}
            {currentStep === 3 && (
              <InspectionDamageMarking
                vehicleId={formData.vehicle_id}
                damageMarkerIds={formData.damage_marker_ids}
                onUpdate={(ids) => updateFormData({ damage_marker_ids: ids })}
              />
            )}
            {currentStep === 4 && (
              <InspectionChecklist
                data={{ status: formData.checklist }}
                onUpdate={(data) => updateFormData({ checklist: data.status })}
              />
            )}
            {currentStep === 5 && (
              <InspectionMetrics
                data={formData.metrics}
                onUpdate={(data) => updateFormData({ metrics: data })}
              />
            )}
            {currentStep === 6 && (
              <InspectionNotesAttachments
                notes={formData.notes}
                attachments={formData.attachments}
                onChange={(notes, attachments) => updateFormData({ notes, attachments })}
              />
            )}
            {currentStep === 7 && (
              <InspectionSignature
                onComplete={handleComplete}
                isLoading={completeMutation.isPending}
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
                disabled={!formData.inspection_type || !formData.vehicle_id}
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
