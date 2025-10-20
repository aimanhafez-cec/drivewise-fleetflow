import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { custodyApi } from "@/lib/api/custody";
import type { CustodyTransactionCreate } from "@/lib/api/custody";

// Step Components
import { CustodyStep1Agreement } from "@/components/custody/wizard/CustodyStep1Agreement";
import { CustodyStep2Reason } from "@/components/custody/wizard/CustodyStep2Reason";
import { CustodyStep3Custodian } from "@/components/custody/wizard/CustodyStep3Custodian";
import { CustodyStep4Replacement } from "@/components/custody/wizard/CustodyStep4Replacement";
import { CustodyStep5RatePolicy } from "@/components/custody/wizard/CustodyStep5RatePolicy";
import { CustodyStep6Documents } from "@/components/custody/wizard/CustodyStep6Documents";
import { CustodyStep7Review } from "@/components/custody/wizard/CustodyStep7Review";

const STEPS = [
  { id: 1, title: "Agreement & Vehicle", component: CustodyStep1Agreement },
  { id: 2, title: "Custody Reason", component: CustodyStep2Reason },
  { id: 3, title: "Custodian", component: CustodyStep3Custodian },
  { id: 4, title: "Replacement Vehicle", component: CustodyStep4Replacement },
  { id: 5, title: "Rate Policy", component: CustodyStep5RatePolicy },
  { id: 6, title: "Documents", component: CustodyStep6Documents },
  { id: 7, title: "Review & Submit", component: CustodyStep7Review },
];

export default function NewCustody() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CustodyTransactionCreate>>({
    until_original_ready: true,
    deposit_carryover: true,
    rate_policy: 'inherit',
  });
  const [documentIds, setDocumentIds] = useState<string[]>([]);

  // Create custody mutation
  const createMutation = useMutation({
    mutationFn: async (data: CustodyTransactionCreate) => {
      return custodyApi.createCustodyTransaction(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Custody transaction created",
        description: `Custody ${data.custody_no} has been created successfully.`,
      });
      navigate(`/custody/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating custody",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<CustodyTransactionCreate>) => {
      return custodyApi.createCustodyTransaction(data as CustodyTransactionCreate);
    },
    onSuccess: (data) => {
      toast({
        title: "Draft saved",
        description: `Custody ${data.custody_no} has been saved as draft.`,
      });
      navigate(`/custody/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving draft",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFormData = (updates: Partial<CustodyTransactionCreate>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(formData);
  };

  const handleSubmit = () => {
    if (!formData.customer_id || !formData.custodian_name || !formData.reason_code || !formData.incident_date || !formData.effective_from) {
      toast({
        title: "Missing required fields",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData as CustodyTransactionCreate);
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/custody")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Custody Transaction</h1>
            <p className="text-muted-foreground mt-1">
              Create a new vehicle custody transaction
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saveDraftMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
      </div>

      {/* Progress Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep === step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-12 lg:w-24 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            {...(currentStep === 6 && {
              documentIds,
              setDocumentIds,
            })}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
