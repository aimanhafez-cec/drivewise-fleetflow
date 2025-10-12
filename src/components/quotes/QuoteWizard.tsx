import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { QuoteWizardStep1 } from "./wizard/QuoteWizardStep1";
import { QuoteWizardStep2 } from "./wizard/QuoteWizardStep2";
import { QuoteWizardStep3 } from "./wizard/QuoteWizardStep3";
import { QuoteWizardStep4 } from "./wizard/QuoteWizardStep4";

interface QuoteData {
  // Header fields from Step 1
  legal_entity_id?: string;
  business_unit_id?: string;
  opportunity_id?: string;
  quote_number?: string;
  quote_description?: string;
  customer_type?: string;
  customer_id?: string;
  account_name?: string;
  customer_bill_to?: string;
  contact_person_id?: string;
  project?: string;
  sales_office_id?: string;
  sales_rep_id?: string;
  quote_entry_date?: string;
  status?: string;
  win_loss_reason?: string;
  version?: number;
  quote_date?: string;
  quote_type?: string;
  currency?: string;
  validity_date_to?: string;
  contract_effective_from?: string;
  contract_effective_to?: string;
  duration_days?: number;
  
  // Trip details from Step 2
  pickup_at?: string;
  pickup_location?: string;
  return_at?: string;
  return_location?: string;
  
  // Vehicle from Step 3 (legacy single-vehicle for non-corporate)
  vehicle_type_id?: string;
  vehicle_id?: string;
  
  // Vehicle Lines (for Corporate multi-vehicle quotes)
  quote_items?: Array<{
    line_no: number;
    vehicle_class_id?: string;
    vehicle_id?: string;
    pickup_at: string;
    return_at: string;
    deposit_amount: number;
    deposit_type?: string;
    advance_rent_months: number;
    monthly_rate: number;
    duration_months: number;
  }>;
  
  // Financial Section from Step 4 (19 fields)
  // 1. Billing & Payment Terms
  payment_terms_id?: string;
  billing_plan?: string; // monthly, quarterly, semi-annual, annual
  billing_start_date?: string;
  proration_rule?: string; // none, first-only, last-only, first-last, all-periods
  
  // 2. Tax & Pricing
  vat_percentage?: number;
  default_price_list_id?: string;
  withholding_tax_percentage?: number;
  
  // 3. Deposits & Advances (defaults for vehicle lines)
  deposit_type?: string; // refundable, non-refundable, bank-guarantee
  default_deposit_amount?: number;
  default_advance_rent_months?: number;
  annual_escalation_percentage?: number;
  
  // 4. Initial Fees (header)
  initial_fees?: Array<{
    fee_type: string;
    description: string;
    amount: number;
  }>;
  
  // 5. Late Fee Policy
  grace_period_days?: number;
  late_fee_percentage?: number;
  
  // 6. Invoice & Payment Settings
  invoice_consolidation?: boolean;
  invoice_to_email?: string;
  payment_method?: string; // bank-transfer, credit-card, cheque, direct-debit
  customer_po_number?: string;
  
  // 7. Financial Summary (calculated + FX rate)
  fx_rate_type?: string; // corporate, spot, fixed, market
  upfront_due?: number; // Auto-calculated: deposit + advance rent + initial fees
  
  // Legacy pricing fields (keep for backward compatibility)
  items?: Array<{
    description: string;
    qty: number;
    rate: number;
  }>;
  tax_rate?: number;
  
  // Other fields
  notes?: string;
  expires_at?: string;
}

const steps = [
  { id: 1, title: "Header", description: "Quote header information" },
  { id: 2, title: "Financials", description: "Billing, deposits & payment terms" },
  { id: 3, title: "Vehicles", description: "Vehicle selection & configuration" },
  { id: 4, title: "Summary", description: "Review & finalize quote" },
];

