import { supabase } from "@/integrations/supabase/client";

export const convertQuoteToCorporateLease = async (quoteId: string) => {
  // 1. Fetch full quote data
  const { data: quote, error: fetchError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (fetchError) throw fetchError;

  // 1.1 Check if already converted (prevent duplicates)
  if (quote.converted_to_agreement) {
    throw new Error(`Quote ${quote.quote_number} has already been converted to agreement ${quote.agreement_no}`);
  }

  // 2. Generate new agreement number
  const { data: agreementNo, error: agreementNoError } = await supabase.rpc(
    "generate_corporate_lease_no"
  );

  if (agreementNoError) throw agreementNoError;

  // 3. Parse quote items
  const quoteItems = Array.isArray(quote.quote_items) ? quote.quote_items : [];
  
  // 3.1 Determine framework model based on whether items have vehicle_id
  const hasVehicleIds = quoteItems.some((item: any) => item.vehicle_id);
  const frameworkModel = hasVehicleIds ? "Fixed Rate per VIN" : "Rate Card by Class";
  
  // 3.2 Billing cycle - force to Monthly (only valid value)
  const billingCycle = "Monthly";
  
  // 3.3 Map invoice format (must be "Consolidated", "Per Vehicle", "Per Cost Center")
  let invoiceFormat: "Consolidated" | "Per Vehicle" | "Per Cost Center" = "Consolidated";
  const formatLower = quote.invoice_format?.toLowerCase();
  if (formatLower === "per vehicle" || formatLower === "per-vehicle" || formatLower === "per_line" || formatLower === "per-line") {
    invoiceFormat = "Per Vehicle";
  } else if (formatLower === "per cost center" || formatLower === "per-cost-center") {
    invoiceFormat = "Per Cost Center";
  }
  
  // 3.4 Map credit terms (valid values: "Immediate", "Net 15", "Net 30", "Net 45", "Custom")
  let creditTerms: "Immediate" | "Net 15" | "Net 30" | "Net 45" | "Custom" = "Net 30";
  let creditTermsNote = "";
  const termsLower = (quote.payment_terms_id || "").toString().toLowerCase().trim();
  
  switch (termsLower) {
    case "immediate": creditTerms = "Immediate"; break;
    case "net 15": creditTerms = "Net 15"; break;
    case "net 30": creditTerms = "Net 30"; break;
    case "net 45": creditTerms = "Net 45"; break;
    default:
      if (termsLower) {
        creditTerms = "Custom";
        creditTermsNote = `Original credit terms: ${termsLower}`;
      }
  }
  
  // 3.5 Calculate master term from duration (valid: "12 months", "24 months", "36 months", "48 months", "Open-ended")
  let masterTerm: "12 months" | "24 months" | "36 months" | "48 months" | "Open-ended" = "12 months";
  if (quote.duration_days) {
    const months = Math.ceil(quote.duration_days / 30);
    if (months <= 12) masterTerm = "12 months";
    else if (months <= 24) masterTerm = "24 months";
    else if (months <= 36) masterTerm = "36 months";
    else masterTerm = "48 months";
  }
  
  // 3.6 Map security instrument (valid: "None", "Deposit per Vehicle", "Bank Guarantee")
  let securityInstrument: "None" | "Deposit per Vehicle" | "Bank Guarantee" = "None";
  let securityNote = "";
  
  if (quote.deposit_type === "refundable") {
    securityInstrument = "Deposit per Vehicle";
  } else if (quote.deposit_type === "bank-guarantee") {
    securityInstrument = "Bank Guarantee";
  } else if (quote.deposit_type === "letter-of-credit") {
    securityInstrument = "Bank Guarantee";
    securityNote = "Security type: Letter of Credit (treated as Bank Guarantee)";
  }
  
  // 3.7 Pro-rate initial fees across lines
  const initialFees = Array.isArray(quote.initial_fees) ? quote.initial_fees : [];
  const totalSetupFees = initialFees.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0);
  const setupFeePerLine = quoteItems.length > 0 ? totalSetupFees / quoteItems.length : 0;

  // Validation: Ensure setup fee calculation is valid
  console.log('[Quote Conversion] Setup fee calculation:', {
    quoteNumber: quote.quote_number,
    totalSetupFees,
    quoteItemsCount: quoteItems.length,
    setupFeePerLine,
    initialFeesArray: initialFees,
  });

  // Critical validation checks
  if (isNaN(setupFeePerLine)) {
    const errorMsg = `Invalid setup fee calculation: setupFeePerLine is NaN. Total: ${totalSetupFees}, Lines: ${quoteItems.length}`;
    console.error('[Quote Conversion ERROR]', errorMsg);
    throw new Error(errorMsg);
  }

  if (setupFeePerLine < 0) {
    const errorMsg = `Invalid setup fee calculation: setupFeePerLine is negative (${setupFeePerLine}). Total: ${totalSetupFees}, Lines: ${quoteItems.length}`;
    console.error('[Quote Conversion ERROR]', errorMsg);
    throw new Error(errorMsg);
  }

  if (setupFeePerLine > 100000) {
    const errorMsg = `Suspiciously large setup fee per line: ${setupFeePerLine} AED. Total: ${totalSetupFees}, Lines: ${quoteItems.length}. Please verify initial fees are correct.`;
    console.error('[Quote Conversion ERROR]', errorMsg);
    throw new Error(errorMsg);
  }

  // 3.8 Combine all notes
  const allNotes = [
    quote.notes,
    creditTermsNote,
    securityNote
  ].filter(Boolean).join('\n\n');

  // 4. Map quote fields to corporate_leasing_agreements
  const agreementPayload = {
    // Auto-generated
    agreement_no: agreementNo,
    rental_type: "Corporate Leasing" as any,
    
    // === STEP 1: HEADER === (from Quote)
    legal_entity_id: quote.legal_entity_id,
    business_unit_id: quote.business_unit_id,
    opportunity_id: quote.opportunity_id,
    sales_office_id: quote.sales_office_id,
    sales_rep_id: quote.sales_rep_id,
    agreement_description: quote.quote_description,
    customer_segment: quote.customer_type === "Company" 
      ? "Enterprise" as any 
      : "SME" as any, // Person → SME (Individual doesn't exist in enum)
    customer_id: quote.customer_id,
    account_name: quote.account_name,
    bill_to_site_id: quote.customer_bill_to,
    project: quote.project,
    agreement_entry_date: quote.quote_entry_date,
    status: "draft" as any,
    version: quote.version || 1,
    agreement_date: quote.quote_date,
    agreement_type: quote.quote_type,
    currency: quote.currency || "AED",
    validity_date_to: quote.validity_date_to,
    contract_effective_from: quote.contract_effective_from,
    contract_effective_to: quote.contract_effective_to,
    contract_start_date: quote.contract_effective_from,
    contract_end_date: quote.contract_effective_to,
    duration_days: quote.duration_days,
    win_loss_reason: quote.win_loss_reason,
    
    // Pickup/Return Configuration
    pickup_type: quote.pickup_type,
    pickup_location_id: quote.pickup_location_id,
    pickup_customer_site_id: quote.pickup_customer_site_id,
    return_type: quote.return_type,
    return_location_id: quote.return_location_id,
    return_customer_site_id: quote.return_customer_site_id,
    
    // === STEP 2: COMMERCIAL/FINANCIAL === (from Quote)
    payment_terms_id: quote.payment_terms_id,
    credit_terms: creditTerms as any,
    billing_plan: quote.billing_plan,
    billing_start_date: quote.billing_start_date,
    billing_cycle: billingCycle as any,
    billing_day: "Anniversary" as any,
    proration_rule: quote.proration_rule,
    vat_percentage: quote.vat_percentage || 5,
    vat_code: quote.vat_percentage ? `UAE ${quote.vat_percentage}%` : "UAE 5%",
    default_price_list_id: quote.default_price_list_id,
    withholding_tax_percentage: quote.withholding_tax_percentage || 0,
    deposit_type: quote.deposit_type,
    default_deposit_amount: quote.default_deposit_amount,
    deposit_amount_aed: quote.default_deposit_amount,
    security_instrument: securityInstrument as any,
    default_advance_rent_months: quote.default_advance_rent_months,
    default_delivery_fee: 0,
    default_collection_fee: 0,
    annual_escalation_percentage: quote.annual_escalation_percentage || 0,
    initial_fees: quote.initial_fees || [],
    grace_period_days: quote.grace_period_days || 5,
    late_fee_percentage: quote.late_fee_percentage || 2,
    invoice_format: invoiceFormat as any,
    line_item_granularity: "Base Rent + Add-ons" as any,
    email_invoice_to_contact: quote.email_invoice_to_contact || false,
    invoice_contact_person_id: quote.contact_person_id || quote.invoice_contact_person_id,
    payment_method: quote.payment_method || 'bank-transfer',
    customer_po_no: quote.customer_po_number,
    payment_instructions: quote.payment_instructions,
    
    // === STEP 3: COVERAGE & SERVICES === (from Quote)
    insurance_coverage_package: quote.insurance_coverage_package || 'comprehensive',
    insurance_responsibility: "Included (Lessor)" as any,
    insurance_excess_aed: quote.insurance_excess_aed || 1500,
    insurance_glass_tire_cover: quote.insurance_glass_tire_cover ?? true,
    insurance_pai_enabled: quote.insurance_pai_enabled ?? false,
    insurance_territorial_coverage: quote.insurance_territorial_coverage || 'uae-only',
    insurance_coverage_summary: quote.insurance_coverage_summary,
    maintenance_included: quote.maintenance_included ?? false,
    maintenance_policy: quote.maintenance_included 
      ? ("Full (PM+wear)" as any) 
      : ("Customer" as any),
    maintenance_package_type: quote.maintenance_package_type || 'none',
    monthly_maintenance_cost_per_vehicle: quote.monthly_maintenance_cost_per_vehicle || 250,
    maintenance_plan_source: quote.maintenance_plan_source || 'internal',
    show_maintenance_separate_line: quote.show_maintenance_separate_line ?? true,
    maintenance_coverage_summary: quote.maintenance_coverage_summary,
    mileage_pooling_enabled: quote.mileage_pooling_enabled ?? false,
    pooled_mileage_allowance_km: quote.pooled_mileage_allowance_km,
    pooled_excess_km_rate: quote.pooled_excess_km_rate,
    default_addons: quote.default_addons || [],
    default_addons_summary: undefined,
    salik_darb_handling: "Rebill Actual (monthly)",
    tolls_admin_fee_model: "Per-invoice",
    traffic_fines_handling: "Auto Rebill + Admin Fee",
    admin_fee_per_fine_aed: 25,
    fuel_handling: "Customer Fuel",
    
    // === STEP 4: VEHICLES === (from Quote)
    agreement_items: quote.quote_items || [],
    
    // === MASTER AGREEMENT SPECIFIC === (Calculated/Defaulted)
    framework_model: frameworkModel as any,
    master_term: masterTerm as any,
    committed_fleet_size: quoteItems.length,
    co_terminus_lines: false,
    off_hire_notice_period: 30,
    early_termination_allowed: false,
    cost_allocation_mode: "Per Vehicle" as any,
    roadside_assistance_included: true,
    replacement_vehicle_included: true,
    replacement_sla_hours: undefined,
    registration_responsibility: "Lessor",
    workshop_preference: "OEM",
    
    // === TRACKING ===
    source_quote_id: quoteId,
    source_quote_no: quote.quote_number,
    created_by: quote.created_by,
    signed_date: null,
    notes: allNotes,
  };

  // 5. Insert corporate leasing agreement
  const { data: agreement, error: insertError } = await supabase
    .from("corporate_leasing_agreements")
    .insert([agreementPayload])
    .select()
    .single();

  if (insertError) throw insertError;

  // 6. Create lines from quote_items with contract numbers
  if (quoteItems.length > 0) {
    const lines = quoteItems.map((item: any, index: number) => {
      const lineNumber = index + 1;
      const contractNo = `${agreementNo}-${String(lineNumber).padStart(2, '0')}`;
      
      // Extract metadata from item
      const vehicleMeta = item._vehicleMeta || {};
      
      return {
        agreement_id: agreement.id,
        contract_no: contractNo,
        line_number: lineNumber,
        vehicle_class_id: item.vehicle_class_id,
        vehicle_id: item.vehicle_id,
        qty: item.quantity || 1,
        lease_start_date: item.pickup_at || quote.contract_effective_from,
        lease_end_date: item.return_at || quote.contract_effective_to,
        monthly_rate_aed: item.monthly_rate,
        contract_months: quote.duration_days ? Math.ceil(quote.duration_days / 30) : 12,
        mileage_allowance_km_month: item.mileage_package_km || item.included_km_per_month,
        excess_km_rate_aed: item.excess_km_rate || item.excess_km_charge,
        line_status: "draft",
        setup_fee_aed: setupFeePerLine,
        // Hydrate metadata
        make: vehicleMeta.make,
        model: vehicleMeta.model,
        model_year: vehicleMeta.year,
        exterior_color: vehicleMeta.color,
        item_code: vehicleMeta.item_code,
        item_description: vehicleMeta.item_description,
        category_name: vehicleMeta.category_name,
      };
    });

    const { error: linesError } = await supabase
      .from("corporate_leasing_lines")
      .insert(lines);

    if (linesError) {
      // Cleanup: delete the created agreement if lines fail
      await supabase
        .from("corporate_leasing_agreements")
        .delete()
        .eq("id", agreement.id);
      
      throw linesError;
    }
  }

  // 7. Update quote with conversion tracking (bi-directional link)
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      converted_to_agreement: true,
      agreement_id: agreement.id,
      agreement_no: agreementNo,
      conversion_date: new Date().toISOString(),
      converted_by: quote.created_by,
      status: "converted",
    })
    .eq("id", quoteId);

  if (updateError) throw updateError;

  // 8. Return agreement ID
  return agreement.id;
};
