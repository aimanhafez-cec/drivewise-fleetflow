import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrainStopStepper } from "@/components/ui/train-stop-stepper";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Save, AlertCircle } from "lucide-react";
import { MasterAgreementStep1 } from "./wizard/MasterAgreementStep1";
import { MasterAgreementStep2 } from "./wizard/MasterAgreementStep2";
import { MasterAgreementStep3 } from "./wizard/MasterAgreementStep3";
import { MasterAgreementStep4 } from "./wizard/MasterAgreementStep4";
import { MasterAgreementStep5 } from "./wizard/MasterAgreementStep5";
import { MasterAgreementStep6 } from "./wizard/MasterAgreementStep6";

const steps = [
  { id: 1, title: "Header Information", description: "Agreement & customer details" },
  { id: 2, title: "Contract Framework", description: "Terms & conditions" },
  { id: 3, title: "Financial & Billing", description: "Payment terms & billing" },
  { id: 4, title: "Services & Coverage", description: "Insurance & maintenance" },
  { id: 5, title: "Tolls, Fines & Fuel", description: "Additional policies" },
  { id: 6, title: "Security & Dates", description: "Review & finalize" },
];

interface MasterAgreementWizardProps {
  agreementId?: string;
  initialData?: any;
  isEditMode?: boolean;
}

export const MasterAgreementWizard: React.FC<MasterAgreementWizardProps> = ({
  agreementId,
  initialData,
  isEditMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [agreementData, setAgreementData] = useState<any>(initialData || {
    // Step 1: Header Information
    customer_type: "Company",
    status: "draft",
    currency: "AED",
    version: 1,
    agreement_entry_date: new Date().toISOString().split('T')[0],
    
    // Step 2: Contract Framework
    credit_terms: "Net 30",
    off_hire_notice_period: 30,
    co_terminus_lines: false,
    early_termination_allowed: false,
    
    // Step 3: Financial & Billing
    billing_cycle: "Monthly",
    billing_day: "Anniversary",
    invoice_format: "Consolidated",
    line_item_granularity: "Base Rent + Add-ons",
    vat_code: "UAE 5%",
    
    // Step 4: Services & Coverage
    insurance_responsibility: "Included (Lessor)",
    maintenance_policy: "Full (PM+wear)",
    roadside_assistance_included: true,
    replacement_vehicle_included: true,
    registration_responsibility: "Lessor",
    workshop_preference: "OEM",
    
    // Step 5: Tolls, Fines & Fuel
    salik_darb_handling: "Rebill Actual (monthly)",
    traffic_fines_handling: "Auto Rebill + Admin Fee",
    fuel_handling: "Customer Fuel",
    tolls_admin_fee_model: "Per-invoice",
    admin_fee_per_fine_aed: 25,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams();

  // Load existing agreement for edit mode
  const { data: existingAgreement } = useQuery({
    queryKey: ["master-agreement-edit", id || agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corporate_leasing_agreements")
        .select("*")
        .eq("id", id || agreementId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!(id || agreementId) && isEditMode,
  });

  useEffect(() => {
    if (existingAgreement) {
      setAgreementData(existingAgreement);
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
    }
  }, [existingAgreement]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode && (id || agreementId)) {
        const { error } = await supabase
          .from("corporate_leasing_agreements")
          .update(data)
          .eq("id", id || agreementId);
        if (error) throw error;
        return id || agreementId;
      } else {
        const { data: newAgreement, error } = await supabase
          .from("corporate_leasing_agreements")
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        return newAgreement.id;
      }
    },
    onSuccess: (agreementId) => {
      queryClient.invalidateQueries({ queryKey: ["master-agreements"] });
      queryClient.invalidateQueries({ queryKey: ["master-agreement", agreementId] });
      toast({
        title: "Success",
        description: isEditMode ? "Master Agreement updated" : "Master Agreement created",
      });
      navigate(`/master-agreements/${agreementId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save master agreement",
        variant: "destructive",
      });
    },
  });

  const handleDataChange = (updates: Record<string, any>) => {
    setAgreementData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    saveMutation.mutate({ ...agreementData, status: "draft" });
  };

  const handleFinalize = () => {
    saveMutation.mutate({ ...agreementData, status: "active" });
  };

  const renderStep = () => {
    const stepProps = {
      data: agreementData,
      onChange: handleDataChange,
      errors,
    };

    switch (currentStep) {
      case 1:
        return <MasterAgreementStep1 {...stepProps} />;
      case 2:
        return <MasterAgreementStep2 {...stepProps} />;
      case 3:
        return <MasterAgreementStep3 {...stepProps} />;
      case 4:
        return <MasterAgreementStep4 {...stepProps} />;
      case 5:
        return <MasterAgreementStep5 {...stepProps} />;
      case 6:
        return <MasterAgreementStep6 {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Master Agreement" : "New Master Agreement"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update agreement details" : "Create a new corporate leasing agreement"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/master-agreements")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <TrainStopStepper 
        steps={steps} 
        currentStep={currentStep} 
        completedSteps={completedSteps}
        onStepClick={(stepId) => {
          if (stepId === currentStep || completedSteps.includes(stepId)) {
            setCurrentStep(stepId);
          }
        }}
      />

      <Card>
        <CardContent className="pt-6">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors before proceeding
              </AlertDescription>
            </Alert>
          )}

          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinalize} disabled={saveMutation.isPending}>
              {isEditMode ? "Update Agreement" : "Create Agreement"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