export const QuoteWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState<Partial<QuoteData>>({
    items: [],
    tax_rate: 0.08,
    notes: "",
    status: "draft",
    version: 1,
    currency: "AED",
    quote_entry_date: new Date().toISOString().split("T")[0],
    quote_items: [], // Initialize empty vehicle lines array
    // Financial defaults
    vat_percentage: 5, // UAE standard 5%
    billing_plan: "monthly",
    proration_rule: "first-last",
    deposit_type: "refundable",
    default_deposit_amount: 2500, // Per vehicle default
    default_advance_rent_months: 1, // Per vehicle default
    annual_escalation_percentage: 5,
    grace_period_days: 5,
    late_fee_percentage: 2,
    invoice_consolidation: false,
    payment_method: "bank-transfer",
    fx_rate_type: "corporate",
    withholding_tax_percentage: 0,
    initial_fees: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Check if we're duplicating, revising a quote, or creating from RFQ
  const duplicateId = searchParams.get("duplicate");
  const reviseId = searchParams.get("revise");
  const fromRfqId = searchParams.get("fromRfq");

  const { data: existingQuote } = useQuery({
    queryKey: ["quote", duplicateId || reviseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", duplicateId || reviseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(duplicateId || reviseId),
  });

  const { data: sourceRfq } = useQuery({
    queryKey: ["rfq", fromRfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", fromRfqId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!fromRfqId,
  });

  useEffect(() => {
    if (existingQuote) {
      setQuoteData({
        customer_id: existingQuote.customer_id,
        vehicle_id: existingQuote.vehicle_id,
        items: Array.isArray(existingQuote.items) ? existingQuote.items as Array<{description: string; qty: number; rate: number}> : [],
        tax_rate: 0.08,
        notes: existingQuote.notes || "",
      });
    } else if (sourceRfq) {
      setQuoteData({
        customer_id: sourceRfq.customer_id,
        pickup_at: sourceRfq.pickup_at,
        pickup_location: sourceRfq.pickup_loc_id,
        return_at: sourceRfq.return_at,
        return_location: sourceRfq.return_loc_id,
        vehicle_type_id: sourceRfq.vehicle_type_id,
        items: [],
        tax_rate: 0.08,
        notes: sourceRfq.notes || "",
      });
    }
  }, [existingQuote, sourceRfq]);

  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteData) => {
      const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
      const taxAmount = subtotal * data.tax_rate;
      const total = subtotal + taxAmount;

      const { data: quote, error } = await supabase
        .from("quotes")
        .insert({
          customer_id: data.customer_id,
          vehicle_id: data.vehicle_id,
          items: data.items,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          valid_until: data.expires_at,
          notes: data.notes,
          quote_number: `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
          status: "draft",
          rfq_id: fromRfqId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return quote;
    },
    onSuccess: async (quote) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      
      // Update RFQ status to 'quoted' if this quote was created from an RFQ
      if (fromRfqId) {
        await supabase
          .from("rfqs")
          .update({ status: "quoted" })
          .eq("id", fromRfqId);
        queryClient.invalidateQueries({ queryKey: ["rfq", fromRfqId] });
        queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      }
      
      toast({ title: "Success", description: "Quote created successfully" });
      navigate(`/quotes/${quote.id}`);
    },
    onError: (error) => {
      console.error("Failed to create quote:", error);
      toast({ title: "Error", description: "Failed to create quote", variant: "destructive" });
    },
  });

  const updateQuoteData = (step: number, data: Partial<QuoteData>) => {
    setQuoteData(prev => ({ ...prev, ...data }));
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // Required fields validation
        if (!quoteData.legal_entity_id) newErrors.legal_entity_id = "Legal entity is required";
        if (!quoteData.business_unit_id) newErrors.business_unit_id = "Business unit is required";
        if (!quoteData.customer_type) newErrors.customer_type = "Customer type is required";
        if (!quoteData.customer_id) newErrors.customer_id = "Customer is required";
        if (!quoteData.sales_office_id) newErrors.sales_office_id = "Sales office is required";
        if (!quoteData.sales_rep_id) newErrors.sales_rep_id = "Sales representative is required";
        if (!quoteData.quote_date) newErrors.quote_date = "Quote date is required";
        if (!quoteData.quote_type) newErrors.quote_type = "Quote type is required";
        
        // Win/Loss reason required if status is won or lost
        if ((quoteData.status === "won" || quoteData.status === "lost") && !quoteData.win_loss_reason) {
          newErrors.win_loss_reason = "Win/Loss reason is required for this status";
        }
        break;
      case 2:
        // Financial required fields
        if (!quoteData.payment_terms_id) newErrors.payment_terms_id = "Payment terms is required";
        if (!quoteData.billing_plan) newErrors.billing_plan = "Billing plan is required";
        if (!quoteData.billing_start_date) newErrors.billing_start_date = "Billing start date is required";
        if (quoteData.vat_percentage === undefined) newErrors.vat_percentage = "VAT % is required";
        if (!quoteData.default_price_list_id) newErrors.default_price_list_id = "Price list is required";
        if (!quoteData.deposit_type) newErrors.deposit_type = "Deposit type is required";
        if (!quoteData.default_deposit_amount) newErrors.default_deposit_amount = "Deposit amount per vehicle is required";
        if (!quoteData.payment_method) newErrors.payment_method = "Payment method is required";
        if (quoteData.invoice_consolidation && !quoteData.invoice_to_email) {
          newErrors.invoice_to_email = "Invoice email is required when consolidation is enabled";
        }
        break;
      case 3:
        // Vehicle selection validation
        if (quoteData.quote_type === 'Corporate lease') {
          // Multi-vehicle validation
          if (!quoteData.quote_items || quoteData.quote_items.length === 0) {
            newErrors.quote_items = "At least one vehicle line is required";
          } else {
            quoteData.quote_items.forEach((line, index) => {
              if (!line.vehicle_class_id && !line.vehicle_id) {
                newErrors[`line_${index}_vehicle`] = `Line ${index + 1}: Vehicle category or specific vehicle required`;
              }
              if (!line.pickup_at) {
                newErrors[`line_${index}_pickup`] = `Line ${index + 1}: Pickup date required`;
              }
              if (!line.return_at) {
                newErrors[`line_${index}_return`] = `Line ${index + 1}: Return date required`;
              }
              if (line.pickup_at && line.return_at && new Date(line.pickup_at) >= new Date(line.return_at)) {
                newErrors[`line_${index}_dates`] = `Line ${index + 1}: Return date must be after pickup date`;
              }
              if (!line.monthly_rate || line.monthly_rate <= 0) {
                newErrors[`line_${index}_rate`] = `Line ${index + 1}: Monthly rate required`;
              }
              if (line.deposit_amount < 0) {
                newErrors[`line_${index}_deposit`] = `Line ${index + 1}: Deposit cannot be negative`;
              }
              if (line.advance_rent_months < 0) {
                newErrors[`line_${index}_advance`] = `Line ${index + 1}: Advance rent months cannot be negative`;
              }
            });
          }
        } else {
          // Single vehicle validation (legacy)
          if (!quoteData.vehicle_type_id && !quoteData.vehicle_id) {
            newErrors.vehicle = "Vehicle category or specific vehicle required";
          }
        }
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
    if (validateStep(currentStep) && quoteData.customer_id) {
      createQuoteMutation.mutate(quoteData as QuoteData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuoteWizardStep1
            data={quoteData}
            onChange={(data) => updateQuoteData(1, data)}
            errors={errors}
          />
        );
      case 2:
        return (
          <QuoteWizardStep2
            data={quoteData}
            onChange={(data) => updateQuoteData(2, data)}
            errors={errors}
          />
        );
      case 3:
        return (
          <QuoteWizardStep3
            data={quoteData}
            onChange={(data) => updateQuoteData(3, data)}
            errors={errors}
          />
        );
      case 4:
        return (
          <QuoteWizardStep4
            data={quoteData}
            onChange={(data) => updateQuoteData(4, data)}
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
          <h1 className="text-3xl font-bold tracking-tight">
            {reviseId ? "Revise Quote" : duplicateId ? "Duplicate Quote" : fromRfqId ? "Prepare Quote from RFQ" : "New Quote"}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/quotes")}>
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
                  <div id={`wiz-step-${step.title.toLowerCase().replace(" ", "-")}`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {renderStep()}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quoteData.items && quoteData.items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {quoteData.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span>{item.description}</span>
                          <span>AED {(item.qty * item.rate).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>
                        ${quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({((quoteData.tax_rate || 0) * 100).toFixed(0)}%)</span>
                      <span>
                        ${(quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (quoteData.tax_rate || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total</span>
                      <span>
                        ${(quoteData.items.reduce((sum, item) => sum + (item.qty * item.rate), 0) * (1 + (quoteData.tax_rate || 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No items added yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          id="btn-wiz-back"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < steps.length ? (
          <Button
            id="btn-wiz-next"
            onClick={handleNext}
            disabled={Object.keys(errors).length > 0}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            id="btn-send"
            onClick={handleSubmit}
            disabled={createQuoteMutation.isPending || Object.keys(errors).length > 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        )}
      </div>
    </div>
  );
};