import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainStopStepper } from "@/components/ui/train-stop-stepper";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react";
import { QuoteWizardStep1 } from "./wizard/QuoteWizardStep1";
import { QuoteWizardStep2 } from "./wizard/QuoteWizardStep2";
import { QuoteWizardStep3_CoverageServices } from "./wizard/QuoteWizardStep3_CoverageServices";
import { QuoteWizardStep4_Vehicles } from "./wizard/QuoteWizardStep4_Vehicles";
import { QuoteWizardStep5_Summary } from "./wizard/QuoteWizardStep5_Summary";

interface QuoteData {
  id?: string;
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
  
  // Pickup configuration
  pickup_type?: 'company_location' | 'customer_site';
  pickup_location_id?: string;
  pickup_customer_site_id?: string;
  
  // Return configuration
  return_type?: 'company_location' | 'customer_site';
  return_location_id?: string;
  return_customer_site_id?: string;
  
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
    // Phase 3B: Enhanced vehicle line fields
    vin?: string;
    color?: string;
    location_id?: string;
    odometer?: number;
    mileage_package_km: number;
    excess_km_rate: number;
    rate_type: 'monthly' | 'weekly' | 'daily';
    lease_term_months?: number;
    end_date?: string;
    // Phase 3C: Insurance overrides per line
    insurance_coverage_package?: string;
    insurance_excess_aed?: number;
    insurance_glass_tire_cover?: boolean;
    insurance_pai_enabled?: boolean;
    insurance_territorial_coverage?: string;
    // Phase 3D: Add-Ons per line
    addons?: Array<{
      id: string;
      name: string;
      type: 'monthly' | 'one-time';
      amount: number;
      enabled: boolean;
      customized?: boolean;
    }>;
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
  invoice_format?: 'consolidated' | 'per_line';
  email_invoice_to_contact?: boolean;
  invoice_contact_person_id?: string;
  payment_method?: string; // bank-transfer, credit-card, cheque, direct-debit
  customer_po_number?: string;
  payment_instructions?: string;
  
  // 7. Financial Summary (calculated + FX rate)
  fx_rate_type?: string; // corporate, spot, fixed, market
  upfront_due?: number; // Auto-calculated: deposit + advance rent + initial fees
  
  // Phase 3C: Insurance Header Defaults
  insurance_coverage_package?: 'cdw' | 'comprehensive' | 'full-zero-excess';
  insurance_excess_aed?: number;
  insurance_glass_tire_cover?: boolean;
  insurance_pai_enabled?: boolean;
  insurance_territorial_coverage?: 'uae-only' | 'gcc';
  insurance_coverage_summary?: string;
  insurance_damage_waiver?: boolean;
  insurance_theft_protection?: boolean;
  insurance_third_party_liability?: boolean;
  insurance_personal_accident?: boolean;
  insurance_additional_driver?: boolean;
  insurance_cross_border?: boolean;
  insurance_notes?: string;

  // Phase 3C: Maintenance Header Defaults
  maintenance_included?: boolean;
  maintenance_package_type?: string;
  monthly_maintenance_cost_per_vehicle?: number;
  maintenance_plan_source?: string;
  show_maintenance_separate_line?: boolean;
  maintenance_coverage_summary?: string;

  // Phase 3D: Default Add-Ons
  default_addons?: Array<{
    id: string;
    name: string;
    type: 'monthly' | 'one-time';
    amount: number;
    enabled: boolean;
  }>;
  default_addons_summary?: string;

  // Mileage Pooling Configuration
  mileage_pooling_enabled?: boolean;
  pooled_mileage_allowance_km?: number;
  pooled_excess_km_rate?: number;

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
  { id: 3, title: "Coverage & Services", description: "Insurance, maintenance & add-ons" },
  { id: 4, title: "Vehicles", description: "Vehicle selection & configuration" },
  { id: 5, title: "Summary", description: "Review & finalize quote" },
];

