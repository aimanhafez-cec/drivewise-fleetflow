import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, CheckCircle } from 'lucide-react';
import { InspectionSection } from '@/components/inspection/corporate/InspectionSection';
import { InspectionFormRow } from '@/components/inspection/corporate/InspectionFormRow';
import { ReadOnlyField } from '@/components/inspection/corporate/ReadOnlyField';
import { VehicleSearchTabs } from '@/components/inspection/corporate/VehicleSearchTabs';
import { CorporateChecklist } from '@/components/inspection/corporate/CorporateChecklist';
import { CorporateDamageMarking } from '@/components/inspection/corporate/CorporateDamageMarking';
import { CorporateMetrics } from '@/components/inspection/corporate/CorporateMetrics';
import { CorporateNotesAttachments } from '@/components/inspection/corporate/CorporateNotesAttachments';
import { CorporateSignature } from '@/components/inspection/corporate/CorporateSignature';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequiredLabel } from '@/components/ui/required-label';
import { useCreateInspection, useUpdateInspection, useCompleteInspection } from '@/hooks/useInspectionMaster';
import type { InspectionType } from '@/types/inspection';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function NewInspectionForm() {
  const navigate = useNavigate();
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    inspection_no: 'Auto-generated',
    entry_date: new Date().toISOString().split('T')[0],
    status: 'DRAFT' as 'DRAFT' | 'IN_PROGRESS' | 'APPROVED',
    inspection_type: '' as InspectionType | '',
    vehicle_id: '',
    vin: '',
    item_code: '',
    agreement_id: '',
    line_id: '',
    damage_marker_ids: [] as string[],
    checklist: [] as any[],
    metrics: {},
    media: [],
    attachments: [],
    notes: '',
    signature: null as any
  });

  const createMutation = useCreateInspection();
  const updateMutation = useUpdateInspection();
  const completeMutation = useCompleteInspection();

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = async () => {
    if (!formData.inspection_type) {
      toast.error('Please select inspection type first');
      return;
    }

    try {
      if (!inspectionId) {
        const result = await createMutation.mutateAsync({
          inspection_type: formData.inspection_type,
          vehicle_id: formData.vehicle_id || undefined,
          vin: formData.vin || undefined,
          item_code: formData.item_code || undefined,
          agreement_id: formData.agreement_id || undefined,
          line_id: formData.line_id || undefined
        });
        setInspectionId(result.id);
        setFormData(prev => ({ ...prev, inspection_no: result.inspection_no }));
        toast.success('Draft saved successfully');
      } else {
        await updateMutation.mutateAsync({
          id: inspectionId,
          updates: {
            vehicle_id: formData.vehicle_id || undefined,
            vin: formData.vin || undefined,
            item_code: formData.item_code || undefined,
            agreement_id: formData.agreement_id || undefined,
            line_id: formData.line_id || undefined,
            damage_marker_ids: formData.damage_marker_ids,
            checklist: formData.checklist,
            metrics: formData.metrics,
            media: formData.media,
            attachments: formData.attachments,
            notes: formData.notes,
            status: 'IN_PROGRESS'
          } as any
        });
        toast.success('Draft updated successfully');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handleCompleteClick = () => {
    // Validation
    if (!formData.inspection_type) {
      toast.error('Please select inspection type');
      return;
    }
    if (!formData.vehicle_id) {
      toast.error('Please select a vehicle');
      return;
    }
    if (!formData.signature) {
      toast.error('Please provide a signature');
      return;
    }
    if (!formData.signature.name) {
      toast.error('Please enter inspector name');
      return;
    }

    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    if (!inspectionId) {
      toast.error('Please save the inspection first');
      return;
    }

    try {
      await completeMutation.mutateAsync({
        id: inspectionId,
        signature: formData.signature
      });

      toast.success('Inspection completed successfully');
      navigate('/corporate-leasing-operations/manage-inspections');
    } catch (error) {
      toast.error('Failed to complete inspection');
    }
    setShowCompleteDialog(false);
  };

  const canComplete = formData.inspection_type && formData.vehicle_id && formData.signature && formData.signature.name;

  return (
    <div className="container mx-auto py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">New Inspection</h1>
          <p className="text-muted-foreground mt-1">
            Complete all required fields and sign to submit the inspection
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Auto-filled Header Section */}
        <InspectionSection title="Inspection Information">
          <InspectionFormRow>
            <ReadOnlyField 
              label="Inspection No." 
              value={formData.inspection_no}
            />
            <ReadOnlyField 
              label="Entry Date" 
              value={new Date(formData.entry_date).toLocaleDateString()}
            />
            <ReadOnlyField 
              label="Status" 
              value={formData.status}
            />
          </InspectionFormRow>
        </InspectionSection>

        {/* Basic Information */}
        <InspectionSection title="Basic Information" icon={<AlertCircle className="h-5 w-5" />}>
          <InspectionFormRow columns={3}>
            <div className="space-y-2">
              <RequiredLabel required>Inspection Type</RequiredLabel>
              <Select 
                value={formData.inspection_type} 
                onValueChange={(value) => updateFormData({ inspection_type: value as InspectionType })}
              >
                <SelectTrigger aria-required>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENTAL_CHECKOUT">Rental Check-out</SelectItem>
                  <SelectItem value="RENTAL_CHECKIN">Rental Check-in</SelectItem>
                  <SelectItem value="PERIODIC">Periodic Inspection</SelectItem>
                  <SelectItem value="RANDOM">Random Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </InspectionFormRow>
        </InspectionSection>

        {/* Vehicle Selection */}
        <InspectionSection title="Vehicle Selection" icon={<AlertCircle className="h-5 w-5" />}>
          <VehicleSearchTabs
            inspectionType={formData.inspection_type as InspectionType}
            vehicleId={formData.vehicle_id}
            vin={formData.vin}
            itemCode={formData.item_code}
            agreementId={formData.agreement_id}
            lineNo={formData.line_id ? Number(formData.line_id) : undefined}
            onUpdate={(data) => {
              updateFormData({
                vehicle_id: data.vehicleId,
                vin: data.vin,
                item_code: data.itemCode,
                agreement_id: data.agreementId,
                line_id: data.lineNo?.toString()
              });
            }}
          />
        </InspectionSection>

        {/* General Inspection Checklist */}
        <InspectionSection 
          title="General Inspection Checklist" 
          collapsible 
          defaultOpen={true}
        >
          <CorporateChecklist
            checklist={formData.checklist}
            onChange={(checklist) => updateFormData({ checklist })}
          />
        </InspectionSection>

        {/* Damage Marking */}
        <InspectionSection 
          title="Damage Marking" 
          collapsible 
          defaultOpen={false}
        >
          <CorporateDamageMarking
            vehicleId={formData.vehicle_id}
            lineId={formData.line_id}
            damageMarkerIds={formData.damage_marker_ids}
            onUpdate={(ids) => updateFormData({ damage_marker_ids: ids })}
          />
        </InspectionSection>

        {/* Metrics */}
        <InspectionSection 
          title="Metrics" 
          collapsible 
          defaultOpen={false}
        >
          <CorporateMetrics
            metrics={formData.metrics}
            media={formData.media}
            onChange={(metrics, media) => updateFormData({ metrics, media })}
          />
        </InspectionSection>

        {/* Notes & Attachments */}
        <InspectionSection title="Notes & Attachments">
          <CorporateNotesAttachments
            notes={formData.notes}
            attachments={formData.attachments}
            onUpdate={(notes, attachments) => updateFormData({ notes, attachments })}
          />
        </InspectionSection>

        {/* Signature */}
        <InspectionSection title="Signature" icon={<AlertCircle className="h-5 w-5" />}>
          <CorporateSignature
            signature={formData.signature}
            onUpdate={(signature) => updateFormData({ signature })}
          />
        </InspectionSection>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/corporate-leasing-operations/manage-inspections')}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={!formData.inspection_type || createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={handleCompleteClick}
                disabled={!canComplete || completeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Inspection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Inspection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this inspection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
