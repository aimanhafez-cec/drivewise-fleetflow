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

  // Debug: Verify agreement_items before insert
  const itemsArray = Array.isArray(agreementPayload.agreement_items) ? agreementPayload.agreement_items : [];
  console.log('[Quote Conversion] agreement_items being saved:', {
    quoteNumber: quote.quote_number,
    itemsCount: itemsArray.length,
    firstItem: itemsArray[0],
    agreementNo,
  });

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
      
      // Calculate duration_months from dates or use duration_months field
      let durationMonths = item.duration_months || item.lease_term_months;

      // Priority 1: Calculate from actual pickup/return dates
      if (!durationMonths && item.pickup_at && item.return_at) {
        try {
          const from = new Date(item.pickup_at);
          const to = new Date(item.return_at);
          
          // Validate dates are valid
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            // Calculate months difference properly
            const yearsDiff = to.getFullYear() - from.getFullYear();
            const monthsDiff = to.getMonth() - from.getMonth();
            const daysDiff = to.getDate() - from.getDate();
            
            // Calculate total months
            durationMonths = yearsDiff * 12 + monthsDiff;
            
            // If day difference suggests we should round up, add 1
            if (daysDiff > 0) {
              durationMonths += 1;
            }
            
            console.log('[Duration Calc] From item dates:', { from, to, durationMonths });
          }
        } catch (error) {
          console.warn('[Duration Calc] Item date parsing failed:', error);
        }
      }

      // Priority 2: Use quote contract dates if item dates unavailable
      if (!durationMonths && quote.contract_effective_from && quote.contract_effective_to) {
        try {
          const from = new Date(quote.contract_effective_from);
          const to = new Date(quote.contract_effective_to);
          
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            const yearsDiff = to.getFullYear() - from.getFullYear();
            const monthsDiff = to.getMonth() - from.getMonth();
            const daysDiff = to.getDate() - from.getDate();
            
            durationMonths = yearsDiff * 12 + monthsDiff;
            if (daysDiff > 0) {
              durationMonths += 1;
            }
            
            console.log('[Duration Calc] From quote dates:', { from, to, durationMonths });
          }
        } catch (error) {
          console.warn('[Duration Calc] Quote date parsing failed:', error);
        }
      }

      // Priority 3: Fallback to duration_days with proper rounding
      if (!durationMonths && quote.duration_days) {
        // Use Math.round instead of Math.ceil to avoid inflating months
        // 365 days = 12.02 months → rounds to 12 (correct)
        // 375 days = 12.35 months → rounds to 12 (correct)
        // 390 days = 12.85 months → rounds to 13 (correct)
        durationMonths = Math.round(quote.duration_days / 30.44);
        console.log('[Duration Calc] From days:', { days: quote.duration_days, durationMonths });
      }

      // Priority 4: Default fallback
      if (!durationMonths) {
        durationMonths = 12;
        console.warn('[Duration Calc] Using default 12 months - no data available');
      }
      
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
        contract_months: durationMonths,
        mileage_allowance_km_month: item.mileage_package_km || item.included_km_per_month,
        excess_km_rate_aed: item.excess_km_rate || item.excess_km_charge,
        line_status: "draft",
        setup_fee_aed: setupFeePerLine,
        
        // Delivery & Collection settings from item OR quote header
        pickup_type: item.pickup_type || quote.pickup_type,
        pickup_location_id: item.pickup_location_id || quote.pickup_location_id,
        pickup_customer_site_id: item.pickup_customer_site_id || quote.pickup_customer_site_id,
        return_type: item.return_type || quote.return_type,
        return_location_id: item.return_location_id || quote.return_location_id,
        return_customer_site_id: item.return_customer_site_id || quote.return_customer_site_id,
        delivery_fee: item.delivery_fee ?? 0,
        collection_fee: item.collection_fee ?? 0,
        
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

  // 7. Copy latest approved cost sheet if it exists
  const { data: latestApprovedCS } = await supabase
    .from('quote_cost_sheets')
    .select('*')
    .eq('quote_id', quoteId)
    .eq('status', 'approved')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestApprovedCS) {
    // Extract reference number from quote cost sheet: Q-2025-4789-CS-V1 → 2025-4789
    const csMatch = latestApprovedCS.cost_sheet_no?.match(/-CS-V(\d+)$/);
    const versionNumber = csMatch ? csMatch[1] : '1';
    const referenceMatch = quote.quote_number?.match(/QUO-(\d+)/);
    const reference = referenceMatch ? `2025-${referenceMatch[1]}` : '2025-000';
    
    // Create new cost sheet number: A-2025-4789-CS-V1
    const newCostSheetNo = `A-${reference}-CS-V${versionNumber}`;
    
    // Copy cost sheet
    const { data: newCS, error: csError } = await supabase
      .from('quote_cost_sheets')
      .insert({
        corporate_leasing_agreement_id: agreement.id,
        quote_id: null,
        cost_sheet_no: newCostSheetNo,
        version: latestApprovedCS.version,
        financing_rate_percent: latestApprovedCS.financing_rate_percent,
        overhead_percent: latestApprovedCS.overhead_percent,
        target_margin_percent: latestApprovedCS.target_margin_percent,
        residual_value_percent: latestApprovedCS.residual_value_percent,
        notes_assumptions: latestApprovedCS.notes_assumptions,
        status: 'approved',
        source_cost_sheet_id: latestApprovedCS.id,
        approved_by: latestApprovedCS.approved_by,
        approved_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (!csError && newCS) {
      // Copy cost sheet lines
      const { data: lines } = await supabase
        .from('quote_cost_sheet_lines')
        .select('*')
        .eq('cost_sheet_id', latestApprovedCS.id);
      
      if (lines && lines.length > 0) {
        const newLines = lines.map(line => ({
          cost_sheet_id: newCS.id,
          line_no: line.line_no,
          vehicle_class_id: line.vehicle_class_id,
          vehicle_id: line.vehicle_id,
          lease_term_months: line.lease_term_months,
          acquisition_cost_aed: line.acquisition_cost_aed,
          residual_value_percent: line.residual_value_percent,
          maintenance_per_month_aed: line.maintenance_per_month_aed,
          insurance_per_month_aed: line.insurance_per_month_aed,
          registration_admin_per_month_aed: line.registration_admin_per_month_aed,
          other_costs_per_month_aed: line.other_costs_per_month_aed,
          total_cost_per_month_aed: line.total_cost_per_month_aed,
          suggested_rate_per_month_aed: line.suggested_rate_per_month_aed,
          quoted_rate_per_month_aed: line.quoted_rate_per_month_aed,
          actual_margin_percent: line.actual_margin_percent,
        }));
        
        await supabase.from('quote_cost_sheet_lines').insert(newLines);
      }
    }
  }

  // 8. Update quote with conversion tracking (bi-directional link)
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

  // 9. Return agreement ID
  return agreement.id;
};
