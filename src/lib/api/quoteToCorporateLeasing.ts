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
  if (formatLower === "per vehicle" || formatLower === "per-vehicle") {
    invoiceFormat = "Per Vehicle";
  } else if (formatLower === "per cost center" || formatLower === "per-cost-center") {
    invoiceFormat = "Per Cost Center";
  }
  
  // 3.4 Map credit terms (valid values: "Net 15", "Net 30", "Net 45", "Custom")
  let creditTerms: "Net 15" | "Net 30" | "Net 45" | "Custom" = "Net 30";
  let creditTermsNote = "";
  const termsLower = (quote.payment_terms_id || "").toString().toLowerCase().trim();
  
  switch (termsLower) {
    case "net 15": creditTerms = "Net 15"; break;
    case "net 30": creditTerms = "Net 30"; break;
    case "net 45": creditTerms = "Net 45"; break;
    case "immediate":
      creditTerms = "Custom";
      creditTermsNote = "Original credit terms: Immediate payment required";
      break;
    default:
      if (termsLower) creditTermsNote = `Original credit terms: ${termsLower}`;
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
    agreement_no: agreementNo,
    rental_type: "Corporate Leasing" as any,
    customer_id: quote.customer_id,
    legal_entity_id: quote.legal_entity_id,
    bill_to_site_id: quote.customer_bill_to,
    credit_terms: creditTerms as any,
    contract_start_date: quote.contract_effective_from,
    contract_end_date: quote.contract_effective_to,
    billing_cycle: billingCycle as any,
    billing_day: "Anniversary" as any,
    invoice_format: invoiceFormat as any,
    insurance_responsibility: "Included (Lessor)" as any,
    insurance_excess_aed: quote.insurance_excess_aed || 1500,
    maintenance_policy: quote.maintenance_included
      ? ("Full (PM+wear)" as any)
      : ("Customer" as any),
    roadside_assistance_included: true,
    replacement_vehicle_included: true,
    admin_fee_per_fine_aed: 25,
    security_instrument: securityInstrument as any,
    deposit_amount_aed: quote.default_deposit_amount,
    currency: quote.currency || "AED",
    vat_code: "UAE 5%",
    status: "draft" as any,
    signed_date: null,
    notes: allNotes,
    created_by: quote.created_by,
    customer_po_no: quote.customer_po_number,
    source_quote_id: quoteId,
    source_quote_no: quote.quote_number,
    cost_allocation_mode: "Per Vehicle" as any,
    framework_model: frameworkModel as any,
    master_term: masterTerm as any,
    registration_responsibility: "Lessor",
    workshop_preference: "OEM",
    salik_darb_handling: "Rebill Actual (monthly)",
    tolls_admin_fee_model: "Per-invoice",
    traffic_fines_handling: "Auto Rebill + Admin Fee",
    fuel_handling: "Customer Fuel",
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
