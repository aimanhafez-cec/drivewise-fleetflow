import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { RFQWizardStep1 } from "./wizard/RFQWizardStep1";
import { RFQWizardStep2 } from "./wizard/RFQWizardStep2";
import { RFQWizardStep3 } from "./wizard/RFQWizardStep3";

interface RFQData {
  customer_id: string;
  pickup_at: string;
  pickup_loc_id: string;
  return_at: string;
  return_loc_id: string;
  vehicle_type_id?: string;
  notes: string;
}

const steps = [
  { id: 1, title: "Customer", description: "Select customer" },
  { id: 2, title: "Trip", description: "Pickup & return info" },
  { id: 3, title: "Vehicle Request", description: "Vehicle type & notes" },
];

export const RFQWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rfqData, setRFQData] = useState<Partial<RFQData>>({
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const createRFQMutation = useMutation({
    mutationFn: async (data: RFQData) => {
      // Generate RFQ number
      const { data: rfqNo, error: rfqNoError } = await supabase.rpc("generate_rfq_no");
      if (rfqNoError) throw rfqNoError;

      const { data: rfq, error } = await supabase
        .from("rfqs")
        .insert({
          rfq_no: rfqNo,
          customer_id: data.customer_id,
          pickup_at: data.pickup_at,
          pickup_loc_id: data.pickup_loc_id,
          return_at: data.return_at,
          return_loc_id: data.return_loc_id,
          vehicle_type_id: data.vehicle_type_id,
          notes: data.notes,
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;
      return rfq;
    },
    onSuccess: (rfq) => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      toast({ title: "Success", description: "RFQ created successfully" });
      navigate(`/rfqs/${rfq.id}`);
    },
    onError: (error) => {
      console.error("Failed to create RFQ:", error);
      toast({ title: "Error", description: "Failed to create RFQ", variant: "destructive" });
    },
  });

  const updateRFQData = (step: number, data: Partial<RFQData>) => {
    setRFQData(prev => ({ ...prev, ...data }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!rfqData.customer_id) {
          newErrors.customer = "Customer is required";
        }
        break;
      case 2:
        if (!rfqData.pickup_at) newErrors.pickup_at = "Pickup date/time is required";
        if (!rfqData.pickup_loc_id) newErrors.pickup_loc_id = "Pickup location is required";
        if (!rfqData.return_at) newErrors.return_at = "Return date/time is required";
        if (!rfqData.return_loc_id) newErrors.return_loc_id = "Return location is required";
        break;
      case 3:
        // Vehicle type is optional for RFQs
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep) && rfqData.customer_id) {
      createRFQMutation.mutate(rfqData as RFQData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RFQWizardStep1
            data={rfqData}
            onChange={(data) => updateRFQData(1, data)}
            errors={errors}
          />
        );
      case 2:
        return (
          <RFQWizardStep2
            data={rfqData}
            onChange={(data) => updateRFQData(2, data)}
            errors={errors}
          />
        );
      case 3:
        return (
          <RFQWizardStep3
            data={rfqData}
            onChange={(data) => updateRFQData(3, data)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New RFQ</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/rfqs")}>
          Cancel
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center ${
                    step.id === currentStep
                      ? "text-primary font-medium"
                      : step.id < currentStep
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <div id={`rfq-wiz-step-${step.title.toLowerCase().replace(" ", "-")}`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          id="btn-rfq-wiz-back"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < steps.length ? (
          <Button
            id="btn-rfq-wiz-next"
            onClick={handleNext}
            disabled={Object.keys(errors).length > 0}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            id="btn-create-rfq"
            onClick={handleSubmit}
            disabled={createRFQMutation.isPending || Object.keys(errors).length > 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
        )}
      </div>
    </div>
  );
};