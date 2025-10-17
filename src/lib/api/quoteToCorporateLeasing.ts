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

  // 3. Map quote fields to corporate_leasing_agreements with source tracking
  const agreementPayload = {
    agreement_no: agreementNo,
    rental_type: "Corporate Leasing" as any,
    customer_id: quote.customer_id,
    legal_entity_id: quote.legal_entity_id,
    business_unit_id: quote.business_unit_id,
    bill_to_site_id: quote.customer_bill_to,
    credit_terms: quote.payment_terms_id || ("Net 30" as any),
    contract_start_date: quote.contract_effective_from,
    contract_end_date: quote.contract_effective_to,
    billing_cycle: quote.billing_plan || ("Monthly" as any),
    billing_day: "Anniversary" as any,
    invoice_format: quote.invoice_format || ("Consolidated" as any),
    insurance_responsibility: "Included (Lessor)" as any,
    insurance_excess_aed: quote.insurance_excess_aed || 1500,
    maintenance_policy: quote.maintenance_included
      ? ("Full (PM+wear)" as any)
      : ("Customer" as any),
    roadside_assistance_included: true,
    replacement_vehicle_included: true,
    admin_fee_per_fine_aed: 25,
    security_instrument:
      quote.deposit_type === "refundable"
        ? ("Refundable Deposit" as any)
        : ("None" as any),
    deposit_amount_aed: quote.default_deposit_amount,
    currency: quote.currency || "AED",
    vat_code: "UAE 5%",
    status: "draft" as any, // Start as draft, will be signed later
    signed_date: null, // Not signed yet
    notes: quote.notes,
    created_by: quote.created_by,
    customer_po_no: quote.customer_po_number,
    // Source quote tracking
    source_quote_id: quoteId,
    source_quote_no: quote.quote_number,
    // Required fields
    cost_allocation_mode: "Per Vehicle" as any,
    framework_model: "Fleet Replacement" as any,
    master_term: "12 months" as any,
  };

  // 4. Insert corporate leasing agreement
  const { data: agreement, error: insertError } = await supabase
    .from("corporate_leasing_agreements")
    .insert([agreementPayload])
    .select()
    .single();

  if (insertError) throw insertError;

  // 5. Create lines from quote_items with contract numbers
  const quoteItems = Array.isArray(quote.quote_items) ? quote.quote_items : [];
  if (quoteItems.length > 0) {
    const lines = quoteItems.map((item: any, index: number) => {
      const lineNumber = index + 1;
      const contractNo = `${agreementNo}-${String(lineNumber).padStart(2, '0')}`;
      
      return {
        agreement_id: agreement.id,
        contract_no: contractNo,
        line_number: lineNumber,
        vehicle_class_id: item.vehicle_class_id,
        vehicle_id: item.vehicle_id,
        qty: item.quantity || 1,
        lease_start_date: quote.contract_effective_from,
        monthly_rate_aed: item.monthly_rate,
        contract_months: quote.duration_days
          ? Math.ceil(quote.duration_days / 30)
          : 12,
        mileage_allowance_km_month: item.included_km_per_month,
        excess_km_rate_aed: item.excess_km_charge,
        line_status: "draft", // Start as draft
      };
    });

    const { error: linesError } = await supabase
      .from("corporate_leasing_lines")
      .insert(lines);

    if (linesError) throw linesError;
  }

  // 6. Update quote with conversion tracking (bi-directional link)
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      converted_to_agreement: true,
      agreement_id: agreement.id,
      agreement_no: agreementNo,
      conversion_date: new Date().toISOString(),
      converted_by: quote.created_by,
      status: "accepted", // Keep as accepted, not "converted"
    })
    .eq("id", quoteId);

  if (updateError) throw updateError;

  // 7. Return agreement ID
  return agreement.id;
};
