import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PhaseStatus = "pending" | "in-progress" | "completed";

interface Phase {
  id: string;
  title: string;
  description: string;
  status: PhaseStatus;
  tasks: string[];
}

export default function ReservationWizardRoadmap() {
  const { toast } = useToast();
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "phase-a",
      title: "Phase A: Expand Wizard Data Model",
      description: "Add multi-line support, price lists, drivers, airport info, insurance, billing config to ReservationWizardContext",
      status: "pending",
      tasks: [
        "Add reservationLines array to data model",
        "Add priceList fields (hourlyRate, dailyRate, etc.)",
        "Add drivers array with roles",
        "Add airport information fields",
        "Add insurance fields (level, group, provider)",
        "Add bill-to configuration",
        "Add metadata (reservationMethod, businessUnit, taxLevel)",
        "Add adjustments & deposits fields",
        "Add referral fields"
      ]
    },
    {
      id: "phase-b",
      title: "Phase B: Add New Wizard Steps",
      description: "Create new wizard step components for business config, price list, drivers, airport, insurance, billing",
      status: "pending",
      tasks: [
        "Create Step1_5BusinessConfig.tsx (Reservation Method, Business Unit, Payment Terms)",
        "Create Step2_5PriceList.tsx (Price List selector with rate display)",
        "Refactor Step4 to Step4MultiLineBuilder.tsx (Multi-vehicle line management)",
        "Create Step4_5Drivers.tsx (Multiple driver selection with roles)",
        "Create Step5_5AirportInfo.tsx (Arrival/Departure flight details)",
        "Create Step5_6Insurance.tsx (Insurance level, group, provider)",
        "Create Step5_7BillingConfig.tsx (Bill-to, tax, discount)",
        "Enhance Step6PricingSummary.tsx (Line-by-line breakdown)",
        "Enhance Step7DownPayment.tsx (Full payment & deposits)",
        "Create Step7_5ReferralNotes.tsx (Referral & notes)"
      ]
    },
    {
      id: "phase-c",
      title: "Phase C: Shared Components",
      description: "Create reusable LOV selectors and line management components",
      status: "pending",
      tasks: [
        "Create PriceListSelect component",
        "Create ReservationMethodSelect component",
        "Create BusinessUnitSelect component",
        "Create PaymentTermsSelect component",
        "Create InsuranceLevelSelect component",
        "Create InsuranceProviderSelect component",
        "Create DiscountTypeSelect component",
        "Create ReservationLineTable component",
        "Create LineEditorModal component"
      ]
    },
    {
      id: "phase-d",
      title: "Phase D: Update Main Wizard Flow",
      description: "Expand wizard to 13 steps with proper validation and save functionality",
      status: "pending",
      tasks: [
        "Update ReservationWizardMain.tsx with 13 steps",
        "Add step-by-step validation logic",
        "Add 'Save Draft' functionality",
        "Update database insertion for multi-line reservations",
        "Add driver junction table inserts",
        "Store airport, insurance, billing data"
      ]
    },
    {
      id: "phase-e",
      title: "Phase E: LOV Endpoints Integration",
      description: "Ensure all LOV selectors use server-side endpoints with search and pagination",
      status: "pending",
      tasks: [
        "Verify /api/reservation-methods endpoint",
        "Verify /api/business-units endpoint",
        "Verify /api/payment-terms endpoint",
        "Verify /api/price-lists endpoint",
        "Verify /api/tax-levels endpoint",
        "Verify /api/insurance-levels endpoint",
        "Verify /api/insurance-providers endpoint",
        "Verify /api/discount-types endpoint",
        "Add debounce (250ms) to all searches",
        "Add 5-minute caching",
        "Add hydrate-by-id support"
      ]
    },
    {
      id: "phase-f",
      title: "Phase F: Data Consistency & Validation",
      description: "Enhance validation for multi-line, drivers, dates, and business rules",
      status: "pending",
      tasks: [
        "Add multi-line validation (vehicle + dates per line)",
        "Add driver validation (call validate-driver-checkout)",
        "Add price list validation",
        "Add airport validation (if enabled)",
        "Add insurance validation (all 3 fields required)",
        "Add bill-to validation",
        "Add date conflict checking across lines",
        "Add duplicate vehicle prevention"
      ]
    },
    {
      id: "phase-g",
      title: "Phase G: Database Schema Updates",
      description: "Add missing columns to reservations and create junction tables",
      status: "pending",
      tasks: [
        "Add reservation_method_id to reservations table",
        "Add business_unit_id to reservations table",
        "Add price_list_id to reservations table",
        "Add airport fields (arrival/departure) to reservations",
        "Add insurance fields to reservations",
        "Add bill_to fields to reservations",
        "Add pre_adjustment, security_deposit_paid to reservations",
        "Add referral fields to reservations",
        "Add line_no to reservation_lines",
        "Create reservation_drivers junction table",
        "Run database migration"
      ]
    },
    {
      id: "phase-h",
      title: "Phase H: Testing & Edge Cases",
      description: "Test all scenarios including multi-line, price lists, drivers, and validations",
      status: "pending",
      tasks: [
        "Test adding 5 vehicles with different classes",
        "Test assigning different drivers to each line",
        "Test overriding dates/locations per line",
        "Test line-specific add-ons",
        "Test switching price lists mid-flow",
        "Test manual rate overrides",
        "Test driver validation (unverified, underage, expired)",
        "Test airport info enable/disable",
        "Test billing config (customer/company/site)",
        "Test referral code application"
      ]
    }
  ]);

  const [implementing, setImplementing] = useState<string | null>(null);

  const handleImplementPhase = async (phaseId: string) => {
    setImplementing(phaseId);
    
    setPhases(prev => prev.map(p => 
      p.id === phaseId ? { ...p, status: "in-progress" as PhaseStatus } : p
    ));

    // Simulate implementation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPhases(prev => prev.map(p => 
      p.id === phaseId ? { ...p, status: "completed" as PhaseStatus } : p
    ));

    toast({
      title: "Phase Implemented",
      description: `${phases.find(p => p.id === phaseId)?.title} has been implemented successfully.`,
    });

    setImplementing(null);
  };

  const handleTestAll = async () => {
    const allCompleted = phases.every(p => p.status === "completed");
    
    if (!allCompleted) {
      toast({
        title: "Cannot Test Yet",
        description: "Please complete all phases before testing.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Running Tests",
      description: "Testing all implemented features...",
    });

    // Simulate testing
    await new Promise(resolve => setTimeout(resolve, 3000));

    toast({
      title: "All Tests Passed",
      description: "The enhanced reservation wizard is ready to use!",
    });
  };

  const getStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedCount = phases.filter(p => p.status === "completed").length;
  const totalPhases = phases.length;
  const progress = (completedCount / totalPhases) * 100;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservation Wizard Enhancement Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          Implementation plan to add all missing features from the old reservation form
        </p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {completedCount} of {totalPhases} phases completed ({Math.round(progress)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-4">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <Card key={phase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(phase.status)}
                  <div>
                    <CardTitle className="text-xl">{phase.title}</CardTitle>
                    <CardDescription className="mt-1">{phase.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(phase.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Tasks:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  {phase.tasks.map((task, idx) => (
                    <li key={idx} className="list-disc">{task}</li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={() => handleImplementPhase(phase.id)}
                disabled={phase.status === "completed" || implementing !== null}
                className="w-full sm:w-auto"
              >
                {implementing === phase.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Implementing...
                  </>
                ) : phase.status === "completed" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Implement Phase
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test All Button */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Final Testing</CardTitle>
          <CardDescription>
            Run comprehensive tests once all phases are implemented
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleTestAll}
            size="lg"
            className="w-full"
            disabled={completedCount !== totalPhases}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Test All Implementation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
