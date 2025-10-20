import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCreateMovement } from "@/hooks/useVehicleMovements";
import { CreateMovementData } from "@/lib/api/fleet-operations";
import { VehicleSelectionStep } from "./wizard/VehicleSelectionStep";
import { SourceDestinationStep } from "./wizard/SourceDestinationStep";
import { TimingLogisticsStep } from "./wizard/TimingLogisticsStep";
import { FinancialImpactStep } from "./wizard/FinancialImpactStep";
import { DocumentsStep } from "./wizard/DocumentsStep";
import { ReviewSubmitStep } from "./wizard/ReviewSubmitStep";

const STEPS = [
  { id: 1, title: "Select Vehicles", component: VehicleSelectionStep },
  { id: 2, title: "Source & Destination", component: SourceDestinationStep },
  { id: 3, title: "Timing & Logistics", component: TimingLogisticsStep },
  { id: 4, title: "Financial Impact", component: FinancialImpactStep },
  { id: 5, title: "Documents", component: DocumentsStep },
  { id: 6, title: "Review & Submit", component: ReviewSubmitStep },
];

export function MovementWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateMovementData>>({});
  const createMutation = useCreateMovement();

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

  const handleStepData = (data: Partial<CreateMovementData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.movement_type || !formData.vehicle_ids || formData.vehicle_ids.length === 0) {
        toast({
          title: "Missing information",
          description: "Please complete all required fields",
          variant: "destructive",
        });
        return;
      }

      if (!formData.effective_from || !formData.reason_code) {
        toast({
          title: "Missing information",
          description: "Please provide effective date and reason code",
          variant: "destructive",
        });
        return;
      }

      await createMutation.mutateAsync(formData as CreateMovementData);
      
      toast({
        title: "Success",
        description: "Movement created successfully",
      });
      
      navigate("/operations/fleet");
    } catch (error) {
      console.error("Error creating movement:", error);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="overflow-x-auto">
        <div className="flex items-start min-w-max px-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep === step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center max-w-[80px] leading-tight ${
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
                  className={`h-0.5 flex-1 min-w-[40px] mx-2 transition-colors ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        <CurrentStepComponent 
          data={formData} 
          onUpdate={handleStepData}
          onNext={handleNext}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/operations/fleet")}
          >
            Cancel
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Submit Movement"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