export const QuoteWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [quoteData, setQuoteData] = useState<Partial<QuoteData>>({
    items: [],
    tax_rate: 0.08,
    notes: "",
    status: "draft",
    version: 1,
    currency: "AED",
    quote_entry_date: new Date().toISOString().split("T")[0],
    quote_items: [], // Initialize empty vehicle lines array
    pickup_type: "company_location",
    return_type: "company_location",
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
    invoice_format: "consolidated",
    email_invoice_to_contact: false,
    payment_method: "bank-transfer",
    fx_rate_type: "corporate",
    withholding_tax_percentage: 0,
    initial_fees: [],
    // Phase 3C: Insurance defaults
    insurance_coverage_package: 'comprehensive',
    insurance_excess_aed: 1500,
    insurance_glass_tire_cover: true,
    insurance_pai_enabled: false,
    insurance_territorial_coverage: 'uae-only',
    insurance_coverage_summary: '',
    // Add-ons defaults
    default_addons: [],
    default_addons_summary: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { id: quoteIdParam } = useParams<{ id: string }>();

  // Check if we're duplicating, revising a quote, creating from RFQ, or editing existing
  const duplicateId = searchParams.get("duplicate");
  const reviseId = searchParams.get("revise");
  const fromRfqId = searchParams.get("fromRfqId");
  const editMode = searchParams.get("edit") === "true";
  const quoteIdFromSearch = searchParams.get("id");
  const quoteId = quoteIdParam || quoteIdFromSearch;

  const { data: existingQuote } = useQuery({
    queryKey: ["quote", duplicateId || reviseId || quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", duplicateId || reviseId || quoteId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(duplicateId || reviseId || (editMode && quoteId)),
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
      // Load full quote data for editing
      if (editMode && quoteId) {
        const loadedData: any = { ...existingQuote };
        if (Array.isArray(existingQuote.items)) {
          loadedData.items = existingQuote.items;
        }
        setQuoteData(loadedData);
      } else {
        // For duplicate/revise, load minimal data
        setQuoteData({
          customer_id: existingQuote.customer_id,
          vehicle_id: existingQuote.vehicle_id,
          items: Array.isArray(existingQuote.items) ? existingQuote.items as Array<{description: string; qty: number; rate: number}> : [],
          tax_rate: 0.08,
          notes: existingQuote.notes || "",
        });
      }
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
  }, [existingQuote, sourceRfq, editMode, quoteId]);

  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<QuoteData>) => {
      const quotePayload: any = {
        // Step 1 - Header Information
        legal_entity_id: data.legal_entity_id,
        business_unit_id: data.business_unit_id,
        opportunity_id: data.opportunity_id,
        customer_type: data.customer_type,
        customer_id: data.customer_id,
        account_name: data.account_name,
        customer_bill_to: data.customer_bill_to,
        contact_person_id: data.contact_person_id,
        project: data.project,
        sales_office_id: data.sales_office_id,
        sales_rep_id: data.sales_rep_id,
        quote_entry_date: data.quote_entry_date,
        status: data.status || "draft",
        quote_date: data.quote_date,
        quote_type: data.quote_type,
        quote_description: data.quote_description,
        currency: data.currency,
        validity_date_to: data.validity_date_to,
        contract_effective_from: data.contract_effective_from,
        contract_effective_to: data.contract_effective_to,
        duration_days: data.duration_days,
        vehicle_id: data.vehicle_id,
        items: data.items || [],
        notes: data.notes,
        win_loss_reason: data.win_loss_reason,
        
        // Pickup/Return Configuration
        pickup_type: data.pickup_type,
        pickup_location_id: data.pickup_location_id,
        pickup_customer_site_id: data.pickup_customer_site_id,
        return_type: data.return_type,
        return_location_id: data.return_location_id,
        return_customer_site_id: data.return_customer_site_id,
        
        // Step 2 - Financial Terms
        payment_terms_id: data.payment_terms_id,
        billing_plan: data.billing_plan,
        billing_start_date: data.billing_start_date,
        proration_rule: data.proration_rule,
        default_price_list_id: data.default_price_list_id,
        annual_escalation_percentage: data.annual_escalation_percentage,
        vat_percentage: data.vat_percentage,
        withholding_tax_percentage: data.withholding_tax_percentage,
        deposit_type: data.deposit_type,
        default_deposit_amount: data.default_deposit_amount,
        default_advance_rent_months: data.default_advance_rent_months,
        initial_fees: data.initial_fees,
        grace_period_days: data.grace_period_days,
        late_fee_percentage: data.late_fee_percentage,
        payment_method: data.payment_method,
        invoice_format: data.invoice_format,
        email_invoice_to_contact: data.email_invoice_to_contact,
        invoice_contact_person_id: data.invoice_contact_person_id,
        customer_po_number: data.customer_po_number,
        payment_instructions: data.payment_instructions,
        
        // Step 3 - Insurance
        insurance_coverage_package: data.insurance_coverage_package,
        insurance_excess_aed: data.insurance_excess_aed,
        insurance_territorial_coverage: data.insurance_territorial_coverage,
        insurance_glass_tire_cover: data.insurance_glass_tire_cover,
        insurance_pai_enabled: data.insurance_pai_enabled,
        insurance_damage_waiver: data.insurance_damage_waiver,
        insurance_theft_protection: data.insurance_theft_protection,
        insurance_third_party_liability: data.insurance_third_party_liability,
        insurance_personal_accident: data.insurance_personal_accident,
        insurance_additional_driver: data.insurance_additional_driver,
        insurance_cross_border: data.insurance_cross_border,
        insurance_coverage_summary: data.insurance_coverage_summary,
        insurance_notes: data.insurance_notes,
        
        // Step 3 - Maintenance
        maintenance_included: data.maintenance_included,
        maintenance_package_type: data.maintenance_package_type,
        monthly_maintenance_cost_per_vehicle: data.monthly_maintenance_cost_per_vehicle,
        maintenance_plan_source: data.maintenance_plan_source,
        show_maintenance_separate_line: data.show_maintenance_separate_line,
        maintenance_coverage_summary: data.maintenance_coverage_summary,
        
        // Step 3 - Add-Ons
        default_addons: data.default_addons,
        
        // Step 3 - Mileage Pooling
        mileage_pooling_enabled: data.mileage_pooling_enabled,
        pooled_mileage_allowance_km: data.pooled_mileage_allowance_km,
        pooled_excess_km_rate: data.pooled_excess_km_rate,
        
        // Step 4 - Vehicles
        quote_items: data.quote_items,
        vehicle_type_id: data.vehicle_type_id,
      };

      // If no ID exists, INSERT new quote
      if (!quoteId) {
        quotePayload.quote_number = `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        quotePayload.rfq_id = fromRfqId || null;

        const { data: quote, error } = await supabase
          .from("quotes")
          .insert(quotePayload)
          .select()
          .single();

        if (error) throw error;
        return { quote, isNew: true };
      }
      
      // If has ID, UPDATE existing quote
      const { data: quote, error } = await supabase
        .from("quotes")
        .update(quotePayload)
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return { quote, isNew: false };
    },
    onSuccess: async ({ quote, isNew }) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", quote.id] });
      
      // Update RFQ status if creating from RFQ
      if (fromRfqId && isNew) {
        await supabase
          .from("rfqs")
          .update({ status: "quoted" })
          .eq("id", fromRfqId);
        queryClient.invalidateQueries({ queryKey: ["rfq", fromRfqId] });
        queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      }
      
      toast({ 
        title: "Saved", 
        description: isNew ? "Quote saved as draft" : "Changes saved" 
      });
      
      // If new quote, silently update URL without navigation
      if (isNew) {
        const newUrl = `/quotes/new?edit=true&id=${quote.id}`;
        window.history.replaceState(null, "", newUrl);
        
        // Update local state with new ID and quote number
        setQuoteData(prev => ({ 
          ...prev, 
          id: quote.id, 
          quote_number: quote.quote_number 
        }));
      }
    },
    onError: (error) => {
      console.error("Failed to save quote:", error);
      toast({ title: "Error", description: "Failed to save quote", variant: "destructive" });
    },
  });

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
        
        console.log('🔍 Step 1 Validation - Customer Data:', {
          customer_id: quoteData.customer_id,
          pickup_type: quoteData.pickup_type,
          pickup_customer_site_id: quoteData.pickup_customer_site_id
        });
        
        // Win/Loss reason required if status is won or lost
        if ((quoteData.status === "won" || quoteData.status === "lost") && !quoteData.win_loss_reason) {
          newErrors.win_loss_reason = "Win/Loss reason is required for this status";
        }
        
        // Pickup/Return validation
        if (!quoteData.pickup_type) {
          newErrors.pickup_type = "Pickup type is required";
        }
        if (quoteData.pickup_type === "company_location" && !quoteData.pickup_location_id) {
          newErrors.pickup_location_id = "Pickup location is required";
        }
        if (quoteData.pickup_type === "customer_site" && !quoteData.pickup_customer_site_id) {
          newErrors.pickup_customer_site_id = "Customer site is required for pickup";
        }
        
        if (!quoteData.return_type) {
          newErrors.return_type = "Return type is required";
        }
        if (quoteData.return_type === "company_location" && !quoteData.return_location_id) {
          newErrors.return_location_id = "Return location is required";
        }
        if (quoteData.return_type === "customer_site" && !quoteData.return_customer_site_id) {
          newErrors.return_customer_site_id = "Customer site is required for return";
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
        if (quoteData.default_deposit_amount === undefined || quoteData.default_deposit_amount === null) newErrors.default_deposit_amount = "Deposit amount per vehicle is required";
        if (!quoteData.payment_method) newErrors.payment_method = "Payment method is required";
        if (quoteData.email_invoice_to_contact && !quoteData.invoice_contact_person_id) {
          newErrors.invoice_contact_person_id = "Invoice contact person is required when emailing invoice is enabled";
        }
        break;
      case 3:
        // Insurance validation
        if (!quoteData.insurance_coverage_package) {
          newErrors.insurance_coverage_package = "Coverage package is required";
        }
        if (quoteData.insurance_excess_aed === undefined || quoteData.insurance_excess_aed < 0) {
          newErrors.insurance_excess_aed = "Valid excess amount is required";
        }
        if (!quoteData.insurance_territorial_coverage) {
          newErrors.insurance_territorial_coverage = "Territorial coverage is required";
        }
        break;
      case 4:
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
              
              // Phase 3B validations
              if (!line.location_id) {
                newErrors[`line_${index}_location`] = `Line ${index + 1}: Location/Branch required`;
              }
              if (line.vin && line.vin.length !== 17) {
                newErrors[`line_${index}_vin`] = `Line ${index + 1}: VIN must be 17 characters`;
              }
              if (line.mileage_package_km <= 0) {
                newErrors[`line_${index}_mileage`] = `Line ${index + 1}: Mileage package must be > 0`;
              }
              if (line.excess_km_rate < 0) {
                newErrors[`line_${index}_excess_km`] = `Line ${index + 1}: Excess KM rate cannot be negative`;
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
      case 5:
        // Final step - no additional validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepId: number) => {
    // Allow clicking on current, previous, or completed steps
    if (stepId <= currentStep || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        title: "Complete current step first",
        description: "Please complete the current step before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(quoteData);
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
          <QuoteWizardStep3_CoverageServices
            data={quoteData}
            onChange={(data) => updateQuoteData(3, data)}
            errors={errors}
          />
        );
      case 4:
        return (
          <QuoteWizardStep4_Vehicles
            data={quoteData}
            onChange={(data) => updateQuoteData(4, data)}
            errors={errors}
          />
        );
      case 5:
        return (
          <QuoteWizardStep5_Summary
            data={quoteData}
            onChange={(data) => updateQuoteData(5, data)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {quoteData.id ? "Edit Quote" : reviseId ? "Revise Quote" : duplicateId ? "Duplicate Quote" : fromRfqId ? "Prepare Quote from RFQ" : "New Quote"}
            {quoteData.quote_number && ` - ${quoteData.quote_number}`}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={saveDraftMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {quoteData.id ? "Save Changes" : "Save Draft"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/quotes")}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Train Stop Progress Indicator */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <TrainStopStepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div>
        {renderStep()}
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