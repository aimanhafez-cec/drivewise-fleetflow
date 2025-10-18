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
import { MasterAgreementStep5Drivers } from "./wizard/MasterAgreementStep5_Drivers";
import { MasterAgreementStep5Attachments } from "./wizard/MasterAgreementStep5_Attachments";
import { MasterAgreementStep6Summary } from "./wizard/MasterAgreementStep6_Summary";

const steps = [
  { id: 1, title: "Header", description: "Agreement header information" },
  { id: 2, title: "Commercial", description: "Billing, deposits & payment terms" },
  { id: 3, title: "Coverage & Services", description: "Insurance, maintenance & add-ons" },
  { id: 4, title: "Vehicles", description: "Vehicle selection & configuration" },
  { id: 5, title: "Drivers", description: "Assign authorized drivers" },
  { id: 6, title: "Attachments", description: "Upload supporting documents" },
  { id: 7, title: "Summary", description: "Review & finalize agreement" },
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
    customer_type: "Company",
    status: "draft",
    currency: "AED",
    version: 1,
    agreement_entry_date: new Date().toISOString().split('T')[0],
    pickup_type: "company_location",
    return_type: "company_location",
    billing_plan: "monthly",
    proration_rule: "first-last",
    vat_percentage: 5,
    deposit_type: "refundable",
    default_deposit_amount: 2500,
    default_advance_rent_months: 1,
    payment_method: "bank-transfer",
    invoice_format: "consolidated",
    insurance_coverage_package: "comprehensive",
    insurance_excess_aed: 1500,
    insurance_glass_tire_cover: true,
    insurance_territorial_coverage: "uae-only",
    maintenance_package_type: "none",
    monthly_maintenance_cost_per_vehicle: 250,
    maintenance_plan_source: "internal",
    show_maintenance_separate_line: true,
    salik_darb_handling: "Rebill Actual (monthly)",
    tolls_admin_fee_model: "Per-invoice",
    traffic_fines_handling: "Auto Rebill + Admin Fee",
    admin_fee_per_fine_aed: 25,
    initial_fees: [],
    default_addons: [],
    agreement_items: [],
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAgreementItems, setLastSavedAgreementItems] = useState<any[]>([]);
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
    if (!existingAgreement) return;

    const loadAgreementWithLines = async () => {
      console.log("[MasterAgreementWizard] Loading existing agreement:", existingAgreement);

      // Fetch agreement lines from corporate_leasing_lines table
      const { data: agreementLines } = await supabase
        .from("corporate_leasing_lines")
        .select("*")
        .eq("agreement_id", existingAgreement.id)
        .order("line_number");

      console.log("[MasterAgreementWizard] Loaded lines from DB:", agreementLines);

      // Transform lines back to agreement_items format for the wizard UI
      const transformedItems = (agreementLines || []).map((line) => ({
        line_no: line.line_number,
        contract_no: line.contract_no,
        vehicle_class_id: line.vehicle_class_id,
        vehicle_id: line.vehicle_id,
        quantity: line.qty,
        pickup_at: line.lease_start_date,
        return_at: line.lease_end_date,
        duration_months: line.contract_months,
        lease_term_months: line.contract_months,
        monthly_rate: line.monthly_rate_aed,
        mileage_package_km: line.mileage_allowance_km_month,
        excess_km_rate: line.excess_km_rate_aed,
        deposit_amount: line.security_deposit_aed || existingAgreement.default_deposit_amount,
        advance_rent_months: existingAgreement.default_advance_rent_months,
        setup_fee: line.setup_fee_aed,
        
        // Delivery & Collection settings from line OR header
        pickup_type: line.pickup_type || existingAgreement.pickup_type,
        pickup_location_id: line.pickup_location_id || existingAgreement.pickup_location_id,
        pickup_customer_site_id: line.pickup_customer_site_id || existingAgreement.pickup_customer_site_id,
        return_type: line.return_type || existingAgreement.return_type,
        return_location_id: line.return_location_id || existingAgreement.return_location_id,
        return_customer_site_id: line.return_customer_site_id || existingAgreement.return_customer_site_id,
        delivery_fee: line.delivery_fee ?? existingAgreement.default_delivery_fee ?? 0,
        collection_fee: line.collection_fee ?? existingAgreement.default_collection_fee ?? 0,
        
        _vehicleMeta: {
          item_code: line.item_code,
          item_description: line.item_description,
          make: line.make,
          model: line.model,
          year: line.model_year,
          color: line.exterior_color,
          category_name: line.category_name,
        },
      }));

      console.log("[MasterAgreementWizard] Transformed items for UI:", transformedItems);

      // Map invoice_format (DB enum) → form value
      let invoiceFormatForm = "consolidated"; // default
      if (existingAgreement.invoice_format === "Per Vehicle") {
        invoiceFormatForm = "per_line";
      } else if (existingAgreement.invoice_format === "Per Cost Center") {
        invoiceFormatForm = "per_cost_center";
      } else if (existingAgreement.invoice_format === "Consolidated") {
        invoiceFormatForm = "consolidated";
      }

      // Transform database fields to form fields
      const transformedData = {
        ...existingAgreement,
        // Map customer_segment (DB: SME/Enterprise/Government) → customer_type (Form: Company/Person)
        customer_type: existingAgreement.customer_segment === "Enterprise" 
          ? "Company"
          : existingAgreement.customer_segment === "Government"
          ? "Company"
          : "Person", // SME defaults to Person
        // Map bill_to_site_id (DB) → customer_bill_to (Form)
        customer_bill_to: existingAgreement.bill_to_site_id,
        // Map invoice_contact_person_id (DB) → contact_person_id (Form)
        contact_person_id: existingAgreement.invoice_contact_person_id,
        // Map contract_start_date (DB) → contract_effective_from (Form)
        contract_effective_from: existingAgreement.contract_start_date,
        // Map contract_end_date (DB) → contract_effective_to (Form)
        contract_effective_to: existingAgreement.contract_end_date,
        // Map invoice_format (DB enum) → form value
        invoice_format: invoiceFormatForm,
        // LOAD agreement_items from corporate_leasing_lines table
        agreement_items: transformedItems,
      };
      setAgreementData(transformedData);
      setLastSavedAgreementItems(transformedItems);
      setCompletedSteps([1, 2, 3, 4, 5, 6]);
    };

    loadAgreementWithLines().catch((err) => {
      console.error("[MasterAgreementWizard] Error loading agreement:", err);
    });
  }, [existingAgreement]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Map invoice_format (form value) → DB enum
      let invoiceFormatDb: "Consolidated" | "Per Vehicle" | "Per Cost Center" = "Consolidated";
      const formatLower = data.invoice_format?.toLowerCase();
      if (formatLower === "per_line" || formatLower === "per-line" || formatLower === "per vehicle" || formatLower === "per-vehicle") {
        invoiceFormatDb = "Per Vehicle";
      } else if (formatLower === "per_cost_center" || formatLower === "per-cost-center" || formatLower === "per cost center") {
        invoiceFormatDb = "Per Cost Center";
      } else if (formatLower === "consolidated") {
        invoiceFormatDb = "Consolidated";
      }

      // Transform form fields back to database fields
      const dbData = {
        ...data,
        // Map customer_type (Form: Company/Person) → customer_segment (DB: Enterprise/SME/Government)
        customer_segment: data.customer_type === "Company"
          ? "Enterprise" as any
          : "SME" as any, // Person → SME (Individual doesn't exist in enum)
        customer_type: undefined,
        // Map customer_bill_to (Form) → bill_to_site_id (DB)
        bill_to_site_id: data.customer_bill_to,
        customer_bill_to: undefined,
        // Map contact_person_id (Form) → invoice_contact_person_id (DB)
        invoice_contact_person_id: data.contact_person_id,
        contact_person_id: undefined,
        // Map contract_effective_from (Form) → contract_start_date (DB)
        contract_start_date: data.contract_effective_from,
        contract_effective_from: undefined,
        // Map contract_effective_to (Form) → contract_end_date (DB)
        contract_end_date: data.contract_effective_to,
        contract_effective_to: undefined,
        // Map invoice_format (form value) → DB enum
        invoice_format: invoiceFormatDb,
        // SYNC agreement_items JSONB with form data
        agreement_items: data.agreement_items || [],
      };

      console.log("[MasterAgreementWizard] Saving with agreement_items:", {
        itemsCount: (data.agreement_items || []).length,
        firstItem: (data.agreement_items || [])[0],
      });
      
      if (isEditMode && (id || agreementId)) {
        const actualId = id || agreementId;
        
        // Update the main agreement
        const { error } = await supabase
          .from("corporate_leasing_agreements")
          .update(dbData)
          .eq("id", actualId);
        if (error) throw error;
        
        // Sync agreement_items back to corporate_leasing_lines
        const items = data.agreement_items || [];
        if (items.length > 0) {
          // Get existing agreement to generate contract numbers
          const { data: existingAg } = await supabase
            .from("corporate_leasing_agreements")
            .select("agreement_no")
            .eq("id", actualId)
            .single();
          
          const agreementNo = existingAg?.agreement_no || "TBD";
          
          // Helper to calculate duration
          const calculateDurationMonths = (pickupAt?: string, returnAt?: string) => {
            if (!pickupAt || !returnAt) return 12;
            const from = new Date(pickupAt);
            const to = new Date(returnAt);
            const diffTime = Math.abs(to.getTime() - from.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.ceil(diffDays / 30.44);
          };
          
          // Delete old lines and insert new ones (full replace)
          await supabase.from("corporate_leasing_lines").delete().eq("agreement_id", actualId);
          
          const lines = items.map((item: any, index: number) => {
            const lineNumber = index + 1;
            const contractNo = `${agreementNo}-${String(lineNumber).padStart(2, '0')}`;
            
            return {
              agreement_id: actualId,
              contract_no: contractNo,
              line_number: lineNumber,
              vehicle_class_id: item.vehicle_class_id,
              vehicle_id: item.vehicle_id,
              qty: item.quantity || 1,
              lease_start_date: item.pickup_at,
              lease_end_date: item.return_at,
              monthly_rate_aed: item.monthly_rate,
              contract_months: item.duration_months || item.lease_term_months || calculateDurationMonths(item.pickup_at, item.return_at),
              mileage_allowance_km_month: item.mileage_package_km,
              excess_km_rate_aed: item.excess_km_rate,
              security_deposit_aed: item.deposit_amount,
              setup_fee_aed: item.setup_fee,
              line_status: "draft",
              
              // Delivery & Collection settings
              pickup_type: item.pickup_type,
              pickup_location_id: item.pickup_location_id,
              pickup_customer_site_id: item.pickup_customer_site_id,
              return_type: item.return_type,
              return_location_id: item.return_location_id,
              return_customer_site_id: item.return_customer_site_id,
              delivery_fee: item.delivery_fee ?? 0,
              collection_fee: item.collection_fee ?? 0,
              
              // Store metadata
              make: item._vehicleMeta?.make,
              model: item._vehicleMeta?.model,
              model_year: item._vehicleMeta?.year,
              exterior_color: item._vehicleMeta?.color,
              item_code: item._vehicleMeta?.item_code,
              item_description: item._vehicleMeta?.item_description,
              category_name: item._vehicleMeta?.category_name,
            };
          });
          
          const { error: linesError } = await supabase.from("corporate_leasing_lines").insert(lines);
          if (linesError) throw linesError;
        }
        
        return actualId;
      } else {
        const { data: newAgreement, error } = await supabase
          .from("corporate_leasing_agreements")
          .insert([dbData])
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
    setAgreementData((prev: any) => {
      const updated = { ...prev, ...updates };
      if ('agreement_items' in updates && prev.id) {
        const currentItems = JSON.stringify(updates.agreement_items || []);
        const savedItems = JSON.stringify(lastSavedAgreementItems);
        setHasUnsavedChanges(currentItems !== savedItems);
      }
      return updated;
    });
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
        return <MasterAgreementStep4 {...stepProps} hasUnsavedChanges={hasUnsavedChanges} onSaveRequired={handleSaveDraft} />;
      case 5:
        return <MasterAgreementStep5Drivers {...stepProps} />;
      case 6:
        return <MasterAgreementStep5Attachments {...stepProps} />;
      case 7:
        return <MasterAgreementStep6Summary {...stepProps} />;
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
            {agreementData.agreement_no && ` - ${agreementData.agreement_no}`}
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
            {isEditMode || agreementData.id ? "Save Changes" : "Save Draft"}
          </Button>

          <Button variant="outline" onClick={() => navigate("/master-agreements")} disabled={saveMutation.isPending}>
            Cancel
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
